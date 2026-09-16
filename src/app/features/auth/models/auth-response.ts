import { IUser } from "./user";

export interface AuthResponse {
    token: string;
    user: IUser
}