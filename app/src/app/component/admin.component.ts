import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent} from '../../component/app.component';
import { Tool } from '../view/toolbar.view';

import { API } from '../../constants';

import { TabData } from '../../model/tab-data';

import { AppService } from '../../service/app.service';
import { LibraryService } from '../service/library.service';
import { HistoryService } from '../service/history.service';
import { GameDatabaseService } from '../service/game-database.service';

import { PackageConfig } from '../../model/config';
import { Subscription } from '../../model/subscription';
import { Package } from '../../model/package';
import { MaterialItem, MaterialItemVersion } from '../../model/material-item';
import { HistoryModel } from '../../model/history';
import { Tag } from '../../model/tag';

import { UserService } from '../../service/user.service';

import { TimeUtil } from '../../util/time.util';

import { AppHttp } from '../../data/app-http';

import { Util } from '../../util/util';
import { DialogAnim } from '../../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "admin",
    templateUrl: "../template/admin.component.html",
    animations: [DialogAnim.dialog]
})
export class AdminComponent implements OnInit {

    @ViewChild('versionFileInput') versionFileInput: ElementRef;

    title: string = '<span class="light">super</span><strong>admin</strong>';

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
            name: 'Package Config',
            id: 'packageconfig',
            icon: 'wrench'
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

    packageConfig: PackageConfig;

    isPosting: boolean;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private _service: AppService,
        private libraryService: LibraryService,
        private userService: UserService,
        private historyService: HistoryService,
        private gameService: GameDatabaseService,
        private http: AppHttp
    ) { }

    _tools: Tool[] = [
        {
            icon: "fa-database",
            name: "backup",
            text: "Back Up Database"
        },
        {
            icon: "fa-cloud-upload",
            name: "restoredb",
            text: "Restore Database from Backup"
        }
    ]

    onToolClicked(tool: Tool): void {
        switch (tool.name) {
            case "backup":
                this.doBackup();
                break;
            case "restoredb":
                this.restore();
                break;
        }
    }

    ngOnInit(): void {
        this.showMaterials();
        this.showPackages();
        this.getHistory();

        this._service.getPackageConfig().then(c => {
            this.packageConfig = c;
        });
    }

    selectTab(tab: TabData): void {
        this.selectedTab = tab.id;
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
        switch(history.action) {
            case 'game_edit':
            case 'game_tag_add':
            case 'game_tag_remove':
                this.router.navigate(['/app/game', history.target]);
                break;
        }

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
            case 'game_edit':
                this.gameService.getGame(target).then(game => {
                    if (game.names.length) {
                        this.expandedHistoryTargetName = game.names[0].name;
                    } else {
                        this.expandedHistoryTargetName = '';
                    }
                });
                break;
            case 'game_tag_add':
                this.gameService.getGame(target).then(game => {
                    this.expandedHistoryTargetName = '';
                    if (game.tags.length) {
                        let index = Util.indexOfId(game.tags, reference);
                        if (index > -1) {
                            this.expandedHistoryTargetName = '<span class="tag"><i class="fa fa-hashtag"></i> ' + (<Tag> game.tags[index]).name + '</span> &gt; ';
                        }
                    }

                    if (game.names.length) {
                        this.expandedHistoryTargetName += game.names[0].name;
                    }
                })
                break;
            case 'game_tag_remove':
                this.gameService.getGame(target).then(game => {
                    this.expandedHistoryTargetName = '';
                    this.expandedHistoryTargetName = '<span class="tag"><i class="fa fa-remove"></i> ' + reference + '</span> &lt; ';

                    if (game.names.length) {
                        this.expandedHistoryTargetName += game.names[0].name;
                    }
                })
                break;
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
    }

    selectPackage(p: Package): void {
        this.selectedPackage = p;

        this.selectedPackageDescription = p.description.join('\n');
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

    savePackageConfig(): void {
        this.http.put(API.packageConfig, this.packageConfig)
            .toPromise()
            .then(response => {
                this._app.toast('Config saved');
            })
    }

}
