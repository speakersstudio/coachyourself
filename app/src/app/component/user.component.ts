import { 
    Component,
    OnInit,
    OnDestroy
} from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { AppComponent } from '../../component/app.component';

import { Tool } from '../view/toolbar.view';

import { TabData } from '../../model/tab-data';

import { UserService } from "../../service/user.service";

import { User } from "../../model/user";
import { Subscription } from '../../model/subscription';
import { Purchase } from '../../model/purchase';
import { Team } from '../../model/team';

import { TimeUtil } from '../../util/time.util';

const MAX_ATTEMPTS = 5;

@Component({
    moduleId: module.id,
    selector: "user",
    templateUrl: "../template/user.component.html"
})
export class UserComponent implements OnInit, OnDestroy {

    title: string = "Account";

    tabs = [
        {
            name: 'Your Account',
            id: 'user',
            icon: 'user'
        },
        {
            name: 'Your Subscription',
            id: 'subscription',
            icon: 'id-card-o'
        },
        {
            name: 'Purchase History',
            id: 'purchases',
            icon: 'money'
        }
    ];
    selectedTab: string = 'user';

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

    _tools: Tool[] = [
        {
            icon: "fa-sign-out",
            name: "logout",
            text: "Log Out",
            active: false
        }
    ]

    ngOnInit(): void {
        this.errorCount = 0;
        this.weGood = true;

        this.user = this._app.user;

        this.userService.fetchPurchases().then(p => {
            this.purchases = p;
        });

        this.userService.fetchSubscription().then(u => {
            this.subscription = u.subscription;
        });
    }

    ngOnDestroy(): void {

    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;
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

    onToolClicked(tool: Tool): void {
        this._app.showLoader();
        
        switch (tool.name) {
            case "logout":
                this._app.logout();
                break;
        }
    }

    getDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    getTime(date: string): string {
        return TimeUtil.simpleTime(date);
    }

    cancelSubscription(): void {
        this._app.toast("This button doesn't work yet.");
    }
}
