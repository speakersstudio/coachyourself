import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location, PathLocationStrategy } from '@angular/common';

import {AppComponent} from '../../component/app.component';
import { Tool } from '../view/toolbar.view';

import { TabData } from '../../model/tab-data';

import { User } from '../../model/user';
import { Team } from '../../model/team';
import { Address } from '../../model/address';
import { Purchase } from '../../model/purchase';
import { Invite } from '../../model/invite';
import { Subscription } from '../../model/subscription';

import { UserService } from '../../service/user.service';
import { TeamService } from '../service/team.service';
import { AppService } from '../../service/app.service';

import { TimeUtil } from '../../util/time.util';
import { TextUtil } from '../../util/text.util';
import { Util } from '../../util/util';

import { DialogAnim, ToggleAnim } from '../../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "team-details",
    templateUrl: "../template/team-details.component.html",
    animations: [DialogAnim.dialog]
})
export class TeamDetailsComponent implements OnInit {

    title: string;

    @Input() team: Team;
    user: User;

    tabs: TabData[];
    selectedTab: string = 'team';

    private adminActions = [
        'team_subscription_invite',
        'team_invite',
        'team_edit',
        'team_user_promote',
        'team_purchases_view'
    ]

    address: string;
    remainingSubs: number;
    pendingInvites: number;

    selectedUser: User;

    isPosting: boolean;

    purchases: Purchase[];
    subscription: Subscription;

    descriptionHtml: string;

