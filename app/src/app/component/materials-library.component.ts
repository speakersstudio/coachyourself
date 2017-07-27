import { Component, OnInit } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {AppComponent    } from '../../component/app.component';

import { LibraryService } from '../service/library.service';

import { Subscription } from '../../model/subscription';
import { Package } from '../../model/package';
import { MaterialItem } from '../../model/material-item';
import { Library } from '../../model/library';

@Component({
    moduleId: module.id,
    selector: "packages",
    templateUrl: "../template/materials-library.component.html"
})
export class MaterialsLibraryComponent implements OnInit {

    title: string = '<span class="light">materials</span><strong>library</strong>';

    filter: boolean; // TODO

    ownedMaterials: Library;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private route: ActivatedRoute,
        private libraryService: LibraryService,
        private pathLocationStrategy: PathLocationStrategy
    ) { }

    ngOnInit(): void {
        this.getLibrary();
    }

    getLibrary(): void {

        this.libraryService.getOwnedMaterials()
            .then(materials => {
                this._app.hideLoader();
                this.ownedMaterials = materials;
            });
        
    }

    onNoVersionsSelected(): void {
        
    }

    clearFilter(): void {

    }

}
