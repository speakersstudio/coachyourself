import { Name } from './name';
import { GameMetadata } from './game-metadata';
import { Note } from './note';
import { Tag } from './tag';

export class Game {
    [key:string]: any;

    _id: string;
    legacyID: number;
    names: Name[];
    description: string;
    duration: GameMetadata;
    playerCount: GameMetadata;
    notes: Note[];
    tags: string[]|Tag[];
    parent: string;
    addedUser: string;
    modifiedUser: string;
    dateAdded: Date;
    dateModified: Date;
}