    subscriptionPrice: number;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private route: ActivatedRoute,
        private _service: AppService,
        private userService: UserService,
        private teamService: TeamService,
        private pathLocationStrategy: PathLocationStrategy,
        private _location: Location
    ) { }

    _tools: Tool[] = [
        {
            icon: "fa-sign-out",
            name: "leave",
            text: "Leave Company",
            active: false
        }
    ]

    _timeUtil = TimeUtil;

    ngOnInit(): void {
        this.user = this.userService.getLoggedInUser();

        this.route.params.forEach((params: Params) => {
            let id = params['id'];
            this.getTeam(id);
        });
    }

    onToolClicked(tool: Tool): void {
        switch (tool.name) {
            case "leave":
                this.leave();
                break;
        }
    }

    goBack(): void {
        this._location.back();
    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;
    }

    getDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    getTime(date: string): string {
        return TimeUtil.simpleTime(date);
    }

    getTeam(id: string): void {
        this.teamService.getTeam(id)
            .then(team => this.setTeam(team));
    }

    can(action: string): boolean {
        let can = this.userService.can(action);

        if (this.adminActions.indexOf(action)) {
            return can && this.isUserAdmin();
        } else {
            return can;
        }
    }

    isUserAdmin(): boolean {
        return this.userService.isAdminOfTeam(this.team);
    }

    setTeam(team: Team): void {
        this.team = team;

        if (this.isUserAdmin()) {
            this.teamService.fetchPurchases(this.team).then(p => {
                this.purchases = p;
            });
        }

        this.teamService.fetchSubscription(this.team).then(s => {
            this.subscription = s;

            this.calculateSubs();

            this._service.getPackageConfig().then(config => {
                this.subscriptionPrice = this.subscription.type == 'facilitator' ? config.fac_sub_price : config.improv_sub_price;
            });
        });

        this.title = team.name;

        this.tabs = [
            {
                name: 'Company Details',
                id: 'team',
                icon: 'users'
            },
            {
                name: 'Members',
                id: 'members',
                icon: 'user-plus'
            }
        ];

        if (this.can('team_purchases_view')) {
            this.tabs.push({
                name: 'Company Subscription',
                id: 'subscription',
                icon: 'id-card-o'
            })
            this.tabs.push({
                name: 'Purchase History',
                id: 'purchases',
                icon: 'money'
            })
        }
    }

    renderDescription(): void {
        if (this.team.description) {
            let converter = TextUtil.getMarkdownConverter();
            this.descriptionHtml = converter.makeHtml(this.team.description);
        } else {
            this.descriptionHtml = 'No Description';
        }
    }

    calculateSubs(): void {
        this.pendingInvites = this.subscription.subscriptionInvites.length;
        // if (this.subscription.invites) {
        //     this.subscription.invites.forEach(invite => {
        //         if (!invite.inviteUser || this.userService.isExpired(invite.inviteUser)) {
        //             this.pendingInvites++;
        //         }
        //     });
        // }

        this.remainingSubs = this.subscription.subscriptions - (this.subscription.children.length || 0) - this.pendingInvites;
    }

    saveEditName(name: string): void {
        this.team.name = name;
        this.teamService.saveTeam(this.team);
    }

    saveEditPhone(phone: string): void {
        this.team.phone = phone;
        this.teamService.saveTeam(this.team);
    }

    saveEditEmail(email: string): void {
        this.team.email = email;
        this.teamService.saveTeam(this.team);
    }

    saveEditUrl(url: string): void {
        this.team.url = url;
        this.teamService.saveTeam(this.team);
    }

    saveEditCompany(company: string): void {
        this.team.company = company;
        this.teamService.saveTeam(this.team);
    }

    saveEditAddress(address: Address): void {
        this.team.address = address.address;
        this.team.city = address.city;
        this.team.state = address.state;
        this.team.zip = address.zip;
        this.team.country = address.country;

        this.teamService.saveTeam(this.team);
    }

    newDescriptionText: string;
    editDescriptionShown: boolean;
    showEditDescription(): void {
        if (this.can('team_edit')) {
            this.newDescriptionText = this.team.description;
            this.editDescriptionShown = true;
        }
    }

    cancelDescription(): void {
        this.editDescriptionShown = false;
    }

    saveDescription(): void {
        this.team.description = this.newDescriptionText;
        this.teamService.saveTeam(this.team);
        this.cancelDescription();
    }

    selectUser(user: User): void {
        if (this.selectedUser !== user) {
            this.selectedUser = user;
        } else {
            this.selectedUser = null;
        }
    }

    showInviteDialog: boolean;
    inviteEmail: string;
    inviteStatus: string;
    inviteModel: Invite;
    inviteError: string;

    selectedInvite: Invite;

    invite(): void {
        this._app.backdrop(true);

        this.showInviteDialog = true;
        this.inviteEmail = '';
        this.inviteError = '';
    }

    cancelInviteDialog(): void {
        this._app.backdrop(false);
        
        this.showInviteDialog = false;
        this.inviteStatus = '';
    }

    submitInvite(): void {
        this.isPosting = true;
        this.inviteError = '';

        this.teamService.invite(this.team, this.inviteEmail)
            .then(invite => {
                this.isPosting = false;
                this.inviteStatus = 'wait';
                this.inviteModel = invite;
                if (invite) {
                    setTimeout(() => {
                        if (!invite.inviteUser || this.userService.isExpired(invite.inviteUser)) {
                            this.inviteStatus = 'new';
                            this.subscription.subscriptionInvites.push(invite);
                        } else {
                            this.inviteStatus = 'exists';
                            this.subscription.invites.push(invite);
                        }
                        this.calculateSubs();
                    }, 300);
                }
            }, error => {
                this.isPosting = false;
                let response = error.json();
                if (response.error && response.error == 'invite already exists') {
                    this.inviteError = 'That email address has already been invited to ' + this.team.name + '.';
                } else if (response.error && response.error == 'user already in team') {
                    this.inviteError = 'That user is already in your team.';
                } else if (response.error && response.error == 'user type mismatch') {
                    if (this.subscription.type == 'improviser') {
                        this.inviteError = 'At this time, you cannot invite a Facilitator to an Improv Team.'
                    } else {
                        this.inviteError = 'At this time, you cannot invite an Improviser to a Facilitator Company.'
                    }
                } else if (response.error && response.error == 'out of subscriptions') {
                    this.inviteError = 'Your team is out of subscriptions, so you cannot invite that user until you purchase more (or until they purchase a subscription on their own).'
                } else {
                    this.inviteError = 'There was some sort of problem sending that invite.';
                }
            })
    }

    selectInvite(invite: Invite): void {
        if (this.selectedInvite && this.selectedInvite._id == invite._id) {
            this.selectedInvite = null;
        } else {
            this.selectedInvite = invite;
        }
    }

    cancelInvite(invite: Invite): void {
        this.selectedInvite = invite;
        this._app.dialog('Cancel an Invitation', 'Are you sure you want to revoke your invitation to ' + invite.email + '? We already sent them the invite, but the link inside will no longer work. We will not notify them that it was cancelled.', 'Yes',
            () => {
                this.userService.cancelInvite(invite).then(done => {
                    if (done) {
                        let index = this.subscription.invites.indexOf(invite);
                        this.subscription.invites.splice(index, 1);

                        this.calculateSubs();
                    }
                })
            });
    }

    leave(): void {
        let body = `
            <p>Are you sure you want to leave this team? You will no longer have access to any of the team's resources.</p>
        `;

        if (this.user.subscription.parent == this.team.subscription._id) {
            body += `
                <p class="error"><strong>Warning: Your subscription is inherited from ${this.team.name}. If you leave the team, you will have to purchase a new subscription to keep using ImprovPlus.</strong></p>
            `
        }

        this._app.dialog('Leave ' + this.team.name + '?', body, 'Yes', () => {

            this.userService.leaveTeam(this.team).then(user => {

                this.router.navigate(['/app/dashboard']);

                setTimeout(() => {
                    this._app.dialog('It is done', 'You have successfully left ' + this.team.name + '.');
                }, 500);

            });

        });
    }

    showBuySubscriptionDialog: boolean;
    showBuySubscriptionCC: boolean;
    buySubCount: number;

    buySubscription(): void {
        // this._app.backdrop(true);

        // this.showBuySubscriptionDialog = true;
        // this.buySubCount = 0;

        this._app.dialog('Not Ready Yet', 'We are terribly sorry, but this feature is not ready yet. If this is a problem, please contact us using the "request a feature" option in the App menu.');
    }

    cancelBuySubscriptionDialog(): void {
        this._app.backdrop(false);
        this.showBuySubscriptionDialog = false;
    }

    cardComplete: boolean;
    cardError: string;

    submitBuySubscriptions(): void {
        this.showBuySubscriptionDialog = false;

        setTimeout(() => {
            this.showBuySubscriptionCC = true;

            // let creditCard = Util.setupStripe(this._app.config.stripe);

            // creditCard.addEventListener('change', (e: any) => {
                
            //     this.cardComplete = e.complete;

            //     if (e.error) {
            //         this.cardError = e.error.message;
            //     } else {
            //         this.cardError = '';
            //     }
            // });

            // // setup the stripe credit card input
            // setTimeout(() => {
            //     creditCard.mount('#card-element');
            // }, 100)
        }, 300)
    }

    doBuySubscriptions(): void {
        this.isPosting = true;
    }

    getUserName(user: User): string {
        return user.firstName ? user.firstName : 'this user';
    }

    removeUserFromTeam(user: User): void {
        this._app.dialog('Remove ' + this.getUserName(user) + ' from the Company?',
            'Are you sure you want to remove them from the Company?', 'Yes', () => {
                this.teamService.removeUserFromTeam(this.team, user).then(team => {
                    this.setTeam(team);
                });
            });
    }

    promoteUser(user: User): void {
        this._app.dialog('Promote ' + this.getUserName(user) + ' to Company Admin?',
            'As a Company Admin, they will be able to view the Company\'s purchase history, add or remove users, and make purchases for the Company.', 'Yes',
            () => {
                this.teamService.promoteUser(this.team, user).then(team => {
                    this.setTeam(team);
                });
            });
    }

    demoteUser(user: User): void {
        this._app.dialog('Demote ' + this.getUserName(user) + '?',
            'This user will no longer have Company Admin privelages.', 'Yes',
            () => {
                this.teamService.demoteUser(this.team, user).then(team => {
                    this.setTeam(team);
                });
            });
    }

}
