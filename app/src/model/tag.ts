export class Tag {
    _id: string;
    legacyID: number;
    name: string;
    description: string;
    games: string[];
    notes: string[];
    addedUser: string;
    modifiedUser: string;
    dateAdded: Date;
    dateModified: Date;
}
