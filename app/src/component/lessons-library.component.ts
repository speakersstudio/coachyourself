import { Component, OnInit } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {AppComponent    } from '../component/app.component';

import { LessonService } from '../service/lesson.service';

import { Lesson } from '../model/lesson';
import { DialogAnim } from '../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "packages",
    templateUrl: "../template/lessons-library.component.html",
    animations: [DialogAnim.dialog]
})
export class LessonsLibraryComponent implements OnInit {

    filter: boolean; // TODO

    lessons: Lesson[] = [];

    selectedLesson: Lesson;
    lessonUrl: string;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private route: ActivatedRoute,
        private lessonService: LessonService,
        private pathLocationStrategy: PathLocationStrategy
    ) { }

    ngOnInit(): void {
        this.getLibrary();
    }

    getLibrary(): void {

        this.lessonService.getLessons()
            .then(lessons => {
                this._app.hideLoader();
                this.lessons = lessons;
            });
        
    }

    selectLesson(lesson: Lesson): void {
        if (!lesson) {
            this.selectedLesson = null;
            this.lessonUrl = '';
            this._app.backdrop(false);
        } else if (lesson.versions.length > 0) {
            this._app.backdrop(true);
            this.selectedLesson = lesson;
            this.lessonService.downloadLesson(lesson._id).then(url => {
                this.lessonUrl = url;
            });
        } else {
            this._app.dialog('Whoops', 'We seem to have not published any versions of that Lesson. Hopefully we\'re actively working to fix it. Try again in a few minutes, and if you still get this message, please let us know. You can email us at awesomedesk@thespeakers-studio.com or use the "Report a Bug" feature in the App menu.', 'Okay Then', null, true);
        }
    }

    versionTag(lesson: Lesson): string {
        let v = this.lessonService.getLatestVersionForLesson(lesson);
        // TODO: show the date this was released
        if (v) {
            return "version " + v.ver;
        } else {
            return "no version published";
        }
    }

    getMimeType(lesson: Lesson): string {
        let v = this.lessonService.getLatestVersionForLesson(lesson);
        switch(v.extension) {
            case 'mp3':
                return 'audio/mpeg';
            case 'wav':
                return 'audio/wav';
            case 'ogg':
                return 'audio/ogg';
        }
    }

    onNoVersionsSelected(): void {
        
    }

    clearFilter(): void {

    }

}
