import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { AppComponent } from '../../component/app.component';
import { UserService } from '../../service/user.service';

@Component({
    moduleId: module.id,
    selector: "not-found",
    templateUrl: '../template/not-found.component.html'
})
export class NotFoundComponent implements OnInit {

    @Input() injected: boolean;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private userService: UserService,
        private _location: Location
    ) { }

    ngOnInit(): void {
        
        this._app.showBackground(true);

    }

    goback(): void {
        this._location.back();
    }

    dashboard(): void {
        this.router.navigate(['/app/dashboard']);
    }

}
