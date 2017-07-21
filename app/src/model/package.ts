import { MaterialItem } from './material-item';

export class Package {
    "_id": string;
    "slug": string;
    "name": string;
    "description": string[];
    "color": string;
    "price": number;
    "dateAdded": Date;
    "dateModified": Date;
    "materials": MaterialItem[];
    "packages": Package[];
    "visible": boolean;
}