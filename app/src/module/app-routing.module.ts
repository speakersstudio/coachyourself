import { NgModule }         from "@angular/core";
import { RouterModule, Routes, PreloadAllModules }     from "@angular/router";

// import { AuthGuard } from '../service/auth-guard.service';
import { AppLoadGuard } from '../service/app-load-guard.service';

import { LoginScreenComponent } from '../component/login-screen.component';
import { SignupComponent } from '../component/signup.component';
import { ChangePasswordComponent } from '../component/change-password.component';

import { AuthGuard } from '../service/auth-guard.service';
import { DashboardComponent } from "../component/dashboard.component";
import { MaterialsLibraryComponent } from "../component/materials-library.component";
import { UnauthorizedComponent } from "../component/unauthorized.component";
import { ContactComponent } from "../component/contact.component";
import { UserComponent } from '../component/user.component';
import { LegalComponent } from "../component/legal.component";
import { VideosComponent } from '../component/videos.component';

import { AdminComponent } from '../component/admin.component';
import { NotFoundComponent } from '../component/not-found.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: '/signup',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component: LoginScreenComponent
    },
    {
        path: 'signup',
        component: SignupComponent
    },
    {
        path: 'resetMyPassword/:token',
        component: ChangePasswordComponent
    },
    {
        path: 'unauthorized',
        component: UnauthorizedComponent
    },
    {
        path: 'legal',
        component: LegalComponent
    },

    {
        path: '',
        canActivateChild: [AuthGuard],
        children: [
            {
                path: 'dashboard',
                component: DashboardComponent,
                data: {
                    action: 'dashboard_page_view'
                }
            },
            {
                path: 'materials',
                component: MaterialsLibraryComponent,
                data: {
                    action: 'material_page_view'
                }
            },
            {
                path: 'materials/:packageSlug',
                component: MaterialsLibraryComponent,
                data: {
                    action: 'material_page_view'
                }
            },
            {
                path: 'user',
                component: UserComponent,
                data: {
                    action: 'account_edit'
                }
            },
            {
                path: 'admin',
                component: AdminComponent,
                data: {
                    admin: true
                }
            },
            {
                path: 'contact/:type',
                component: ContactComponent,
                data: {
                    action: 'contact_page_view'
                }
            },
            {
                path: 'contact',
                component: ContactComponent,
                data: {
                    action: 'contact_page_view'
                }
            },
            {
                path: 'videos',
                component: VideosComponent,
                data: {
                    action: 'video_page_view'
                }
            }
        ]
    },

    {
        path: '**',
        component: NotFoundComponent
    }
];

@NgModule({
    imports: [ RouterModule.forRoot(routes) ],
    exports: [ RouterModule ]
})

export class AppRoutingModule {};
