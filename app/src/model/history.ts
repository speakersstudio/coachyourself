import { User } from './user';

export class HistoryChange {
    property: string;
    old: object;
    new: object;
}

export class HistoryModel {
    user: User;
    action: string;
    target: string;
    reference: string;
    changes: HistoryChange[];
    date: string;
}