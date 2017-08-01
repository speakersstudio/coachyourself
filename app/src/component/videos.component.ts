import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AppComponent } from '../component/app.component';

@Component({
    moduleId: module.id,
    selector: "videos",
    templateUrl: "../template/videos.component.html"
})
export class VideosComponent implements OnInit {

    title: string = '<span class="light">video</span><strong>gallery</strong>';

    constructor(
        public _app: AppComponent,
        private router: Router
    ) { }

    ngOnInit(): void {
    }

}
