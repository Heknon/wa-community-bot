import { isJidGroup, WASocket } from "@adiwajshing/baileys";

export async function getUserPrivilegeLevel(client: WASocket, jid: string, id: string): Promise<number> {
    if (!isJidGroup(jid)) return -1;

    const groupAdminMap = await getGroupPrivilegeMap(client, jid);

    const adminLevel = groupAdminMap[id] ?? 0;
    return adminLevel;
}

export async function getGroupPrivilegeMap(client: WASocket, jid: string) {
    const map = {};

    const groupMeta = await client.groupMetadata(jid);
    for (const participant of groupMeta.participants) {
        map[participant.id] = participant.admin == "superadmin" ? 2 : participant.admin == "admin" ? 1 : 0
    }

    return map;
}


export async function getBotPrivilegeLevel(client: WASocket, jid: string): Promise<number> {
    const groupAdminMap = await getGroupPrivilegeMap(client, jid);

    return groupAdminMap[getClientID(client)] ?? 0
}

export function normalizeUserId(id: string): string {
    return id.split(":")[0] + "@s.whatsapp.net";
}

export function getClientID(client: WASocket): string {
    return normalizeUserId(client.user.id);
}