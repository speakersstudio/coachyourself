import { Injectable } from '@angular/core';
import { CanLoad, Route } from '@angular/router';

import { UserService } from '../service/user.service';

@Injectable() 
export class AppLoadGuard implements CanLoad {

    constructor(
        private userService: UserService
    ) {}

    canLoad(route: Route): boolean {
        return this.userService.getLoggedInUser() != null;
    }


}