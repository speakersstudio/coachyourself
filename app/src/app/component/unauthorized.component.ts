import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent    } from '../../component/app.component';
import { Tool } from '../view/toolbar.view';

import { UserService } from '../../service/user.service';

@Component({
    moduleId: module.id,
    selector: "unauthorized",
    templateUrl: "../template/unauthorized.component.html"
})
export class UnauthorizedComponent implements OnInit {

    title: string = '';

    constructor(
        public _app: AppComponent,
        private router: Router,
        public userService: UserService
    ) { }

    _tools: Tool[] = [
    ]

    ngOnInit(): void {
    }

    can(permission: string): boolean {
        return this.userService.can(permission);
    }

}
