import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { UrlSegment } from '@angular/router';

import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import {API} from '../constants';

import { AppHttp } from '../data/app-http';

import { User } from '../model/user';
import { Package } from '../model/package';
import { PackageConfig } from '../model/config';

@Injectable()
export class AppService {

    private redirect: UrlSegment[];

    private config: PackageConfig;
    
    constructor(
        private http: AppHttp
    ) { }

    private handleError(error: any): Promise<any> {
        console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    }

    setRedirect (url: UrlSegment[]): void {
        this.redirect = url;
    }

    getRedirect (): UrlSegment[] {
        return this.redirect;
    }

    validateUser (user: User): Promise<string> {
        return this.http.post(API.validateUser, user)
            .toPromise()
            .then((response) => {
                let data = response.json();
                if (data.conflict == 'email') {
                    return 'That email address is already registered with us.';
                } else {
                    return '';
                }
            })
    }
    
    getPackageConfig(): Promise<PackageConfig> {
        if (this.config) {
            return new Promise((resolve, reject) => {
                resolve(this.config);
            });
        } else {
            return this.http.get(API.packageConfig)
                .toPromise()
                .then(result => {
                    this.config = result.json() as PackageConfig;
                    return this.config;
                });
        }
    }

    signup (email: string, password: string, name: string, token: string): Promise<User> {
        return this.http.post(API.signup, {
            stripeToken: token,
            email: email,
            password: password,
            name: name
        }).toPromise()
            .then(result => {
                return result.json() as User;
            });
    }

    /**
     * Get all of the available packages!
     */
    private _packagePromise: Promise<Package[]>;
    getPackages(): Promise<Package[]> {
        if (!this._packagePromise) {
            this._packagePromise = this.http.get(API.package)
                .toPromise()
                .then(response => {
                    let packages = response.json() as Package[];
                    return packages;
                })
                .catch(this.handleError);
        }
        return this._packagePromise;
    }

}