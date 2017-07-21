export class MaterialItemVersion {
    "_id": string;
    "ver": number;
    "description": string;
    "extension": string;
    "dateAdded": Date;
}

export class MaterialItem {
    "_id": string;
    "name": string;
    "description": string;
    "price": number;
    "versions": MaterialItemVersion[];
    "visible": boolean;
    "tags": string[];
    "color": string;
}