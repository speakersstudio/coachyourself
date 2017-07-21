export class GameMetadata {
    [key:string]: any;

    _id: string;
    name: string;
    description: string;
    type: string;
    min: number;
    max: number;
    legacyID: number;
    games: string[];
    notes: string[];
    addedUser: string;
    modifiedUser: string;
    dateAdded: Date;
    dateModified: Date;
}