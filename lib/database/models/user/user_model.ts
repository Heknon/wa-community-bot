import { ObjectId } from "bson";
import ContactModel from "./contact_model";
import { PrivilegeLevel } from "./privilege_level";

export default class UserModel {
    public _id: ObjectId;
    public contact: ContactModel;
    public name: string;

    public privilegeLevel: number;

    constructor(
        _id: ObjectId,
        contact: ContactModel,
        name: string,
        privilegeLevel: number,
    ) {
        this._id = _id;
        this.contact = contact;
        this.name = name;
        this.privilegeLevel = privilegeLevel;
    }

    public toMap() {
        return {
            '_id': this._id,
            'contact': this.contact.toMap(),
            'name': this.name,
            'privilege_level': this.privilegeLevel,
        }
    }

    public static fromMap(map: Map<string, object>) {
        return new UserModel(
            map['_id'],
            ContactModel.fromMap(map['contact']),
            map['name'],
            map['privilege_level'] ?? 0
        )
    }
}