import { 
    Component,
    OnInit,
    OnDestroy,
    Input
} from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'iplus',
    templateUrl: '../template/view/iplus.view.html'
})
export class IPlusView implements OnInit, OnDestroy {
    @Input() white: boolean;
    @Input() text: String;

    hover: boolean;

    constructor(
    ) { }

    ngOnInit(): void {
        
    }

    ngOnDestroy(): void {
        
    }

    over(): void {
        this.hover = true;
    }

    out(): void {
        this.hover = false;
    }
}
