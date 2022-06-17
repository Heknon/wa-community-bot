import { ObjectId } from "bson";
import JIDMemberModel from "../jid_member_model";
import ContactModel from "./contact_model";
import { PrivilegeLevel } from "./privilege_level";

export default class UserModel implements JIDMemberModel {
    public _id: ObjectId;
    public jid: string;
    public sentDisclaimer: boolean;
    public contact: ContactModel;
    public name: string;

    public privilegeLevel: PrivilegeLevel;

    constructor(
        _id: ObjectId,
        jid: string,
        sentDisclaimer: boolean,
        contact: ContactModel,
        name: string,
        privilegeLevel: PrivilegeLevel
    ) {
        this._id = _id;
        this.jid = jid;
        this.sentDisclaimer = sentDisclaimer;
        this.contact = contact;
        this.name = name;
        this.privilegeLevel = privilegeLevel;
    }

    public toMap() {
        return {
            '_id': this._id,
            'jid': this.jid,
            'contact': this.contact.toMap(),
            'name': this.name,
            'privilege_level': this.privilegeLevel,
            'sent_disclaimer': this.sentDisclaimer
        }
    }

    public static fromMap(map: Map<string, object>) {
        return new UserModel(
            map['_id'],
            map['jid'],
            map['sent_disclaimer'],
            ContactModel.fromMap(map['contact']),
            map['name'],
            map['privilege_level'] ?? 0
        )
    }
}