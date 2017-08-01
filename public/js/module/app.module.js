"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var platform_browser_1 = require("@angular/platform-browser");
var http_1 = require("@angular/http");
var forms_1 = require("@angular/forms");
var common_1 = require("@angular/common");
var animations_1 = require("@angular/platform-browser/animations");
var app_http_1 = require("../data/app-http");
// main components
var app_component_1 = require("../component/app.component");
var not_found_component_1 = require("../component/not-found.component");
var app_routing_module_1 = require("./app-routing.module");
var login_screen_component_1 = require("../component/login-screen.component");
var signup_component_1 = require("../component/signup.component");
var change_password_component_1 = require("../component/change-password.component");
var unauthorized_component_1 = require("../component/unauthorized.component");
var dashboard_component_1 = require("../component/dashboard.component");
var materials_library_component_1 = require("../component/materials-library.component");
var contact_component_1 = require("../component/contact.component");
var user_component_1 = require("../component/user.component");
var legal_component_1 = require("../component/legal.component");
var admin_component_1 = require("../component/admin.component");
var videos_component_1 = require("../component/videos.component");
// sub-views
var materials_page_view_1 = require("../view/materials-page.view");
var editable_metadata_view_1 = require("../view/editable-metadata.view");
var dashboard_message_list_view_1 = require("../view/dashboard-message-list.view");
var logo_view_1 = require("../view/logo.view");
var login_view_1 = require("../view/login.view");
var user_form_view_1 = require("../view/user-form.view");
var legal_view_1 = require("../view/legal.view");
// services
var user_service_1 = require("../service/user.service");
var app_service_1 = require("../service/app.service");
var stripe_service_1 = require("../service/stripe.service");
var library_service_1 = require("../service/library.service");
var auth_guard_service_1 = require("../service/auth-guard.service");
var history_service_1 = require("../service/history.service");
var form_input_directive_1 = require("../directive/form-input.directive");
var bracket_card_directive_1 = require("../directive/bracket-card.directive");
var draggable_directive_1 = require("../directive/draggable.directive");
var droppable_directive_1 = require("../directive/droppable.directive");
var form_switch_directive_1 = require("../directive/form-switch.directive");
var infinite_scroll_directive_1 = require("../directive/infinite-scroll.directive");
var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            imports: [
                platform_browser_1.BrowserModule,
                forms_1.FormsModule,
                forms_1.ReactiveFormsModule,
                http_1.HttpModule,
                animations_1.BrowserAnimationsModule,
                app_routing_module_1.AppRoutingModule,
            ],
            declarations: [
                login_screen_component_1.LoginScreenComponent,
                app_component_1.AppComponent,
                signup_component_1.SignupComponent,
                change_password_component_1.ChangePasswordComponent,
                logo_view_1.LogoView,
                login_view_1.LoginView,
                user_form_view_1.UserFormView,
                legal_view_1.LegalView,
                form_input_directive_1.FormInputDirective,
                bracket_card_directive_1.BracketCardDirective,
                draggable_directive_1.DraggableDirective,
                droppable_directive_1.DroppableDirective,
                form_switch_directive_1.FormSwitchDirective,
                infinite_scroll_directive_1.InfiniteScrollDirective,
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
            // exports: [
            //     LogoView,
            //     LoginView,
            //     UserFormView,
            //     LegalView,
            //     FormInputDirective,
            //     BracketCardDirective,
            //     DraggableDirective,
            //     DroppableDirective,
            //     FormSwitchDirective,
            //     InfiniteScrollDirective
            // ],
            bootstrap: [app_component_1.AppComponent],
            providers: [
                common_1.PathLocationStrategy,
                app_http_1.AppHttp,
                app_service_1.AppService,
                user_service_1.UserService,
                stripe_service_1.StripeService,
                library_service_1.LibraryService,
                auth_guard_service_1.AuthGuard,
                history_service_1.HistoryService
            ]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;

//# sourceMappingURL=app.module.js.map
