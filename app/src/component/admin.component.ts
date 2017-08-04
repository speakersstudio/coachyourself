import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent} from '../component/app.component';

import { API } from '../constants';

import { TabData } from '../model/tab-data';

import { AppService } from '../service/app.service';
import { LibraryService } from '../service/library.service';
import { LessonService } from '../service/lesson.service';
import { HistoryService } from '../service/history.service';

import { Subscription } from '../model/subscription';
import { Package } from '../model/package';
import { MaterialItem, MaterialItemVersion } from '../model/material-item';
import { HistoryModel } from '../model/history';
import { Lesson, LessonVersion } from '../model/lesson';

import { UserService } from '../service/user.service';

import { TimeUtil } from '../util/time.util';

import { AppHttp } from '../data/app-http';

import { Util } from '../util/util';
import { DialogAnim } from '../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "admin",
    templateUrl: "../template/admin.component.html",
    animations: [DialogAnim.dialog]
})
export class AdminComponent implements OnInit {

    @ViewChild('versionFileInput') versionFileInput: ElementRef;
    @ViewChild('lessonVersionFileInput') versionFileInputLesson: ElementRef;

    tabs: TabData[] = [
        {
            name: 'Material Items',
            id: 'materials',
            icon: 'file'
        },
        {
            name: 'Packages',
            id: 'packages',
            icon: 'book'
        },
        {
            name: 'Lessons',
            id: 'lessons',
            icon: 'microphone'
        },
        {
            name: 'History',
            id: 'history',
            icon: 'history'
        }
    ];
    selectedTab: string = 'materials';

    materialItems: MaterialItem[];
    selectedMaterial: MaterialItem;

    lessons: Lesson[];
    selectedLesson: Lesson;

    newVersion: MaterialItemVersion;
    newVersionFile: File;

    packages: Package[];
    selectedPackage: Package;
    selectedPackageDescription: string;

    selectPackageDialogVisible: boolean;
    selectMaterialDialogVisible: boolean;

    histories: HistoryModel[];
    historyDisplayCount: number = 0;
    rawHistories: HistoryModel[];
    historyShowRefresh: boolean;
    historyShowLogin: boolean;
    historyShowStuff: boolean = true;

