import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from './app.component';
import { UserService } from '../service/user.service';

@Component({
    moduleId: module.id,
    selector: "login-screen",
    template: `<div class="page"></div>`
})
export class LoginScreenComponent implements OnInit {

    constructor(
        private _app: AppComponent,
        private router: Router,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        if (this.userService.getLoggedInUser()) {
            this.router.navigate(['dashboard']);
        } else {
            // the timeout here will help avoid a "value changed after it was checked" error
            setTimeout(() => {
                this._app.login();
            })
        }
    }

}
