import { 
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter,
    Pipe
} from '@angular/core';

import {AppComponent    } from '../../component/app.component';

import { TabData } from '../../model/tab-data';

import { LibraryService } from '../service/library.service';

import { MaterialItem } from '../../model/material-item';
import { Package } from '../../model/package';
import { Library } from '../../model/library';

@Component({
    moduleId: module.id,
    selector: '.materials-page',
    templateUrl: '../template/view/materials-page.view.html'
})
export class MaterialsPageView implements OnInit {
    @Input() library: Library;

    constructor(
        private _app: AppComponent,
        private libraryService: LibraryService
    ) { }

    ngOnInit(): void {

    }

    selectMaterial(material: MaterialItem): void {
        if (material.versions.length > 0) {
            this.libraryService.downloadMaterial(material._id);
        } else {
            this._app.dialog('Whoops', 'We seem to have not published any versions of that Material Item. Hopefully we\'re actively working to fix it. Try again in a few minutes, and if you still get this message, please let us know. You can email us at awesomedesk@thespeakers-studio.com or use the "Report a Bug" feature in the App menu.', 'Okay Then', null, true);
        }
    }

    findPackageById(id: string): Package {
        let pkg: Package;
        this.library.packages.forEach(thispkg => {
            if (thispkg._id == id) {
                pkg = thispkg;
                return false;
            }
        });
        return pkg;
    }

    selectPackage(pkg: Package): void {
        this.selectPackageById(pkg._id);
    }

    selectPackageById(id: string): void {
        this.libraryService.downloadPackage(id);
    }

    versionTag(m: MaterialItem): string {
        let v = this.libraryService.getLatestVersionForMaterialItem(m);
        // TODO: show the date this was released
        if (v) {
            return "version " + v.ver;
        } else {
            return "no version published";
        }
    }
}
