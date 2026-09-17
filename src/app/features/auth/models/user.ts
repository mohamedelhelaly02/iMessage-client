export interface IUser {
    id: string,
    displayName: string,
    userName: string | null,
    email: string | null,
    profilePictureUrl: string | null,
    lastSeenAtUtc: string | null
}