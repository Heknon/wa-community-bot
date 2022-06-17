import { userRepository } from "../constants/services";
import UserModel from "../database/models/user/user_model";

export default class User {
    public model: UserModel;

    constructor(model: UserModel) {
        this.model = model;
    }

    public static fromModel(user: UserModel): User | null | undefined {
        return new User(user);
    }

    public static async fromJID(jid: string): Promise<User | undefined> {
        return await userRepository.getUser(jid) ?? undefined;
    }
}