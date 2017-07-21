export class NameVote {
    _id: string;
    name: string;
    addedUser: string;
    dateAdded: Date;
}

export class Name {
    _id: string;
    name: string;
    weight: number;
    votes: NameVote[];
    addedUser: string;
    modifiedUser: string;
    dateAdded: Date;
    dateModified: Date;
    game: string;
}
