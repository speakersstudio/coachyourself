import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import {AppComponent    } from '../../component/app.component';
import { Tool, SearchResult } from '../view/toolbar.view';

import { Tag } from '../../model/tag';

import { GameDatabaseService } from '../service/game-database.service';
import { UserService } from '../../service/user.service';

import { Util } from '../../util/util';

@Component({
    moduleId: module.id,
    selector: "glossary",
    templateUrl: "../template/glossary.component.html"
})
export class GlossaryComponent implements OnInit {

    title: string = '<span class="light">glossary</span>';

    tags: Tag[];

    toggleGamelessTags: boolean = false;
    toggleAllTags: boolean = false;

    private _tagDisplayCount: number = 0;
    allTagsAreDisplayed: boolean;

    isLoadingTags: boolean;

    selectedTag: Tag;
    tagName: string;
    tagDescription: string;

    superAdmin: boolean;

    filter: string;

    constructor(
        public _app: AppComponent,
        private router: Router,
        private gameService: GameDatabaseService,
        public userService: UserService
    ) { }

    _tools: Tool[] = [
    ]

    ngOnInit(): void {
        this.superAdmin = this.userService.isSuperAdmin();
    }

    allTagsToggle(): void {
        setTimeout(() => {
            this.getTags();
        }, 100);
    }

    getTags(): void {
        this.selectedTag = null;
        this.isLoadingTags = true;

        this.gameService.getTags().then(tags => {
            let filteredtags = tags.filter(tag => {
                    if (this.toggleGamelessTags) {
                        return tag.games.length == 0;
                    } else {
                        let pass = this.toggleAllTags || !!tag.description;
                        if (this.filter) {
                            pass = pass &&
                                (tag.name.toLowerCase().indexOf(this.filter.toLowerCase()) > -1 ||
                                    tag.description.toLowerCase().indexOf(this.filter.toLowerCase()) > -1)
                        }
                        return pass;
                    }
                }).sort((a, b) => {
                    return a.name.localeCompare(b.name);
                });
            if (filteredtags.length > this._tagDisplayCount) {
                this.tags = filteredtags.slice(0, this._tagDisplayCount);
                this.allTagsAreDisplayed = false;
            } else {
                this.tags = filteredtags;
                this.allTagsAreDisplayed = true;
            }
            this.isLoadingTags = false;
        });
    }

    loadMoreTags(page: number): void {
        if (!this.allTagsAreDisplayed) {
            this._tagDisplayCount = 30 * page;
            this.getTags();
        }
    }

    onSelect(tag: Tag): void {
        if (this.selectedTag && this.selectedTag._id == tag._id) {
            return;
        }
        this.selectedTag = tag;
        this.tagName = tag.name;
        this.tagDescription = tag.description;
    }

    savingTag: Tag;
    saveTag(): void {
        this.savingTag = this.selectedTag;

        this.savingTag.name = this.tagName;
        this.savingTag.description = this.tagDescription;

        this.gameService.saveTag(this.savingTag).then(tag => {
            this.savingTag = null;
        });

        setTimeout(() => {
            this.selectedTag = null;
        }, 10);
    }

    deleteTag(): void {
        let index = Util.indexOfId(this.tags, this.selectedTag);
        this.gameService.deleteTag(this.selectedTag);

        setTimeout(() => {
            this.tags.splice(index, 1);
            this.selectedTag = null;
        }, 10);
    }

    onSearch(result: SearchResult): void {
        if (result.type == 'search') {
            this.filter = result.text;
            this.getTags();
        }
    }

    clearFilter(): void {
        this.filter = '';
        this.getTags();
    }

    createTag(): void {
        this.savingTag = new Tag();
        this.tags.unshift(this.savingTag);

        this.gameService.newTag().then(tag => {
            this.tags.splice(0, 1, tag);
            this.savingTag = null;
        });
    }

}
