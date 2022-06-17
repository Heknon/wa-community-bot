import { isJidUser, jidNormalizedUser } from "@adiwajshing/baileys";
import { ObjectId, ReturnDocument, WithId } from "mongodb";
import { stringify } from "querystring";
import { usersCollection } from "../database";
import ContactModel from "../database/models/user/contact_model";
import { PrivilegeLevel } from "../database/models/user/privilege_level";
import UserModel from "../database/models/user/user_model";
import { normalizeJid } from "../utils/group_utils";
import User from "./user";

export default class UserRepository {
    private users: Map<string, User> = new Map();

    public async getUser(jid: string | undefined, update: boolean = false): Promise<User | undefined | null> {
        if (!jid) return;
        jid = normalizeJid(jid);

        if (!jid || !isJidUser(jid)) return;

        let user: User | undefined | null = this.users[jid];

        if (update || !user) {
            user = await this.fetchUser(jid)
        }

        if (user) this.updateUserLocal(user);
        return user;
    }

    public updateUserLocal(user: User): User {
        this.users.set(user.model.jid, user);
        return user;
    }

    public async updateUserDB(
        jid: string | undefined,
        { pushName, privilegeLevel, sentDisclaimer }:
            { pushName?: string, privilegeLevel?: PrivilegeLevel, sentDisclaimer?: boolean }
    ): Promise<User | undefined> {
        if (!jid) return;
        jid = jidNormalizedUser(jid);

        if (!jid || !isJidUser(jid)) return;

        if (!this.users.has(jid)) {
            const user = await this.fetchUser(jid);
            if (user) this.updateUserLocal(user);
        }

        if (!this.users.has(jid)) return;
        const update = new Map();
        if (pushName) update['name'] = pushName;
        if (privilegeLevel) update['privilege_level'] = privilegeLevel;
        if (sentDisclaimer) update['sent_disclaimer'] = sentDisclaimer;
        if (!update || update.size === 0) return this.users[jid];
        
        const res = await usersCollection.findOneAndUpdate({ jid }, { "$set": update }, { returnDocument: ReturnDocument.AFTER });
        if (res.ok) {
            const model = res.value ? User.fromModel(UserModel.fromMap(res.value as WithId<Map<string, object>>)) ?? undefined : undefined;
            if (model) this.updateUserLocal(model);
            return model;
        }

        const model = (await this.fetchUser(jid)) ?? undefined;
        if (model) this.updateUserLocal(model);
        return model;
    }

    public async getUsers(update: boolean = false): Promise<Array<User> | undefined | null> {
        if (!update) {
            return Array.from(this.users.values());
        }

        const users = await this.fetchUsers();
        if (!users) return Array.from(this.users.values());

        for (const user of users) {
            this.updateUserLocal(user);
        }

        return Array.from(this.users.values());
    }

    public async fetchUser(jid: string | undefined): Promise<User | undefined | null> {
        if (!jid) return;
        jid = jidNormalizedUser(jid);
        if (!jid) return;

        let user = await usersCollection.findOne<Map<string, object>>({ jid })

        return user ? User.fromModel(UserModel.fromMap(user)) : undefined;
    }

    private async fetchUsers(): Promise<Array<User> | undefined | null> {
        const docs = usersCollection.find<Map<string, object>>({});

        const result: Array<User> = []
        for await (const doc of docs) {
            if (!doc) continue;
            const model = UserModel.fromMap(doc);
            const user = User.fromModel(model)
            if (user) result.push(user);
        }

        return result;
    }

    public async createUser(
        name: string,
        jid: string | undefined,
        sentDisclaimer: boolean,
        contact: ContactModel,
        privilegeLevel: PrivilegeLevel = 0,
    ): Promise<User | undefined | null> {
        if (!jid) return;
        jid = jidNormalizedUser(jid);
        if (!jid) return;

        const userModel = new UserModel(
            new ObjectId(),
            jid,
            sentDisclaimer,
            contact,
            name,
            privilegeLevel,
        );

        await usersCollection.insertOne(userModel.toMap());
        const created = User.fromModel(userModel);
        if (!created) return;
        this.updateUserLocal(created);
        return created;
    }

    public async createBasicUser(
        jid: string,
        name: string | undefined | null,
        sentDisclaimer: boolean,
    ): Promise<User | undefined | null> {
        return this.createUser(
            name ?? '',
            jid,
            sentDisclaimer,
            new ContactModel(undefined, undefined, undefined),
            undefined,
        );
    }
}