import { 
    Component,
    OnInit,
    ViewChild,
    ViewChildren,
    QueryList,
    ElementRef
} from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from './app.component';
import { AppService } from '../service/app.service';
import { UserService } from '../service/user.service';
import { StripeService } from '../service/stripe.service';

import { User } from '../model/user';
import { Package } from '../model/package';

import { ShrinkAnim, DialogAnim } from '../util/anim.util';

import { BracketCardDirective } from '../directive/bracket-card.directive';

declare var Stripe: any;

@Component({
    moduleId: module.id,
    selector: "signup",
    templateUrl: '../template/signup.component.html',
    animations: [
        DialogAnim.dialog,
        ShrinkAnim.height
    ]
})
export class SignupComponent implements OnInit {
    [key:string]: any;

    packages: Package[] = [];

    email: string;
    password: string;
    userName: string;
    title: string;
    company: string;
    country: string = 'United States';

    isPosting: boolean = false;

    creditCard: any;

    emailError: string;
    cardError: string;

    cardComplete: boolean = false;

    termsDialogVisible: boolean;
    termsAccepted: boolean;

    constructor(
        public _app: AppComponent,
        private _service: AppService,
        private router: Router,
        private userService: UserService,
        private stripeService: StripeService
    ) { }

    ngOnInit(): void {

        if (this.userService.isLoggedIn()) {
            this.router.navigate(['dashboard'], {replaceUrl: true});
            return;
        }

        this._service.getPackages().then(packages => {
            this.packages = packages;
            this.setup();
        });

    }

    setup(): void {

        this.creditCard = this.stripeService.setupStripe(e => {
            this.cardComplete = e.complete;

            if (e.error) {
                this.cardError = e.error.message;
            } else {
                this.cardError = '';
            }
        });

        this.creditCard.mount('#card-element');

    }

    emailTimer: any;
    emailInput(): void {
        clearTimeout(this.emailTimer);

        this.emailError = '';
        this.emailValidating = true;
        this.emailTimer = setTimeout(() => {
            this.validateEmail();
        }, 1000);
    }

    validateEmail(): void {
        let user = new User();

        if (this.email.indexOf('@') > -1 && this.email.indexOf('.') > -1) {
            user.email = this.email;
            this._service.validateUser(user).then(message => {
                this.emailError = message;
                this.emailValidating = false;
            });
        } else if (this.email.length > 0) {
            this.emailError = 'This does not seem to be a valid email address.';
            this.emailValidating = false;
        } else {
            this.emailError = '';
            this.emailValidating = false;
        }
    }

    isFormValid(): boolean {
        return !this.emailValidating && !!this.email && !!!this.emailError && !!this.password && !!!this.cardError && this.cardComplete; // !!!!!
    }

    submitPayment(): void {
        if (!this.isFormValid()) {
            return;
        }

        if (!this.cardComplete) {
            return;
        }

        this.isPosting = true;

        this.stripeService.getStripeToken(this.creditCard).then((result: any) => {
            if (result.error) {
                this.cardError = result.error.message;
            } else {
                this._signup(result.token);
            }
        });

    }

    private _signup(token?: any): void {
        let user = new User();
        user.email = this.email;
        user.password = this.password;
        user.firstName = (this.userName + ' ').split(' ')[0];
        user.lastName = (this.userName + ' ').split(' ')[0];
        user.title = this.title;
        user.company = this.company;
        user.country = this.country;

        this._service.signup(user, token)
            .then(user => {
                this._app.hideLoader();
                if (user && user.email) {
                    return this.userService.login(this.email, this.password);
                } else {
                    // uh oh?
                    this._app.toast("Something bad happened. I'm not sure what to tell you.");
                }
            }, response => {
                this._app.hideLoader();
                this.isPosting = false;
                let msg = response.json();
                this._handleError(msg);
            });
    }

    private _handleError(msg: any): void {
        if (msg.error && msg.error == 'email already exists') {
            this.emailError = "That email address is already registered.";
        } else if (msg.error) {
            this._app.dialog('An error has occurred.', 'We are so sorry. Something happened, and we can\'t be sure what. Please try again, and if this keeps happening, reach out to us by contacting awesomedesk@thespeakers-studio.com.', 'Okay bye', null, true);
        }
    }

    showTerms(): void {
        this._app.backdrop(true);
        this.termsDialogVisible = true;
    }

    hideTerms(): void {
        this._app.backdrop(false);
        this.termsDialogVisible = false;
    }

}
