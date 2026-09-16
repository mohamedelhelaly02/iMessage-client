export interface IParticipant {
    displayName: string,
    pictureUrl: string | null,
    role: string,
    userId: string
}

export interface IConversation {
    title: string | null,
    conversationType: string,
    createdAtUtc: string,
    createdByUserId: string,
    id: string,
    lastMessageAtUtc: string | null,
    participants: IParticipant[]
}


