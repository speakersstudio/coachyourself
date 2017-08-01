import { 
    Component,
    OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { AppComponent } from '../component/app.component';

import { TabData } from '../model/tab-data';

import { UserService } from "../service/user.service";

import { User } from "../model/user";
import { Subscription } from '../model/subscription';
import { Purchase } from '../model/purchase';

import { TimeUtil } from '../util/time.util';

const MAX_ATTEMPTS = 5;

@Component({
    moduleId: module.id,
    selector: "user",
    templateUrl: "../template/user.component.html"
})
export class UserComponent implements OnInit {

    email: string;
    password: string;
    passwordConfirm: string;
    passwordMatchError: boolean;

    loginError: string;

    errorCount: number;

    runaway: boolean;
    weGood: boolean;

    user: User;

    isPosting: boolean;

    subscription: Subscription;
    purchases: Purchase[];

    constructor(
        private userService: UserService,
        private router: Router,
        private location: Location,
        public _app: AppComponent,
        private fb: FormBuilder
    ) { }

    ngOnInit(): void {
        this.errorCount = 0;
        this.weGood = true;

        this.user = this._app.user;
    }

    logout(): void {
        this._app.logout();
    }

    submitEditUser(user: User): void {
        if (user && user._id) {
            this.userService.updateUser(user)
                .then(() => {
                    this.isPosting = false;
                    this._app.toast("Your information has been saved!");
                })
                .catch(() => {
                    this.isPosting = false;
                });
        }
    }

    getDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    getTime(date: string): string {
        return TimeUtil.simpleTime(date);
    }
    
}
