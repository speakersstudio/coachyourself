import {User} from './user';

export class Invite {
    _id: string;
    user: string;
    date: Date;
    accepted: boolean;
    dateAccepted: Date;
    email: string;
    role: number;
    team: string;
    inviteUser: User;
}