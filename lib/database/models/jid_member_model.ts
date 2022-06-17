import { ObjectId } from "mongodb";

export default interface JIDMemberModel {
    _id: ObjectId;
    jid: string;
    sentDisclaimer: boolean;
}