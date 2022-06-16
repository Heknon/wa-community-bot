import TimestampedData from "../timestamped_data";

export default class MessageMetadata {
    public meta: Map<string, object>;

    constructor(meta: Map<string, object>) {
        this.meta = meta;
    }

    public toMap() {
        return {
            'meta': this.meta,
        }
    }

    public static fromMap(map: Map<string, object>) {
        return new MessageMetadata(
            map['meta']
        );
    }
}