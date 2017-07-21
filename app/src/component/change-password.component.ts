import { 
    Component,
    OnInit,
    HostBinding } from '@angular/core';
import { Router, ActivatedRoute, Params }   from '@angular/router';

import { AppComponent } from './app.component';
import { UserService } from '../service/user.service';

import { DialogAnim } from '../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "change-password",
    templateUrl: '../template/change-password.component.html',
    animations: [
        DialogAnim.dialog
    ]
})
export class ChangePasswordComponent implements OnInit {

    @HostBinding('class.dialog-container') 
    @HostBinding('class.show')
    isDialog: boolean = true;

    token: string;

    checking: boolean;
    valid: boolean;

    password: string;
    confirmPassword: string;

    error: string;

    isPosting: boolean;

    constructor(
        private _app: AppComponent,
        private router: Router,
        private route: ActivatedRoute,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.route.params.forEach((params: Params) => {
            this.token = params['token'];
        });

        this._app.backdrop(true);

        this.checking = true;

        this.userService.checkPasswordRecoveryToken(this.token).then(r => {
            this.checking = false;
            if (r) {
                setTimeout(() => {
                    this.valid = true;
                }, 200);
            }
        });
    }

    submitPassword(): void {
        if (this.password !== this.confirmPassword) {
            this.error = 'Your passwords do not match.';
        } else {
            this.isPosting = true;
            this.userService.changePassword(this.token, this.password)
                .then(user => {
                    if (user) {
                        this.userService.login(user.email, this.password);
                    }
                });
        }
    }

}
