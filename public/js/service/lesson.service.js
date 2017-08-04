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
require("rxjs/add/operator/toPromise");
var app_http_1 = require("../data/app-http");
var constants_1 = require("../constants");
var user_service_1 = require("../service/user.service");
var LessonService = (function () {
    function LessonService(http, userService) {
        this.http = http;
        this.userService = userService;
    }
    LessonService.prototype.getLessons = function () {
        return this.http.get(constants_1.API.lessons)
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LessonService.prototype.getAllLessons = function () {
        return this.http.get(constants_1.API.getLesson('all'))
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LessonService.prototype.getDashboardLessons = function () {
        return this.http.get(constants_1.API.getDashboardLessons)
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LessonService.prototype.downloadLesson = function (id) {
        return this.http.get(constants_1.API.getLesson(id))
            .toPromise()
            .then(function (response) {
            return response.json().url;
        });
    };
    LessonService.prototype.getLatestVersionForLesson = function (lesson) {
        lesson.versions.sort(function (a, b) {
            return b.ver - a.ver;
        });
        return lesson.versions[0];
    };
    LessonService.prototype.createLesson = function () {
        if (this.userService.can('material_create')) {
            return this.http.post(constants_1.API.lessons, {})
                .toPromise()
                .then(function (response) {
                return response.json();
            });
        }
    };
    LessonService.prototype.saveLesson = function (lesson) {
        if (!this.userService.isSuperAdmin()) {
            return;
        }
        return this.http.put(constants_1.API.getLesson(lesson._id), lesson)
            .toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LessonService.prototype.deleteLesson = function (lesson) {
        if (this.userService.can('lesson_delete')) {
            return this.http.delete(constants_1.API.getLesson(lesson._id))
                .toPromise()
                .then(function (response) {
                return true;
            });
        }
    };
    LessonService.prototype.postNewVersion = function (materialItemId, version, file) {
        if (!this.userService.isSuperAdmin()) {
            return;
        }
        var formData = new FormData();
        formData.append('ver', version.ver + '');
        formData.append('description', version.description);
        formData.append('file', file, file.name);
        return this.http.postFormData(constants_1.API.lessonVersion(materialItemId), formData).toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LessonService.prototype.deleteVersion = function (id, version) {
        if (!this.userService.isSuperAdmin()) {
            return;
        }
        return this.http.delete(constants_1.API.getLessonVersion(id, version._id)).toPromise()
            .then(function (response) {
            return response.json();
        });
    };
    LessonService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [app_http_1.AppHttp,
            user_service_1.UserService])
    ], LessonService);
    return LessonService;
}());
exports.LessonService = LessonService;

//# sourceMappingURL=lesson.service.js.map
