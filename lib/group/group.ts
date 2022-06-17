import { groupRepository } from "../constants/services";
import GroupModel from "../database/models/group/group_model";

export default class Group {
    public model: GroupModel;

    constructor(model: GroupModel) {
        this.model = model;
    }

    public static fromModel(user: GroupModel): Group | null | undefined {
        return new Group(user);
    }

    public static async fromJID(jid: string): Promise<Group | undefined> {
        return await groupRepository.getGroup(jid) ?? undefined;
    }
}