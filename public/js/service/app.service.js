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
require("rxjs/add/operator/toPromise");
var constants_1 = require("../constants");
var app_http_1 = require("../data/app-http");
var AppService = (function () {
    function AppService(http) {
        this.http = http;
    }
    AppService.prototype.handleError = function (error) {
        console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    };
    AppService.prototype.setRedirect = function (url) {
        this.redirect = url;
    };
    AppService.prototype.getRedirect = function () {
        return this.redirect;
    };
    AppService.prototype.validateUser = function (user) {
        return this.http.post(constants_1.API.validateUser, user)
            .toPromise()
            .then(function (response) {
            var data = response.json();
            if (data.conflict == 'email') {
                return 'That email address is already registered with us.';
            }
            else {
                return '';
            }
        });
    };
    AppService.prototype.signup = function (user, token) {
        return this.http.post(constants_1.API.signup, {
            stripeToken: token,
            user: user
        }).toPromise()
            .then(function (result) {
            return result.json();
        });
    };
    AppService.prototype.getPackages = function () {
        if (!this._packagePromise) {
            this._packagePromise = this.http.get(constants_1.API.package)
                .toPromise()
                .then(function (response) {
                var packages = response.json();
                return packages;
            })
                .catch(this.handleError);
        }
        return this._packagePromise;
    };
    AppService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_http_1.AppHttp])
    ], AppService);
    return AppService;
}());
exports.AppService = AppService;

//# sourceMappingURL=app.service.js.map
