import {
    Directive,
    ElementRef,
    OnInit,
    Output,
    EventEmitter
} from '@angular/core';

@Directive({
    selector: '[makeDroppable]'
})
export class DroppableDirective implements OnInit {
    @Output() dropped: EventEmitter<string> = new EventEmitter();

    constructor(private _elementRef: ElementRef) {}

    ngOnInit() {
        let el:HTMLElement = this._elementRef.nativeElement;

        el.addEventListener('dragenter', (e) => {
            el.classList.add('over');
        });

        el.addEventListener('dragleave', (e) => {
            el.classList.remove('over');
        });

        el.addEventListener('dragover', (e) => {
            if (e.preventDefault) {
                e.preventDefault();
            }

            e.dataTransfer.dropEffect = 'move';
            return false;
        });

        el.addEventListener('drop', (e) => {
            if (e.stopPropagation) {
                e.stopPropagation();
            }

            el.classList.remove('over');
            let data = e.dataTransfer.getData('text');
            this.dropped.emit(data);
            return false;
        })
    }
}