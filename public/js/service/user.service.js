"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var Rx_1 = require("rxjs/Rx");
require("rxjs/add/operator/toPromise");
var app_http_1 = require("../data/app-http");
var constants_1 = require("../constants");
var LoginResponse = (function () {
    function LoginResponse() {
    }
    return LoginResponse;
}());
var UserService = (function () {
    function UserService(http) {
        this.http = http;
        this.USER_STORAGE_KEY = 'coachyourself_user';
        this.logginStateSource = new Rx_1.Subject();
        this.loginState$ = this.logginStateSource.asObservable();
        this.loadUserData();
    }
    UserService.prototype.loadUserData = function () {
        var data = localStorage.getItem(this.USER_STORAGE_KEY);
        if (data) {
            this.loggedInUser = JSON.parse(data);
        }
        else {
            this.loggedInUser = null;
        }
    };
    UserService.prototype.saveUserData = function (newUser) {
        this.loggedInUser = newUser;
        // don't save the password
        this.loggedInUser.password = "";
        localStorage.setItem(this.USER_STORAGE_KEY, JSON.stringify(this.loggedInUser));
    };
    UserService.prototype.clearUserData = function () {
        this.loggedInUser = null;
        this._subscriptionPromise = null;
        localStorage.removeItem(this.USER_STORAGE_KEY);
    };
    UserService.prototype.checkTokenExpiration = function () {
        if (!this.http.checkTokenExpiration()) {
            this.clearUserData();
            return false;
        }
        else {
            return true;
        }
    };
    UserService.prototype.announceLoginState = function () {
        this.logginStateSource.next(this.loggedInUser);
    };
    UserService.prototype.login = function (email, password) {
        var _this = this;
        this.isLoggingIn = true;
        this.loginPromise = this.http.post(constants_1.API.login, {
            email: email,
            password: password
        }).toPromise()
            .then(function (response) { return _this._handleLoginRequest(response); });
        return this.loginPromise;
    };
    UserService.prototype.recoverPassword = function (email) {
        return this.http.post(constants_1.API.passwordRecovery, {
            email: email
        }).toPromise()
            .then(function (response) {
            if (response.status == 200) {
                return true;
            }
            else {
                return false;
            }
        });
    };
    UserService.prototype.checkPasswordRecoveryToken = function (token) {
        return this.http.post(constants_1.API.passwordRecoveryTokenCheck, {
            token: token
        }).toPromise()
            .then(function (response) {
            var data = response.json();
            if (data['message'] && data['message'] == 'Okay') {
                return true;
            }
            else {
                return false;
            }
        });
    };
    UserService.prototype.changePassword = function (token, password) {
        return this.http.post(constants_1.API.passwordChange, {
            password: password,
            token: token
        }).toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    UserService.prototype.refreshToken = function () {
        var _this = this;
        if (this.checkTokenExpiration()) {
            this.isLoggingIn = true;
            this.loginPromise = this.http.post(constants_1.API.refresh, {})
                .toPromise()
                .then(function (response) { return _this._handleLoginRequest(response); });
            return this.loginPromise;
        }
    };
    UserService.prototype._handleLoginRequest = function (response) {
        this.isLoggingIn = false;
        if (response) {
            var responseData = response.json();
            this.http.setToken(responseData.token, responseData.expires);
            this.saveUserData(responseData.user);
            this.announceLoginState();
        }
        else {
            this._handleLogout();
        }
        return this.loggedInUser;
    };
    UserService.prototype.logout = function (silent) {
        var _this = this;
        return this.http.post(constants_1.API.logout, {})
            .toPromise()
            .then(function () {
            _this._handleLogout();
            if (!silent) {
                _this.announceLoginState();
            }
            return true;
        });
    };
    UserService.prototype._handleLogout = function () {
        this.http.reset();
        this.clearUserData();
    };
    UserService.prototype.isLoggedIn = function () {
        return this.loggedInUser && true;
    };
    UserService.prototype.getLoggedInUser = function () {
        if (this.checkTokenExpiration()) {
            return this.loggedInUser;
        }
        else {
            return null;
        }
    };
    UserService.prototype.getUserName = function () {
        return this.loggedInUser.firstName + ' ' + this.loggedInUser.lastName;
    };
    /**
     * Change information on the current user
     */
    UserService.prototype.updateUser = function (user) {
        var _this = this;
        return this.http.put(constants_1.API.updateUser(user._id), user)
            .toPromise()
            .then(function (response) {
            var user = response.json();
            _this.saveUserData(user);
            return _this.loggedInUser;
        });
    };
    UserService.prototype.setPreference = function (key, val) {
        var _this = this;
        return this.http.post(constants_1.API.userPreference(this.loggedInUser._id), {
            key: key,
            val: '' + val
        }).toPromise()
            .then(function (response) {
            var user = response.json();
            _this.saveUserData(user);
            return _this.loggedInUser;
        });
    };
    UserService.prototype.getPreference = function (key, def) {
        var value = def || '';
        if (this.loggedInUser.preferences) {
            this.loggedInUser.preferences.forEach(function (pref) {
                if (pref.key == key) {
                    value = pref.value;
                }
            });
        }
        return value;
    };
    UserService.prototype.can = function (key) {
        if (!this.loggedInUser || !this.loggedInUser.actions || !this.loggedInUser.actions.length || this.isLocked()) {
            return false;
        }
        else {
            return this.loggedInUser.actions.indexOf(key) > -1;
        }
    };
    UserService.prototype.isSuperAdmin = function () {
        return this.loggedInUser && this.loggedInUser.superAdmin;
    };
    UserService.prototype.isLocked = function () {
        return this.loggedInUser.locked;
    };
    UserService.prototype.isExpired = function (user) {
        user = user || this.loggedInUser;
        return !user.subscription || (new Date(user.subscription.expiration)).getTime() <= Date.now();
    };
    /**
     * The following functions get various expanded properties on the user object. They don't change the logged in user data
     */
    UserService.prototype.fetchPurchases = function () {
        return this.http.get(constants_1.API.userPurchases(this.loggedInUser._id))
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    UserService.prototype.fetchSubscription = function () {
        if (!this._subscriptionPromise) {
            this._subscriptionPromise = this.http.get(constants_1.API.userSubscription(this.loggedInUser._id))
                .toPromise()
                .then(function (response) {
                return response.json();
            });
        }
        return this._subscriptionPromise;
    };
    UserService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_http_1.AppHttp])
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;

//# sourceMappingURL=user.service.js.map
