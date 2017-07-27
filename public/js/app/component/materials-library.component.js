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
var common_1 = require("@angular/common");
var router_1 = require("@angular/router");
var app_component_1 = require("../../component/app.component");
var library_service_1 = require("../service/library.service");
var MaterialsLibraryComponent = (function () {
    function MaterialsLibraryComponent(_app, router, route, libraryService, pathLocationStrategy) {
        this._app = _app;
        this.router = router;
        this.route = route;
        this.libraryService = libraryService;
        this.pathLocationStrategy = pathLocationStrategy;
        this.title = '<span class="light">materials</span><strong>library</strong>';
    }
    MaterialsLibraryComponent.prototype.ngOnInit = function () {
        this.getLibrary();
    };
    MaterialsLibraryComponent.prototype.getLibrary = function () {
        var _this = this;
        this.libraryService.getOwnedMaterials()
            .then(function (materials) {
            _this._app.hideLoader();
            _this.ownedMaterials = materials;
        });
    };
    MaterialsLibraryComponent.prototype.onNoVersionsSelected = function () {
    };
    MaterialsLibraryComponent.prototype.clearFilter = function () {
    };
    MaterialsLibraryComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "packages",
            templateUrl: "../template/materials-library.component.html"
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            router_1.ActivatedRoute,
            library_service_1.LibraryService,
            common_1.PathLocationStrategy])
    ], MaterialsLibraryComponent);
    return MaterialsLibraryComponent;
}());
exports.MaterialsLibraryComponent = MaterialsLibraryComponent;

//# sourceMappingURL=materials-library.component.js.map
