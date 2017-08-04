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
var app_component_1 = require("../component/app.component");
var lesson_service_1 = require("../service/lesson.service");
var anim_util_1 = require("../util/anim.util");
var LessonsLibraryComponent = (function () {
    function LessonsLibraryComponent(_app, router, route, lessonService, pathLocationStrategy) {
        this._app = _app;
        this.router = router;
        this.route = route;
        this.lessonService = lessonService;
        this.pathLocationStrategy = pathLocationStrategy;
        this.lessons = [];
    }
    LessonsLibraryComponent.prototype.ngOnInit = function () {
        this.getLibrary();
    };
    LessonsLibraryComponent.prototype.getLibrary = function () {
        var _this = this;
        this.lessonService.getLessons()
            .then(function (lessons) {
            _this._app.hideLoader();
            _this.lessons = lessons;
        });
    };
    LessonsLibraryComponent.prototype.selectLesson = function (lesson) {
        var _this = this;
        if (!lesson) {
            this.selectedLesson = null;
            this.lessonUrl = '';
            this._app.backdrop(false);
        }
        else if (lesson.versions.length > 0) {
            this._app.backdrop(true);
            this.selectedLesson = lesson;
            this.lessonService.downloadLesson(lesson._id).then(function (url) {
                _this.lessonUrl = url;
            });
        }
        else {
            this._app.dialog('Whoops', 'We seem to have not published any versions of that Lesson. Hopefully we\'re actively working to fix it. Try again in a few minutes, and if you still get this message, please let us know. You can email us at awesomedesk@thespeakers-studio.com or use the "Report a Bug" feature in the App menu.', 'Okay Then', null, true);
        }
    };
    LessonsLibraryComponent.prototype.versionTag = function (lesson) {
        var v = this.lessonService.getLatestVersionForLesson(lesson);
        // TODO: show the date this was released
        if (v) {
            return "version " + v.ver;
        }
        else {
            return "no version published";
        }
    };
    LessonsLibraryComponent.prototype.getMimeType = function (lesson) {
        var v = this.lessonService.getLatestVersionForLesson(lesson);
        switch (v.extension) {
            case 'mp3':
                return 'audio/mpeg';
            case 'wav':
                return 'audio/wav';
            case 'ogg':
                return 'audio/ogg';
        }
    };
    LessonsLibraryComponent.prototype.onNoVersionsSelected = function () {
    };
    LessonsLibraryComponent.prototype.clearFilter = function () {
    };
    LessonsLibraryComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: "packages",
            templateUrl: "../template/lessons-library.component.html",
            animations: [anim_util_1.DialogAnim.dialog]
        }),
        __metadata("design:paramtypes", [app_component_1.AppComponent,
            router_1.Router,
            router_1.ActivatedRoute,
            lesson_service_1.LessonService,
            common_1.PathLocationStrategy])
    ], LessonsLibraryComponent);
    return LessonsLibraryComponent;
}());
exports.LessonsLibraryComponent = LessonsLibraryComponent;

//# sourceMappingURL=lessons-library.component.js.map
