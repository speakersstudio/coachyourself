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
    selector: "invite",
    templateUrl: '../template/invite.component.html',
    animations: [
        DialogAnim.dialog
    ]
})
export class InviteComponent implements OnInit {

    @HostBinding('class.dialog-container') 
    @HostBinding('class.show')
    
    inviteId: string;
    dialogStatus: string = 'default';

    email: string;
    password: string;
    userName: string;

    error: string;

    isPosting: boolean;

    constructor(
        private _app: AppComponent,
        private router: Router,
        private route: ActivatedRoute,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        if (this.userService.getLoggedInUser()) {
            this.userService.logout(true);
        }

        this.route.params.forEach((params: Params) => {
            this.inviteId = params['id'];
        });

        this._app.backdrop(true);
    }

    submitInvite(): void {
        this.userService.acceptInvite(this.inviteId, this.email, this.password, this.userName)
            .catch(error => {
                this.dialogStatus = 'shake';
                let data = error.json();
                if (data.error) {
                    switch(data.error) {
                        case 'unknown invite':
                            this.error = 'That is apparently not a valid invite code.';
                            break;
                        case 'invite taken':
                            this.error = 'Someone seems to have claimed that invite code already.';
                            break;
                        case 'wrong email':
                            this.error = 'For security reasons, enter the email address that this invite code was sent to. You can change it later.';
                            break;
                        default:
                            this.error = data.error;
                            break;
                    }
                }
            })
            .then(user => {
                if (user) {
                    this.userService.login(this.email, this.password);
                }
            });
    }

}
