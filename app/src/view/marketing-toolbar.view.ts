import { 
    Component,
    OnInit,
    Input,
    ViewChild,
    ElementRef
} from '@angular/core';

import { MOBILE_WIDTH } from '../constants';
import { AppComponent } from '../component/app.component';

@Component({
    moduleId: module.id,
    selector: 'marketing-toolbar',
    templateUrl: '../template/view/marketing-toolbar.view.html'
})
export class MarketingToolbarView implements OnInit {

    @ViewChild('toolbar') toolbarRef: ElementRef;

    @Input() on: boolean;
    @Input() onWhenOpen: boolean;

    open: boolean;

    constructor(
        public _app: AppComponent
    ) { }

    ngOnInit(): void {
        
    }

    clickIcon(): void {
        if (window.innerWidth <= MOBILE_WIDTH) {
            this.open = !this.open;
        } else {
            this._app.login();
        }
    }

    login(): void {
        this._app.login();
    }
}
