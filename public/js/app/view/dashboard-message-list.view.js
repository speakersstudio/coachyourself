"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
require("rxjs/Subscription");
var router_1 = require("@angular/router");
var app_component_1 = require("../../component/app.component");
var user_service_1 = require("../../service/user.service");
var bracket_card_directive_1 = require("../../directive/bracket-card.directive");
var anim_util_1 = require("../../util/anim.util");
var DashboardMessage = (function () {
    function DashboardMessage() {
    }
    return DashboardMessage;
}());
var DashboardMessageListView = (function () {
    function DashboardMessageListView(userService, router, _app) {
        var _this = this;
        this.userService = userService;
        this.router = router;
        this._app = _app;
        this.PREFERENCE_KEY_PREFIX = 'hide_dash_message_';
        this.messages = [
            {
                key: 'no-subscription',
                title: 'No Subscription',
                body: "\n                <p>Your subscription is expired or otherwise invalid. If you own any materials or other content, you can still access them, but other areas of the app will be off-limits until you renew your subscription.</p>\n            ",
                button: 'Purchase Subscription',
                notDismissable: true,
                action: function () {
                    _this._app.toast('This feature is coming soon. Please hang on.');
                },
                trigger: function () {
                    return _this.userService.isExpired();
                }
            }
        ];
        this.visibleMessage = new DashboardMessage();
    }
    DashboardMessageListView.prototype.ngOnInit = function () {
        var _this = this;
        // if the user is refreshing, wait until it finishes to show any messages
        if (!this.userService.isLoggingIn) {
            this.showNextMessage();
        }
        // when the user updates, re-scan to see if the message to show has changed
        this.userSubscription = this.userService.loginState$.subscribe(function (user) {
            if (user) {
                _this.showNextMessage();
            }
        });
    };
    DashboardMessageListView.prototype.ngOnDestroy = function () {
        this.userSubscription.unsubscribe();
    };
    DashboardMessageListView.prototype.showNextMessage = function () {
        var _this = this;
        var delay = this.visibleMessage ? 300 : 1;
        this.visibleMessage = null;
        // show the first message that has not been hidden by the user
        setTimeout(function () {
            _this.messages.some(function (message) {
                var key = message.key;
                var visible = _this.userService.getPreference(_this.PREFERENCE_KEY_PREFIX + key) != 'true';
                if (visible && message.trigger) {
                    visible = visible && message.trigger();
                }
                if (visible) {
                    _this.visibleMessage = message;
                    return true;
                }
            });
        }, delay);
    };
    DashboardMessageListView.prototype.dismissVisibleMessage = function () {
        var _this = this;
        if (!this.visibleMessage.notDismissable) {
            this.userService.setPreference(this.PREFERENCE_KEY_PREFIX + this.visibleMessage.key, 'true')
                .then(function () {
                setTimeout(function () {
                    _this.showNextMessage();
                }, 300);
            });
            this.messageElement.close();
        }
    };
    DashboardMessageListView.prototype.saveUserName = function () {
        var _this = this;
        var user = this.userService.getLoggedInUser();
        user.firstName = this.firstName;
        user.lastName = this.lastName;
        this.isPosting = true;
        this.userService.updateUser(user)
            .then(function (user) {
            _this.isPosting = false;
            setTimeout(function () {
                _this.showNextMessage();
            }, 100);
        });
    };
    __decorate([
        core_1.ViewChild('dashboardMessage', { read: bracket_card_directive_1.BracketCardDirective }),
        __metadata("design:type", bracket_card_directive_1.BracketCardDirective)
    ], DashboardMessageListView.prototype, "messageElement", void 0);
    DashboardMessageListView = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'dashboard-message-list',
            templateUrl: '../template/view/dashboard-message-list.view.html',
            animations: [anim_util_1.ShrinkAnim.height]
        }),
        __metadata("design:paramtypes", [user_service_1.UserService,
            router_1.Router,
            app_component_1.AppComponent])
    ], DashboardMessageListView);
    return DashboardMessageListView;
}());
exports.DashboardMessageListView = DashboardMessageListView;

//# sourceMappingURL=dashboard-message-list.view.js.map
