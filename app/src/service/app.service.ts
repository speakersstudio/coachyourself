import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';
import { UrlSegment } from '@angular/router';

import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import {API} from '../constants';

import { AppHttp } from '../data/app-http';

import { User } from '../model/user';
import { Team } from '../model/team';
import { Package } from '../model/package';
import { PackageConfig } from '../model/config';

@Injectable()
export class AppService {

    // private packageUrl = '/api/package/';

    // private userValidateUrl = '/api/user/validate';
    // private teamValidateUrl = '/api/team/validate';

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
                    return 'That email address is already registered on ImprovPlus.';
                } else {
                    return '';
                }
            })
    }

    validateTeam (team: Team): Promise<string> {
        return this.http.post(API.validateTeam, team)
            .toPromise()
            .then(response => {
                let data = response.json();
                if (data.conflict == 'name') {
                    return 'A team with that name is already registered on ImprovPlus';
                } else {
                    return '';
                }
            });
    }

    /**
     * Get all of the available packages!
     */
    private _packagePromise: Promise<Package[]>;
    private _getPackages(): Promise<Package[]> {
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

    getPackages(userType: string, team: boolean): Promise<Package[]> {
        let options: Package[] = [];

        // return this.getSubscriptionPackage(userType, team)
        //     .then(pkg => {
        //         options.push(pkg);

        //         return this._getPackages()
        //     })
        return this._getPackages()
            .then(packages => {

                if (userType == 'facilitator') {
                    if (!team) {
                        packages.forEach(p => {
                            let copy = Object.assign({}, p);
                            options.push(copy);
                        });
                    } else {
                        packages.forEach(p => {
                            let copy = Object.assign({}, p);
                            // the facilitator team packages are more expensive
                            copy.price += this.config.fac_team_package_markup;
                            options.push(copy);
                        });
                    }
                }

                return options.sort((a, b) => {
                    return a.price > b.price ? -1 : 1;
                });
            })
    }

    getSubscriptionPackage(userType: string, team: boolean): Promise<Package> {
        return this.getPackageConfig()
            .then(config => {
                let subOption = new Package();
                subOption._id = 'sub';

                if (userType == 'facilitator') {
                    if (!team) {
                        subOption.name = 'Individual Facilitator Subscription';
                        subOption.price = config.fac_sub_price;

                        subOption.description = [
                            "Gain access to the the app for one year.",
                            "Browse and purchase from our entire catalogue of facilitation materials.",
                            "Utilize the database of over 200 Improv Exercises."
                        ];

                    } else {
                        subOption.name = 'Facilitator Team Subscription';
                        subOption.price = config.fac_team_sub_price;

                        subOption.description = [
                            "Your team can share and collaborate with the ImprovPlus app.",
                            "Browse and purchase from our entire catalogue of facilitation materials.",
                            "Utilize the database of over 200 Improv Exercises."
                        ];
                    }
                } else {
                    if (!team) {
                        subOption.name = 'Individual Improviser Subscription';
                        subOption.price = config.improv_sub_price;

                        subOption.description = [
                            "Gain access to the app for one year.",
                            "Browse the database of over 200 Improv Games.",
                            "Join the ever-growing ImprovPlus community."
                        ];
                    } else {
                        subOption.name = 'Improviser Team Subscription';
                        subOption.price = config.improv_team_sub_price;

                        subOption.description = [
                            'Access powerful marketing and collaboration tools.',
                            'Browse the database of over 200 Improv Games.',
                            "Join the ever-growing ImprovPlus community."
                        ];
                    }
                }

                return subOption;
            });
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

}