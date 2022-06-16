export default class ContactModel {
    public email: string | undefined | null;
    public phone: string | undefined | null;
    public facebook: string | undefined | null;
    public instagram: string | undefined | null;

    constructor(email: string | undefined | null, phone: string | undefined | null, facebook: string | undefined | null, instagram: string | undefined | null) {
        this.email = email;
        this.phone = phone;
        this.facebook = facebook;
        this.instagram = instagram;
    }


    public toMap() {
        return {
            'email': this.email,
            'phone': this.phone,
            'facebook': this.facebook,
            'instagram': this.instagram,
        }
    }

    public static fromMap(map: Map<string, object>) {
        return new ContactModel(
            map['email'],
            map['phone'],
            map['facebook'],
            map['instagram'],
        )
    }
}