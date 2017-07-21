import { Component, OnInit } from '@angular/core';
import { PathLocationStrategy } from '@angular/common';
import { Router, ActivatedRoute, Params } from '@angular/router';

import {AppComponent    } from '../../component/app.component';
import { Tool, SearchResult } from '../view/toolbar.view';

import { LibraryService } from '../service/library.service';
import { TeamService } from '../service/team.service';

import { Subscription } from '../../model/subscription';
import { Package } from '../../model/package';
import { MaterialItem } from '../../model/material-item';
import { Team } from '../../model/team';
import { Library } from '../../model/library';

@Component({
    moduleId: module.id,
    selector: "packages",
    templateUrl: "../template/materials-library.component.html"
})
export class MaterialsLibraryComponent implements OnInit {

    title: string = '<span class="light">materials</span><strong>library</strong>';

    filter: boolean; // TODO
    searchResults: SearchResult[] = [];

    ownedMaterials: Library;
    adminTeams: Team[] = [];
    teams: Team[] = [];

    constructor(
        public _app: AppComponent,
        private router: Router,
        private route: ActivatedRoute,
        private libraryService: LibraryService,
        private teamService: TeamService,
        private pathLocationStrategy: PathLocationStrategy
    ) { }

    _tools: Tool[] = [
    ]

    ngOnInit(): void {
        this.getLibrary();
    }

    onToolClicked(tool: Tool): void {
        
    }

    getLibrary(): void {
        this._app.showLoader();

        this.libraryService.getOwnedMaterials()
            .then(materials => {
                this._app.hideLoader();
                this.ownedMaterials = materials;
            });

        this.teamService.fetchTeams().then(user => {
            let adminOfTeams = user.adminOfTeams,
                memberOfTeams = user.memberOfTeams;

            (<Team[]> adminOfTeams).forEach(team => {
                this.libraryService.getTeamMaterials(team._id).then(library => {
                    team.library = library;
                    this.adminTeams.push(team);
                });
            });

            (<Team[]> memberOfTeams).forEach(team => {
                this.libraryService.getTeamMaterials(team._id).then(library => {
                    team.library = library;
                    this.teams.push(team);
                })
            });
        })

        
    }

    onNoVersionsSelected(): void {
        
    }

    clearFilter(): void {

    }

}