    isPosting: boolean;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private _service: AppService,
        private libraryService: LibraryService,
        private lessonService: LessonService,
        private userService: UserService,
        private historyService: HistoryService,
        private http: AppHttp
    ) { }

    // _tools: Tool[] = [
    //     {
    //         icon: "fa-database",
    //         name: "backup",
    //         text: "Back Up Database"
    //     },
    //     {
    //         icon: "fa-cloud-upload",
    //         name: "restoredb",
    //         text: "Restore Database from Backup"
    //     }
    // ]

    // onToolClicked(tool: Tool): void {
    //     switch (tool.name) {
    //         case "backup":
    //             this.doBackup();
    //             break;
    //         case "restoredb":
    //             this.restore();
    //             break;
    //     }
    // }

    ngOnInit(): void {
        this.showMaterials();
        this.showPackages();
        this.showLessons();
        this.getHistory();
    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;

        this.selectedMaterial = null;
        this.selectedPackage = null;
        this.selectedLesson = null;
    }

    back(): void {
        this.selectedMaterial = null;
        this.selectedPackage = null;
    }

    simpleDate(date: string): string {
        return TimeUtil.simpleDate(date);
    }

    simpleDateTime(date: string): string {
        return TimeUtil.simpleDate(date) + ' ' + TimeUtil.simpleTime(date);
    }

    showMaterials(): void {
        this.libraryService.getAllMaterials()
            .then(materials => {
                this._app.hideLoader();
                this.materialItems = materials;
            });
    }

    showPackages(): void {
        this.libraryService.getAllPackages()
            .then(packages => {
                this.packages = packages;
            })
    }

    showLessons(): void {
        this.lessonService.getAllLessons()
            .then(lessons => {
                this.lessons = lessons;
            });
    }

    getHistory(): void {
        this.historyService.getAllHistory().then(histories => {
            this.rawHistories = histories;
            this.filterHistory();
        });
    }

    getHistoryIcon(history: HistoryModel): string {
        switch(history.action) {
            case 'game_edit':
                return 'fa-rocket';
            case 'material_view':
                return 'fa-file-pdf-o';
            case 'change_password':
                return 'fa-key';
            case 'note_edit':
                return 'fa-sticky-note';
            case 'account_edit':
                return 'fa-user';
            case 'team_join':
                return 'fa-user-plus';
            case 'team_leave':
                return 'fa-user-times';
            case 'team_user_promote':
                return 'fa-black-tie';
            case 'login':
                return 'fa-sign-in';
            case 'logout':
                return 'fa-sign-out';
            case 'refresh':
                return 'fa-refresh';
            default:
                return 'fa-history';
        }
    }

    historyLink(event: MouseEvent, history: HistoryModel): void {

        event.preventDefault();

    }

    expandedHistory: HistoryModel;
    expandedHistoryTargetName: string;
    expandHistory(history: HistoryModel): void {
        if (this.expandedHistory == history ||
                history.action == 'login' || history.action == 'logout' || history.action == 'refresh') {

            this.expandedHistory = null;
            return;
        }

        this.expandedHistory = history;

        let target = history.target,
            reference = history.reference;

        this.expandedHistoryTargetName = 'loading';

        switch(history.action) {
            default:
                this.expandedHistoryTargetName = '';
                break;
        }
    }

    filterHistory(): void {
        setTimeout(() => {
            let count = 0;
            this.histories = [];
            this.rawHistories.some(h => {
                let include;
                if (h.action == 'refresh') {
                    include = this.historyShowRefresh;
                } else if (h.action == 'login' || h.action == 'logout' ) {
                    include = this.historyShowLogin;
                } else {
                    include = this.historyShowStuff;
                }
                if (include) {
                    this.histories.push(h)
                    count++;
                    if (count >= this.historyDisplayCount) {
                        return true;
                    }
                }
                return false;
            });
            setTimeout(() => {
                this.isPosting = false;
            }, 10);
        }, 10);
    }

    loadMoreHistory(count: number): void {
        this.isPosting = true;

        this.historyDisplayCount = (30 * count);
        this.filterHistory();
    }

    selectMaterial(material: MaterialItem): void {
        this.newVersion = new MaterialItemVersion();
        this.selectedMaterial = material;
        this.selectedTab = null;
    }

    selectPackage(p: Package): void {
        this.selectedPackage = p;
        this.selectedTab = null;

        this.selectedPackageDescription = p.description.join('\n');
    }

    selectLesson(lesson: Lesson): void {
        this.newVersion = new LessonVersion();
        this.selectedLesson = lesson;
        this.selectedTab = null;
    }

    createMaterial(): void {
        this.libraryService.createMaterial().then(m => {
            this.materialItems.push(m);
            this.selectMaterial(m);
        });
    }

    createPackage(): void {
        this.libraryService.createPackage().then(p => {
            this.packages.push(p);
            this.selectPackage(p);
        })
    }

    createLesson(): void {
        this.lessonService.createLesson().then(l => {
            this.lessons.push(l);
            this.selectLesson(l);
        });
    }

    saveMaterial(): void {
        if (typeof(this.selectedMaterial.tags) == 'string') {
            let tags:string = this.selectedMaterial.tags;
            let tagArray:string[] = [];
            tags.split(',').forEach(t => {
                tagArray.push(t.trim());
            });
            this.selectedMaterial.tags = tagArray;
        }
        this.libraryService.saveMaterial(this.selectedMaterial).then(() => {
            this._app.toast('It is done.');
        });
    }

    savePackage(): void {
        let descArray = this.selectedPackageDescription.split('\n');

        this.selectedPackage.description = descArray;
        this.libraryService.savePackage(this.selectedPackage).then(() => {
            this._app.toast('It is done.');
        });
    }

    saveLesson(): void {
        this.lessonService.saveLesson(this.selectedLesson).then(() => {
            this._app.toast('It is done.');
        });
    }

    fileChange(): void {
        let fileInput = this.versionFileInput.nativeElement;
        this.newVersionFile = fileInput.files[0];
    }

    saveVersion(): void {
        this.libraryService.postNewVersion(this.selectedMaterial._id, this.newVersion, this.newVersionFile).then(m => {
            this.selectedMaterial.versions = m.versions;
        });
    }

    deleteVersion(version: MaterialItemVersion): void {
        this.libraryService.deleteVersion(this.selectedMaterial._id, version).then(m => {
            this.selectedMaterial.versions = m.versions;
        })
    }

    lessonFileChange(): void {
        let fileInput = this.versionFileInputLesson.nativeElement;
        this.newVersionFile = fileInput.files[0];
    }

    saveLessonVersion(): void {
        this.lessonService.postNewVersion(this.selectedLesson._id, this.newVersion, this.newVersionFile).then(l => {
            this.selectedLesson.versions = l.versions;
        });
    }

    deleteLessonVersion(version: MaterialItemVersion): void {
        this.lessonService.deleteVersion(this.selectedLesson._id, version).then(l => {
            this.selectedLesson.versions = l.versions;
        })
    }

    doBackup(): void {
        this.http.get('/api/backup').toPromise().then(response => {
            let data = response.json();
            this._app.toast(data.timestamp);
        })
    }

    restore(): void {
        this._app.dialog('Are you sure?', 'Restoring the database backup cannot be undone or stopped.', 'Do it', (timestamp: string) => {
            setTimeout(() => {
                this._app.toast('Restoring data . . .');
                this._app.showLoader();
                this.http.put('/api/restore', {timestamp: timestamp}).toPromise().then(response => {
                    this._app.hideLoader();
                    this._app.toast('Data restored');
                });
            }, 10);
        }, false, 'Timestamp');
    }

    deleteMaterial(): void {
        this._app.showLoader();
        this.libraryService.deleteMaterial(this.selectedMaterial).then(() => {
            let index = Util.indexOfId(this.materialItems, this.selectedMaterial);
            if (index > -1) {
                this.materialItems.splice(index, 1);
            }
            this.selectedMaterial = null;
            this.selectedTab = 'materials';
            this._app.hideLoader();
        });
    }

    deletePackage(): void {
        this._app.showLoader();
        this.libraryService.deletePackage(this.selectedPackage).then(() => {
            let index = Util.indexOfId(this.packages, this.selectedPackage);
            if (index > -1) {
                this.packages.splice(index, 1);
            }
            this.selectedPackage = null;
            this.selectedTab = 'packages';
            this._app.hideLoader();
        });
    }

    deleteLesson(): void {
        this._app.showLoader();
        this.lessonService.deleteLesson(this.selectedLesson).then(() => {
            let index = Util.indexOfId(this.lessons, this.selectedLesson);
            if (index > -1) {
                this.lessons.splice(index, 1);
            }
            this.selectedLesson = null;
            this.selectedTab = 'lessons';
            this._app.hideLoader();
        });
    }

    removePackageFromPackage(pkg: Package): void {
        let index = Util.indexOfId(this.selectedPackage.packages, pkg);
        this.selectedPackage.packages.splice(index, 1);
        this.libraryService.savePackagePackages(this.selectedPackage)
            .then(() => {
                this._app.toast('Package Packages saved');
            });
    }

    removeMaterialFromPackage(material: MaterialItem): void {
        let index = Util.indexOfId(this.selectedPackage.materials, material);
        this.selectedPackage.materials.splice(index, 1);
        this.libraryService.savePackageMaterials(this.selectedPackage)
            .then(() => {
                this._app.toast('Package Materials saved');
            });
    }

    packagePackagesDropped(droppedId: string, ontoId: string): void {
        let indexFrom, indexTo;
        indexFrom = Util.indexOfId(this.selectedPackage.packages, droppedId);
        indexTo = Util.indexOfId(this.selectedPackage.packages, ontoId);

        let packageToMove = this.selectedPackage.packages[indexFrom];
        this.selectedPackage.packages.splice(indexFrom, 1);
        this.selectedPackage.packages.splice(indexTo, 0, packageToMove);

        this.libraryService.savePackagePackages(this.selectedPackage)
            .then(() => {
                this._app.toast('Package Packages saved');
            });
    }

    packageMaterialsDropped(droppedId: string, ontoId: string): void {
        let indexFrom, indexTo;
        indexFrom = Util.indexOfId(this.selectedPackage.materials, droppedId);
        indexTo = Util.indexOfId(this.selectedPackage.materials, ontoId);

        let materialToMove = this.selectedPackage.materials[indexFrom];
        this.selectedPackage.materials.splice(indexFrom, 1);
        this.selectedPackage.materials.splice(indexTo, 0, materialToMove);

        this.libraryService.savePackageMaterials(this.selectedPackage)
            .then(() => {
                this._app.toast('Package Materials saved');
            });
    }

    cancelSelectMaterialDialog(): void {
        this.selectMaterialDialogVisible = false;
        this.selectPackageDialogVisible = false;
        this._app.backdrop(false);
    }

    showSelectMaterialDialog(): void {
        this.selectMaterialDialogVisible = true;
        this.selectPackageDialogVisible = false;
        this._app.backdrop(true);
    }

    showSelectPackageDialog(): void {
        this.selectPackageDialogVisible = true;
        this.selectMaterialDialogVisible = false;
        this._app.backdrop(true);
    }

    selectPackageForPackage(pkg: Package): void {
        this.selectedPackage.packages.push(pkg);

        this.libraryService.savePackagePackages(this.selectedPackage)
            .then(() => {
                this._app.toast('Package Packages saved');
            });
    }

    selectMaterialForPackage(material: MaterialItem): void {
        this.selectedPackage.materials.push(material);

        this.libraryService.savePackageMaterials(this.selectedPackage)
            .then(() => {
                this._app.toast('Package Materials saved');
            });
    }

}
