import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent} from '../../component/app.component';
import { Tool } from '../view/toolbar.view';

@Component({
    moduleId: module.id,
    selector: "history",
    templateUrl: "../template/about.component.html"
})
export class AboutComponent implements OnInit {

    title: string = '<span class="light">about</span><strong>us</strong>';

    constructor(
        public _app: AppComponent,
        private router: Router
    ) { }

    _tools: Tool[] = [
    ]

    ngOnInit(): void {

    }

}
