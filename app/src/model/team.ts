import {Purchase} from './purchase';
import {MaterialItem} from './material-item';
import {Subscription} from './subscription';
import {User} from './user';
import {Library} from './library';

export class Team {
    _id: string;
    name: string;
    description: string;
    phone: string;
    email: string;
    company: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    country: string;
    url: string;

    dateAdded: Date;
    dateModified: Date;

    lookingForMembers: Boolean;

    admins: string[];
    members: string[];

    subscription: Subscription;
    purchases: Purchase[];

    library?: Library;
}