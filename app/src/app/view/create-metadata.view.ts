import { 
    Component,
    OnInit,
    Input,
    Output,
    EventEmitter
} from '@angular/core';
import { Router } from '@angular/router';

import { GameDatabaseService } from "../service/game-database.service";
import { UserService } from "../../service/user.service";

import { GameMetadata } from '../../model/game-metadata';

import { DialogAnim, ToggleAnim } from '../../util/anim.util';

@Component({
    moduleId: module.id,
    selector: "create-metadata",
    templateUrl: "../template/view/create-metadata.view.html",
    animations: [
        DialogAnim.dialog,
        ToggleAnim.fade
    ]
})
export class CreateMetadataView implements OnInit {

    @Output() done: EventEmitter<GameMetadata> = new EventEmitter();

    isPosting: boolean;

    @Input() type: string;
    outputType: string;

    name: string;
    min: number;
    max: number;
    description: string;

    constructor(
        private userService: UserService,
        private gameDatabaseService: GameDatabaseService
    ) { }

    ngOnInit(): void {
        this.outputType = this.type == 'playerCount' ? 'Player Count' : 'Duration';
    }

    createMetadata(): void {
        this.isPosting = true;
        if (this.userService.can('metadata_create')) {
            if (this.type == "playerCount") {
                // create a new player count
                this.gameDatabaseService.createPlayerCount(this.name, this.min, this.max, this.description)
                    .then(playercount => {
                        this.doDone(playercount);
                    });
            } else {
                // create a new Duration
                this.gameDatabaseService.createDuration(this.name, this.min, this.max, this.description)
                    .then(duration => {
                        this.doDone(duration);
                    });
            }
        } else {
            this.cancel();
        }
    }

    doDone(item: GameMetadata): void {
        this.isPosting = false;
        this.name = '';
        this.min = 0;
        this.max = 0;
        this.description = '';

        this.done.emit(item);
    }

    cancel(): boolean {
        this.done.emit(null);
        return false;
    }

}
