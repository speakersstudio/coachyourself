import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import { RequestOptions, Headers } from '@angular/http';
import { AppHttp } from '../data/app-http';
import { API } from '../constants';

import { Lesson, LessonVersion } from '../model/lesson';
import { UserService } from '../service/user.service';

@Injectable()
export class LessonService {

    constructor(
        private http: AppHttp,
        private userService: UserService
        ) { }

    getLessons(): Promise<Lesson[]> {
        return this.http.get(API.lessons)
            .toPromise()
            .then(response => {
                return response.json() as Lesson[];
            });
    }

    getAllLessons(): Promise<Lesson[]> {
        return this.http.get(API.getLesson('all'))
            .toPromise()
            .then(response => {
                return response.json() as Lesson[];
            });
    }

    getDashboardLessons(): Promise<Lesson[]> {
        return this.http.get(API.getDashboardLessons)
            .toPromise()
            .then(response => {
                return response.json() as Lesson[];
            });
    }

    downloadLesson(id: string): Promise<string> {
        return this.http.get(API.getLesson(id))
            .toPromise()
            .then(response => {
                return response.json().url as string;
            });
    }
    
    getLatestVersionForLesson(lesson: Lesson): LessonVersion {
        lesson.versions.sort((a, b) => {
            return b.ver - a.ver;
        });
        return lesson.versions[0];
    }

    createLesson(): Promise<Lesson> {
        if (this.userService.can('material_create')) {
            return this.http.post(API.lessons, {})
                .toPromise()
                .then(response => {
                    return response.json() as Lesson;
                });
        }
    }

    saveLesson(lesson: Lesson): Promise<Lesson> {
        if (!this.userService.isSuperAdmin()) {
            return;
        }
        return this.http.put(API.getLesson(lesson._id), lesson)
            .toPromise()
            .then(response => {
                return response.json() as Lesson;
            });
    }

    deleteLesson(lesson: Lesson): Promise<boolean> {
        if (this.userService.can('lesson_delete')) {
            return this.http.delete(API.getLesson(lesson._id))
                .toPromise()
                .then(response => {
                    return true;
                })
        }
    }

    postNewVersion(materialItemId: string, version: LessonVersion, file: File): Promise<Lesson> {
        if (!this.userService.isSuperAdmin()) {
            return;
        }

        let formData = new FormData();
        formData.append('ver', version.ver + '');
        formData.append('description', version.description);
        formData.append('file', file, file.name);

        return this.http.postFormData(API.lessonVersion(materialItemId), formData).toPromise()
            .then(response => {
                return response.json() as Lesson;
            });
    }

    deleteVersion(id: string, version: LessonVersion): Promise<Lesson> {
        if (!this.userService.isSuperAdmin()) {
            return;
        }

        return this.http.delete(API.getLessonVersion(id, version._id)).toPromise()
            .then(response => {
                return response.json() as Lesson;
            });
    }
}