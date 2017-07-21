import { 
    Component,
    OnInit,
    OnDestroy,
    Input
} from '@angular/core';

import 'rxjs/Subscription';
import { Subscription } from 'rxjs/Subscription';

import { GameDatabaseService } from '../service/game-database.service';

import { Game } from '../../model/game';
import { Name } from '../../model/name';
import { GameMetadata } from '../../model/game-metadata';
import { Tag } from '../../model/tag';

@Component({
    moduleId: module.id,
    selector: '.ng-game-card',
    templateUrl: '../template/view/game-card.view.html'
})
export class GameCardView implements OnInit, OnDestroy {
    @Input() game: Game;
    playerCount: GameMetadata;
    duration: GameMetadata;

    iconClass:string = "rocket";
    iconDescription: string;
    descriptionText: string;

    constructor(
        private gameDatabaseService: GameDatabaseService
    ) { }

    ngOnInit(): void {


        if (this.game.description) {
            // this will create a description string without any HTML tags in it
            let div = document.createElement("div");
            div.innerHTML = this.game.description;
            this.descriptionText = div.textContent || div.innerText || this.game.description;
        }

        if (this.game.tags) {
            (<Tag[]> this.game.tags).forEach(tag => {
                // let's just make sure the tag actually exists
                if (tag && tag.name) {
                    switch(tag.name.toLowerCase()) {
                        case 'show':
                            this.iconClass = 'ticket';
                            this.iconDescription = tag.description;
                            break;
                        case 'exercise':
                            this.iconClass = 'lightbulb-o';
                            this.iconDescription = tag.description;
                            break;
                        case 'warmup':
                            this.iconClass = 'fire';
                            this.iconDescription = tag.description;
                            break;
                    }
                }
            })
        }
    }

    ngOnDestroy(): void {
        
    }
}
