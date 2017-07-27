import { Injectable } from '@angular/core';
import { Headers, Response } from '@angular/http';

import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AppHttp } from '../data/app-http';
import { API } from '../constants';

import { Util } from '../util/util';

import { User } from "../model/user";
import { Purchase } from '../model/purchase';

import { Library } from '../model/library';

class LoginResponse {
    user: User;
    token: string;
    expires: number;
}

@Injectable()
export class UserService {

    private USER_STORAGE_KEY = 'coachyourself_user';

    loggedInUser: User;

    isLoggingIn: boolean;
    loginPromise: Promise<User>;

    private logginStateSource = new Subject<User>();

    loginState$ = this.logginStateSource.asObservable();

    constructor(
        private http: AppHttp
    ) {
        this.loadUserData();
    }

    private loadUserData(): void {
        let data = localStorage.getItem(this.USER_STORAGE_KEY);
        if (data) {
            this.loggedInUser = JSON.parse(data) as User;
        } else {
            this.loggedInUser = null;
        }
    }

    private saveUserData(newUser: User): void {
        this.loggedInUser = newUser;

        // don't save the password
        this.loggedInUser.password = "";
        
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.loggedInUser));
    }

    private clearUserData(): void {
        this.loggedInUser = null;
        this._subscriptionPromise = null;
        localStorage.removeItem(this.USER_STORAGE_KEY);
    }

    checkTokenExpiration(): boolean {
        if (!this.http.checkTokenExpiration()) {
            this.clearUserData();
            return false;
        } else {
            return true;
        }
    }

    announceLoginState() {
        this.logginStateSource.next(this.loggedInUser);
    }

    login(email: string, password: string): Promise<User> {
        this.isLoggingIn = true;
        this.loginPromise = this.http.post(API.login, {
                email: email,
                password: password
            }).toPromise()
            .then(response => this._handleLoginRequest(response));
        
        return this.loginPromise;
    }

    recoverPassword(email: string): Promise<boolean> {
        return this.http.post(API.passwordRecovery, {
            email: email
        }).toPromise()
        .then(response => {
            if (response.status == 200) {
                return true;
            } else {
                return false;
            }
        })
    }

    checkPasswordRecoveryToken(token: string): Promise<boolean> {
        return this.http.post(API.passwordRecoveryTokenCheck, {
            token: token
        }).toPromise()
        .then(response => {
            let data = response.json();
            if (data['message'] && data['message'] == 'Okay') {
                return true;
            } else {
                return false;
            }
        })
    }

    changePassword(token: string, password: string): Promise<User> {
        return this.http.post(API.passwordChange, {
            password: password,
            token: token
        }).toPromise()
        .then(response => {
            return response.json() as User;
        })
    }

    refreshToken(): Promise<User> {
        if (this.checkTokenExpiration()) {
            this.isLoggingIn = true;
            this.loginPromise = this.http.post(API.refresh, {})
                .toPromise()
                .then(response => this._handleLoginRequest(response));
            
            return this.loginPromise;
        }
    }

    _handleLoginRequest(response: Response): User {
        this.isLoggingIn = false;
        if (response) {
            let responseData = response.json() as LoginResponse;
            this.http.setToken(responseData.token, responseData.expires);
            this.saveUserData(responseData.user);
            this.announceLoginState();
        } else {
            this._handleLogout();
        }

        return this.loggedInUser;
    }

    logout(silent?: boolean): Promise<boolean> {
        return this.http.post(API.logout, {})
            .toPromise()
            .then(() => {
                this._handleLogout();
                if (!silent) {
                    this.announceLoginState();
                }
                return true;
            });
    }

    private _handleLogout(): void {
        this.http.reset();
        this.clearUserData();
    }

    isLoggedIn(): boolean {
        return this.loggedInUser && true;
    }

    getLoggedInUser(): User {
        if (this.checkTokenExpiration()) {
            return this.loggedInUser;
        } else {
            return null;
        }
    }

    getUserName(): string {
        return this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName;
    }

    /**
     * Change information on the current user
     */
    updateUser(user: User): Promise<User> {
        return this.http.put(API.updateUser(user._id), user)
            .toPromise()
            .then((response) => {
                let user = response.json() as User;
                this.saveUserData(user);
                return this.loggedInUser;
            });
    }

    setPreference(key: string, val: string|boolean): Promise<User> {
        return this.http.post(API.userPreference(this.loggedInUser._id), {
            key: key,
            val: ''+val
        }).toPromise()
            .then((response) => {
                let user = response.json() as User;
                this.saveUserData(user);
                return this.loggedInUser;
            });
    }

    getPreference(key: string, def?: string): string {
        let value: string = def || '';

        if (this.loggedInUser.preferences) {
            this.loggedInUser.preferences.forEach(pref => {
                if (pref.key == key) {
                    value = pref.value;
                }
            });
        }

        return value;
    }

    can (key: string): boolean {
        if (!this.loggedInUser || !this.loggedInUser.actions || !this.loggedInUser.actions.length || this.isLocked()) {
            return false;
        } else {
            return this.loggedInUser.actions.indexOf(key) > -1;
        }
    }

    isSuperAdmin(): boolean {
        return this.loggedInUser && this.loggedInUser.superAdmin;
    }

    isLocked(): boolean {
        return this.loggedInUser.locked;
    }

    isExpired(user?: User): boolean {
        user = user || this.loggedInUser;
        return !user.subscription || (new Date(user.subscription.expiration)).getTime() <= Date.now();
    }

    /**
     * The following functions get various expanded properties on the user object. They don't change the logged in user data
     */
    fetchPurchases(): Promise<Purchase[]> {
        return this.http.get(API.userPurchases(this.loggedInUser._id))
            .toPromise()
            .then(response => {
                return response.json() as Purchase[];
            });
    }

    private _subscriptionPromise: Promise<User>;
    fetchSubscription(): Promise<User> {
        if (!this._subscriptionPromise) {
            this._subscriptionPromise = this.http.get(API.userSubscription(this.loggedInUser._id))
                .toPromise()
                .then(response => {
                    return response.json() as User;
                });
        }
        return this._subscriptionPromise;
    }

}