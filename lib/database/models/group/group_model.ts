import { ObjectId } from "mongodb";
import { GroupMembershipLevel } from "../group_membership_type";
import JIDMemberModel from "../jid_member_model";

export default class GroupModel implements JIDMemberModel {
    public _id: ObjectId;
    public jid: string;
    public membership: GroupMembershipLevel;
    public sentDisclaimer: boolean;

    constructor(_id: ObjectId, jid: string, membership: GroupMembershipLevel, sentDisclaimer: boolean) {
        this._id = _id;
        this.jid = jid;
        this.membership = membership;
        this.sentDisclaimer = sentDisclaimer;
    }

    public toMap() {
        return {
            '_id': this._id,
            'jid': this.jid,
            'membership': this.membership,
            'sent_disclaimer': this.sentDisclaimer,
        };
    }

    public static fromMap(map: Map<string, object>) {
        return new GroupModel(
            map['_id'],
            map['jid'],
            map['membership'],
            map['sent_disclaimer']
        );
    }
}