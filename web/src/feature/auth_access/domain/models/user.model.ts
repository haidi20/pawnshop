export interface UserModel {
    id: number;
    username: string;
    passwordHash: string;
    fullName: string | null;
    email: string | null;
    phoneNumber: string | null;
    rememberToken: string | null;
    isActive: boolean;
    createdAt: string | null;
    updatedAt: string | null;
}
