import { MaterialItem } from './material-item';
import { Package } from './package';

import { User } from './user';
import { Team } from './team';
import { Subscription } from './subscription';

export class PurchaseOther {
    _id: string;
    key: string;
    description: string;
    params: object;
    price: number;
}

export class PurchasePackage {
    _id?: string;
    package: string|Package;
    price: number;
}

export class PurchaseMaterial {
    _id?: string;
    materialItem: string|MaterialItem;
    price: number;
}

export class Purchase {
    _id?: string;
    user?: string|User;
    team?: string|Team;
    date?: Date;
    materials?: PurchaseMaterial[];
    packages?: PurchasePackage[];
    // subscription?: string|Subscription;
    other?: PurchaseOther[];
    
    total: number = 0;
    refunded?: boolean;
}