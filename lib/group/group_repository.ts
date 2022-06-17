import { isJidGroup, jidDecode, jidNormalizedUser } from "@adiwajshing/baileys";
import { ObjectId, ReturnDocument, WithId } from "mongodb";
import { groupsCollection, usersCollection } from "../database";
import GroupModel from "../database/models/group/group_model";
import { GroupMembershipLevel } from "../database/models/group_membership_type";
import ContactModel from "../database/models/user/contact_model";
import { PrivilegeLevel } from "../database/models/user/privilege_level";
import UserModel from "../database/models/user/user_model";
import Group from "./group";

export default class GroupRepository {
    private groups: Map<string, Group> = new Map();

    public async getGroup(jid: string | undefined, update: boolean = false): Promise<Group | undefined | null> {
        if (!jid) return;
        jid = jidNormalizedUser(jid);
        if (!jid || !isJidGroup(jid)) return;

        let group: Group | undefined | null = this.groups[jid];

        if (update || !group) {
            group = await this.fetchGroup(jid)
        }

        if (group) this.updateGroupLocal(group);
        return group;
    }

    public async updateGroupDB(
        jid: string | undefined,
        { membership, sentDisclaimer }:
            { membership?: GroupMembershipLevel, sentDisclaimer?: boolean }): Promise<Group | undefined> {
        if (!jid) return;

        if (!this.groups.has(jid)) {
            const group = await this.fetchGroup(jid);
            if (group) this.updateGroupLocal(group);
        }
        jid = jidNormalizedUser(jid);

        if (!jid || !this.groups.has(jid)) return;
        const update = new Map();
        if (membership) update.set('membership', membership);
        if (sentDisclaimer) update.set('sent_disclaimer', sentDisclaimer);
        if (!update || update.size === 0) return this.groups[jid];

        const res = await groupsCollection.findOneAndUpdate({ jid }, { "$set": update }, { returnDocument: ReturnDocument.AFTER });
        if (res.ok) {
            const model = res.value ? Group.fromModel(GroupModel.fromMap(res.value as WithId<Map<string, object>>)) ?? undefined : undefined;
            if (model) this.updateGroupLocal(model);
            return model;
        }
        const model = (await this.fetchGroup(jid)) ?? undefined;
        if (model) this.updateGroupLocal(model);
        return model;
    }

    public updateGroupLocal(group: Group): Group {
        this.groups.set(group.model.jid, group);
        return group;
    }

    public async getGroups(update: boolean = false): Promise<Array<Group> | undefined | null> {
        if (!update) {
            return Array.from(this.groups.values());
        }

        const groups = await this.fetchGroups();
        if (!groups) return Array.from(this.groups.values());

        for (const group of groups) {
            this.updateGroupLocal(group);
        }

        return Array.from(this.groups.values());
    }

    public async fetchGroup(jid: string | undefined): Promise<Group | undefined | null> {
        if (!jid) return;
        jid = jidNormalizedUser(jid);
        if (!jid) return;

        let group = await groupsCollection.findOne<Map<string, object>>({ jid })

        const res = group ? Group.fromModel(GroupModel.fromMap(group)) : undefined;
        if (!res) return;
        this.updateGroupLocal(res);
        return res;
    }

    private async fetchGroups(): Promise<Array<Group> | undefined | null> {
        const docs = groupsCollection.find<Map<string, object>>({});

        const result: Array<Group> = []
        for await (const doc of docs) {
            if (!doc) continue;
            const model = GroupModel.fromMap(doc);
            const group = Group.fromModel(model)
            if (group) result.push(group);
        }

        return result;
    }

    public async createGroup(
        jid: string | undefined,
        groupMembershipType: GroupMembershipLevel,
        sentDisclaimer: boolean
    ): Promise<Group | undefined | null> {
        if (!jid) return;
        jid = jidNormalizedUser(jid);
        if (!jid) return;

        const groupModel = new GroupModel(
            new ObjectId(),
            jid,
            groupMembershipType,
            sentDisclaimer
        );

        await groupsCollection.insertOne(groupModel.toMap())
        const res = Group.fromModel(groupModel);
        if (!res) return;
        this.updateGroupLocal(res);
        return res;
    }

    public async createBasicGroup(
        jid: string,
    ): Promise<Group | undefined | null> {
        return this.createGroup(
            jid,
            GroupMembershipLevel.NonMember,
            false,
        );
    }
}