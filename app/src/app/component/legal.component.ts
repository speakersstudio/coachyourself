import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent} from '../../component/app.component';

@Component({
    moduleId: module.id,
    selector: "legal",
    templateUrl: "../template/legal.component.html"
})
export class LegalComponent implements OnInit {

    title: string = '<span class="light">legal</span><strong>stuff</strong>';

    constructor(
        public _app: AppComponent,
        private router: Router
    ) { }

    ngOnInit(): void {
    }

}
