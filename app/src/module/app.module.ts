import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PathLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppHttp } from '../data/app-http';

// main components
import { AppComponent } from '../component/app.component';
import { NotFoundComponent } from '../component/not-found.component';

import { AppRoutingModule } from './app-routing.module';

import { LoginScreenComponent } from '../component/login-screen.component';
import { SignupComponent } from '../component/signup.component';
import { ChangePasswordComponent } from '../component/change-password.component';

import { UnauthorizedComponent } from "../component/unauthorized.component";
import { DashboardComponent } from '../component/dashboard.component';
import { MaterialsLibraryComponent } from "../component/materials-library.component";
import { ContactComponent } from '../component/contact.component';
import { UserComponent } from '../component/user.component';
import { LegalComponent } from "../component/legal.component";
import { AdminComponent } from '../component/admin.component';
import { VideosComponent } from '../component/videos.component';
import { LessonsLibraryComponent } from '../component/lessons-library.component';

// sub-views
import { MaterialsPageView } from '../view/materials-page.view';
import { EditableMetadataView } from '../view/editable-metadata.view';
import { DashboardMessageListView } from '../view/dashboard-message-list.view';
import { LogoView } from '../view/logo.view';
import { LoginView } from '../view/login.view';
import { UserFormView } from '../view/user-form.view';
import { LegalView } from '../view/legal.view';

// services
import { UserService } from "../service/user.service";
import { AppService } from '../service/app.service';
import { StripeService } from '../service/stripe.service';
import { LibraryService } from "../service/library.service";
import { LessonService } from '../service/lesson.service';
import { AuthGuard } from "../service/auth-guard.service";
import { HistoryService } from '../service/history.service';

import { FormInputDirective } from '../directive/form-input.directive';
import { BracketCardDirective } from '../directive/bracket-card.directive';
import { DraggableDirective } from '../directive/draggable.directive';
import { DroppableDirective } from '../directive/droppable.directive';
import { FormSwitchDirective } from '../directive/form-switch.directive';
import { InfiniteScrollDirective } from '../directive/infinite-scroll.directive';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        HttpModule,
        BrowserAnimationsModule,
        AppRoutingModule,
     ],
    declarations: [
        LoginScreenComponent,
        AppComponent,
        SignupComponent,
        ChangePasswordComponent,
        LogoView,
        LoginView,
        UserFormView,
        LegalView,
        FormInputDirective,
        BracketCardDirective,
        DraggableDirective,
        DroppableDirective,
        FormSwitchDirective,
        InfiniteScrollDirective,

        UnauthorizedComponent,
        DashboardComponent,
        MaterialsLibraryComponent,
        ContactComponent,
        UserComponent,
        LegalComponent,
        AdminComponent,
        VideosComponent,
        LessonsLibraryComponent,
        
        NotFoundComponent,
        
        MaterialsPageView,
        EditableMetadataView,
        DashboardMessageListView
    ],
    bootstrap: [ AppComponent ],
    providers: [
        PathLocationStrategy,
        AppHttp,
        AppService,
        UserService,
        StripeService,
        LibraryService,
        LessonService,
        AuthGuard,
        HistoryService
    ]
})

export class AppModule { }
