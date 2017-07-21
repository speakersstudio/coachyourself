import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import { AppHttp } from '../data/app-http';

import {API} from '../constants';

import { PackageConfig } from '../model/config';

import { Package } from '../model/package';
import { Purchase, PurchaseOther, PurchaseMaterial, PurchasePackage } from '../model/purchase';
import { MaterialItem, MaterialItemVersion } from '../model/material-item';
import { Subscription } from '../model/subscription';

import { User } from '../model/user';
import { UserService } from './user.service';

@Injectable()
export class CartService {
    // private chargeUrl = "/charge";
    // private signupUrl = "/signup";
    // private configUrl = "/packageconfig";

    private purchase: Purchase = new Purchase();
    private user: User;

    constructor(
        private http: AppHttp,
        private userService: UserService
        ) { }

    reset(): void {
        this.purchase = new Purchase();
        this.purchase.packages = [];
        this.purchase.materials = [];
        this.purchase.other = [];
    }

    addPackage(pack: Package): Purchase {
        this.purchase.packages.push({
            package: pack,
            price: pack.price
        });
        this.purchase.total += pack.price;

        return this.purchase;
    }

    addSubscription(role: number) {
        let sub = new PurchaseOther();
        sub.key = "subscription";
        sub.params = {
            role: role
        }

        // don't duplicate the subscription item
        let index = -1;
        this.purchase.other.forEach((o, i) => {
            if (o.key == 'subscription') {
                index = i;
            }
        });
        this.purchase.other.splice(index, 1, sub);
    }

    setUser(user: User): void {
        this.user = user;
    }

    charge(token: String): Promise<User> {
        return this.http.post(API.charge, {
            stripeToken: token,
            purchase: this.purchase,
            user: this.user
        }).toPromise()
            .then(result => {
                return result.json() as User;
            })
    }

    signup(token: string, email: string, password: string, userName: string, teamName: string): Promise<User> {
        // if (pack && pack._id !== 'sub') {
        //     this.addPackage(pack);
        // }
        // if (role) {
        //     this.addSubscription(role);
        // }
        return this.http.post(API.signup, {
            stripeToken: token,
            purchase: this.purchase,
            email: email,
            password: password,
            userName: userName,
            teamName: teamName
        }).toPromise()
            .then(result => {
                return result.json() as User;
            })
    }
}