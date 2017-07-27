import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { BrowserModule } from '@angular/platform-browser';
// import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { PathLocationStrategy } from '@angular/common';

import { SharedModule } from '../../module/shared.module';
import { LoggedInRoutingModule } from './loggedin-routing.module';

// services
import { LibraryService } from "../service/library.service";
import { AuthGuard } from "../service/auth-guard.service";
import { HistoryService } from '../service/history.service';

// main components
// import { AppComponent } from '../component/app.component';
import { UnauthorizedComponent } from "../component/unauthorized.component";
import { DashboardComponent } from '../component/dashboard.component';
import { MaterialsLibraryComponent } from "../component/materials-library.component";
import { ContactComponent } from '../component/contact.component';
import { UserComponent } from '../component/user.component';
import { LegalComponent } from "../component/legal.component";
import { AdminComponent } from '../component/admin.component';
import { VideosComponent } from '../component/videos.component';

import { NotFoundComponent } from '../component/not-found.component';

// sub-views
import { MaterialsPageView } from '../view/materials-page.view';
import { EditableMetadataView } from '../view/editable-metadata.view';
import { DashboardMessageListView } from '../view/dashboard-message-list.view';

// utils

@NgModule({
    imports: [
        // BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        // HttpModule,
        CommonModule,
        SharedModule,
        LoggedInRoutingModule
     ],
    declarations: [
        UnauthorizedComponent,
        DashboardComponent,
        MaterialsLibraryComponent,
        ContactComponent,
        UserComponent,
        LegalComponent,
        AdminComponent,
        VideosComponent,
        
        NotFoundComponent,
        
        MaterialsPageView,
        EditableMetadataView,
        DashboardMessageListView
    ],
    // bootstrap: [ AppComponent ],
    providers: [
        LibraryService,
        AuthGuard,
        HistoryService
    ]
})

export class LoggedInModule { }
