import {
    Directive,
    ElementRef,
    OnInit,
    OnDestroy,
    OnChanges,
    Input,
    Output,
    EventEmitter
} from '@angular/core';

import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs/Observable';

import { AppComponent } from '../component/app.component';

@Directive({
    selector: '[infiniteScroll]'
})
export class InfiniteScrollDirective implements OnInit, OnDestroy, OnChanges {

    @Output() load = new EventEmitter<number>(); // emits an event with the current scroll position

    @Input('disable') _disabled: boolean = false;
    private _ignore: boolean;

    element: HTMLElement;
    scrollSubscription: Subscription;

    toolbarHeight: number = 48;
    offsetTop: number;
    height: number;

    loadCount: number = 0;

    constructor(
        private _elementRef: ElementRef,
        private _app: AppComponent
    ) {
        this.element = _elementRef.nativeElement;
    }

    ngOnInit() {
        // this.scrollSubscription = Observable.fromEvent(window, 'scroll')
        //     .throttle(() => Observable.timer(300))
        //     .filter(() => !this._disabled)
        //     .subscribe(() => this.handleOnScroll());

        this.scrollSubscription = this._app.onScroll$
            .debounce(() => Observable.timer(50))
            .filter(() => !this._disabled && !this._ignore)
            .subscribe(pos => this.handleOnScroll(pos));

        setTimeout(() => {
            let rect = this.element.getBoundingClientRect(); // lol rekt
            this.offsetTop = rect.top;

            this.handleOnScroll(0);
        }, 100);
    }

    ngOnDestroy() {
        this.scrollSubscription.unsubscribe();
    }

    ngOnChanges(changes: any) {
        // if (changes._disabled && !changes._disabled.currentValue) {
        //     this.handleOnScroll();
        // }
    }

    handleOnScroll(pos?: number): void {
        pos = pos || document.scrollingElement.scrollTop;

        this.height = this.element.offsetHeight;
        let triggerPoint = (this.offsetTop + this.height) - (window.innerHeight * 0.5);
        
        if (pos + window.innerHeight >= triggerPoint) {
            this.loadCount++;
            this.load.emit(this.loadCount);
        }
    }
}