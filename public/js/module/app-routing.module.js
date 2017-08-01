"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var router_1 = require("@angular/router");
var login_screen_component_1 = require("../component/login-screen.component");
var signup_component_1 = require("../component/signup.component");
var change_password_component_1 = require("../component/change-password.component");
var auth_guard_service_1 = require("../service/auth-guard.service");
var dashboard_component_1 = require("../component/dashboard.component");
var materials_library_component_1 = require("../component/materials-library.component");
var unauthorized_component_1 = require("../component/unauthorized.component");
var contact_component_1 = require("../component/contact.component");
var user_component_1 = require("../component/user.component");
var legal_component_1 = require("../component/legal.component");
var videos_component_1 = require("../component/videos.component");
var admin_component_1 = require("../component/admin.component");
var not_found_component_1 = require("../component/not-found.component");
var routes = [
    {
        path: '',
        redirectTo: '/signup',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: login_screen_component_1.LoginScreenComponent
    },
    {
        path: 'signup',
        component: signup_component_1.SignupComponent
    },
    {
        path: 'resetMyPassword/:token',
        component: change_password_component_1.ChangePasswordComponent
    },
    {
        path: 'unauthorized',
        component: unauthorized_component_1.UnauthorizedComponent
    },
    {
        path: 'legal',
        component: legal_component_1.LegalComponent
    },
    {
        path: '',
        canActivateChild: [auth_guard_service_1.AuthGuard],
        children: [
            {
                path: 'dashboard',
                component: dashboard_component_1.DashboardComponent,
                data: {
                    action: 'dashboard_page_view'
                }
            },
            {
                path: 'materials',
                component: materials_library_component_1.MaterialsLibraryComponent,
                data: {
                    action: 'material_page_view'
                }
            },
            {
                path: 'materials/:packageSlug',
                component: materials_library_component_1.MaterialsLibraryComponent,
                data: {
                    action: 'material_page_view'
                }
            },
            {
                path: 'user',
                component: user_component_1.UserComponent,
                data: {
                    action: 'account_edit'
                }
            },
            {
                path: 'admin',
                component: admin_component_1.AdminComponent,
                data: {
                    admin: true
                }
            },
            {
                path: 'contact/:type',
                component: contact_component_1.ContactComponent,
                data: {
                    action: 'contact_page_view'
                }
            },
            {
                path: 'contact',
                component: contact_component_1.ContactComponent,
                data: {
                    action: 'contact_page_view'
                }
            },
            {
                path: 'videos',
                component: videos_component_1.VideosComponent,
                data: {
                    action: 'video_page_view'
                }
            }
        ]
    },
    {
        path: '**',
        component: not_found_component_1.NotFoundComponent
    }
];
var AppRoutingModule = (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        core_1.NgModule({
            imports: [router_1.RouterModule.forRoot(routes)],
            exports: [router_1.RouterModule]
        })
    ], AppRoutingModule);
    return AppRoutingModule;
}());
exports.AppRoutingModule = AppRoutingModule;
;

//# sourceMappingURL=app-routing.module.js.map
