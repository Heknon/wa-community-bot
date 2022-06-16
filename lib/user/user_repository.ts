import { isJidUser, jidDecode, jidEncode, WASocket } from "@adiwajshing/baileys";
import { ObjectId } from "mongodb";
import { usersCollection } from "../database";
import ContactModel from "../database/models/user/contact_model";
import { PrivilegeLevel } from "../database/models/user/privilege_level";
import UserModel from "../database/models/user/user_model";
import User from "./user";

export default class UserRepository {
    private users: Map<string, User> = new Map();

    public async getUser(jid: string, pushName: string | undefined = undefined, update: boolean = false, create: boolean = true): Promise<User | undefined | null> {
        if (!isJidUser(jid)) return;
        
        let user: User | undefined | null = this.users[jid];

        if (update || !user) {
            user = await this.fetchUser(jid)

            if (!user && create) {
                try {
                    user = await this.createBasicUser(jid, pushName);
                } catch (e) {
                    user = await this.fetchUser(jid);
                }
            }
        }

        if (user) this.users.set(jid, user);
        return user;
    }

    public async getUsers(update: boolean = false): Promise<Array<User> | undefined | null> {
        if (!update) {
            return Array.from(this.users.values());
        }

        const users = await this.fetchUsers();
        if (!users) return Array.from(this.users.values());

        for (const user of users) {
            this.users.set(user.model.contact.phone + '@s.whatsapp.net', user);
        }

        return Array.from(this.users.values());
    }

    private async fetchUser(jid: string): Promise<User | undefined | null> {
        const phone = jidDecode(jid).user;
        const phoneNoCode = phone.length != 10 ? '0' + phone.slice(3) : phone;

        let user = await usersCollection.findOne<Map<string, object>>({ "contact.phone": phone })
        if (!user) {
            user = await usersCollection.findOne<Map<string, object>>({ "contact.phone": phoneNoCode });
        }

        return user ? User.fromModel(UserModel.fromMap(user!)) : undefined;
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
        contact: ContactModel,
        privilegeLevel: PrivilegeLevel = 0,
    ): Promise<User | undefined | null> {
        const userModel = new UserModel(
            new ObjectId(),
            contact,
            name,
            privilegeLevel,
        );

        await usersCollection.insertOne(userModel.toMap())
        return User.fromModel(userModel);
    }

    public async createBasicUser(
        jid: string,
        name: string | undefined | null
    ): Promise<User | undefined | null> {
        return this.createUser(
            name ?? '',
            new ContactModel(undefined, jidDecode(jid).user, undefined, undefined),
            undefined,
        );
    }
}