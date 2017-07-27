"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var common_1 = require("@angular/common");
// import { BrowserModule } from '@angular/platform-browser';
// import { HttpModule } from '@angular/http';
var forms_1 = require("@angular/forms");
// import { PathLocationStrategy } from '@angular/common';
var shared_module_1 = require("../../module/shared.module");
var loggedin_routing_module_1 = require("./loggedin-routing.module");
// services
var library_service_1 = require("../service/library.service");
var auth_guard_service_1 = require("../service/auth-guard.service");
var history_service_1 = require("../service/history.service");
// main components
// import { AppComponent } from '../component/app.component';
var unauthorized_component_1 = require("../component/unauthorized.component");
var dashboard_component_1 = require("../component/dashboard.component");
var materials_library_component_1 = require("../component/materials-library.component");
var contact_component_1 = require("../component/contact.component");
var user_component_1 = require("../component/user.component");
var legal_component_1 = require("../component/legal.component");
var admin_component_1 = require("../component/admin.component");
var videos_component_1 = require("../component/videos.component");
var not_found_component_1 = require("../component/not-found.component");
// sub-views
var materials_page_view_1 = require("../view/materials-page.view");
var editable_metadata_view_1 = require("../view/editable-metadata.view");
var dashboard_message_list_view_1 = require("../view/dashboard-message-list.view");
// utils
var LoggedInModule = (function () {
    function LoggedInModule() {
    }
    LoggedInModule = __decorate([
        core_1.NgModule({
            imports: [
                // BrowserModule,
                forms_1.FormsModule,
                forms_1.ReactiveFormsModule,
                // HttpModule,
                common_1.CommonModule,
                shared_module_1.SharedModule,
                loggedin_routing_module_1.LoggedInRoutingModule
            ],
            declarations: [
                unauthorized_component_1.UnauthorizedComponent,
                dashboard_component_1.DashboardComponent,
                materials_library_component_1.MaterialsLibraryComponent,
                contact_component_1.ContactComponent,
                user_component_1.UserComponent,
                legal_component_1.LegalComponent,
                admin_component_1.AdminComponent,
                videos_component_1.VideosComponent,
                not_found_component_1.NotFoundComponent,
                materials_page_view_1.MaterialsPageView,
                editable_metadata_view_1.EditableMetadataView,
                dashboard_message_list_view_1.DashboardMessageListView
            ],
            // bootstrap: [ AppComponent ],
            providers: [
                library_service_1.LibraryService,
                auth_guard_service_1.AuthGuard,
                history_service_1.HistoryService
            ]
        })
    ], LoggedInModule);
    return LoggedInModule;
}());
exports.LoggedInModule = LoggedInModule;

//# sourceMappingURL=loggedin.module.js.map
