import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent    } from '../../component/app.component';

import { UserService } from '../../service/user.service';

@Component({
    moduleId: module.id,
    selector: "unauthorized",
    templateUrl: "../template/unauthorized.component.html"
})
export class UnauthorizedComponent implements OnInit {

    constructor(
        public _app: AppComponent,
        private router: Router,
        public userService: UserService
    ) { }

    ngOnInit(): void {
    }

    can(permission: string): boolean {
        return this.userService.can(permission);
    }

}
