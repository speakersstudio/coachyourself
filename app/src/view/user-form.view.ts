import { 
    Component,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';

import { AppComponent } from '../component/app.component';

import { User } from '../model/user';
import { AppService } from '../service/app.service';

@Component({
    moduleId: module.id,
    selector: 'user-form',
    templateUrl: '../template/view/user-form.view.html'
})
export class UserFormView implements OnInit, OnDestroy {

    @Input() user: User;
    @Input() backText: string;
    @Input() isPosting: boolean = false;
    @Input() saveText: string = "Save";

    @Output() back: EventEmitter<boolean> = new EventEmitter();
    @Output('valid') onValidated: EventEmitter<User> = new EventEmitter();

    newUser: boolean;

    isValidating: boolean;
    emailConflict: boolean;

    birthdayMonth: number;
    birthdayDay: number;
    birthdayYear: number;

    email: string;
    password: string;
    passwordConfirm: string;
    passwordMatchError: boolean;

    constructor(
        private _app: AppComponent,
        private appService: AppService
    ) { }

    ngOnInit(): void {
        this.newUser = this.user._id == undefined;

        if (this.user.birthday) {
            let birthday = new Date(this.user.birthday);
            if (isNaN(birthday.getDate())) {
                birthday = new Date(parseInt(this.user.birthday));
            }
            this.birthdayDay = birthday.getDate();
            this.birthdayMonth = birthday.getMonth();
            this.birthdayYear = birthday.getFullYear();
        }
    }

    ngOnDestroy(): void {
        
    }

    goBack(): void {
        // this._app.logout();
        this.back.emit(true);
    }

    submitForm(): void {
        this.passwordMatchError = false;
        this.emailConflict = false;

        if (this.password === this.passwordConfirm) {
            this.user.password = this.password;

            if (this.birthdayDay && this.birthdayMonth && this.birthdayYear) {
                let birthday = new Date(0);
                birthday.setDate(this.birthdayDay);
                birthday.setMonth(this.birthdayMonth);
                birthday.setFullYear(this.birthdayYear);
                this.user.birthday = birthday.getTime().toString();
            }

            this.isValidating = true;

            this.appService.validateUser(this.user)
                .then(conflict => {
                    this.isValidating = false;

                    if (conflict) {
                        if (conflict == 'email') {
                            this.emailConflict = true;
                        }
                    } else {
                        this.onValidated.emit(this.user);

                        this.password = "";
                        this.passwordConfirm = "";
                    }
            });
        } else {
            this.passwordMatchError = true;
        }
    }
    
}
