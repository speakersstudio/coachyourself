import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppHttp } from '../data/app-http';

import { AppComponent } from '../component/app.component';

import { TabData } from '../model/tab-data';

import { UserService } from '../service/user.service';

//TODO: import models

@Component({
    moduleId: module.id,
    selector: "contact",
    templateUrl: "../template/contact.component.html",
    styles: [`
        #contactSigOutput {
            font-family: 'Alex Brush';
            font-size: 52px;
            transform: rotateZ(-5deg);
            transform-origin: 0%;
            color: #333;
        }
    `]
})
export class ContactComponent implements OnInit {

    month: string;
    day: number;
    year: number;

    name: string;
    email: string;

    featureMessage: string;

    bugTryingTo: string;
    bugExpectation: string;
    bugReality: string;
    bugSteps: string;

    error: string;
    errorField: string;

    sending: boolean;
    sent: boolean;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private route: ActivatedRoute,
        private http: AppHttp,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.name = this.userService.getUserName() || 'A humble user';
        this.email = this.userService.getLoggedInUser().email;
    }

    sendBugReport(): void {
        if (!this.bugTryingTo && !this.bugExpectation && !this.bugReality && !this.bugSteps) {
            this.error="We are truly sorry that you encountered a problem. However, you should probably give us some clue as to what it was.";
        } else {
            this.error = '';

            this.sending = true;
            this._app.showLoader();
            this.http.post('/api/contact/bugreport', {
                tryingTo: this.bugTryingTo,
                expectation: this.bugExpectation,
                reality: this.bugReality,
                steps: this.bugSteps
            })
                .toPromise()
                .then(response => {
                    this._app.hideLoader();
                    this.sending = false;
                    this.sent = true;
                })
        }
    }
}
