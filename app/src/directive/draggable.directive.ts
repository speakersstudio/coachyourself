import {
    Directive,
    ElementRef,
    OnInit,
    Input
} from '@angular/core';

@Directive({
    selector: '[makeDraggable]'
})
export class DraggableDirective implements OnInit {
    @Input('makeDraggable') data : string;

    constructor(private _elementRef: ElementRef) {}

    ngOnInit() {
        let el:HTMLElement = this._elementRef.nativeElement;

        el.draggable = true;

        el.addEventListener('dragstart', (e) => {
            el.classList.add('drag-src');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text', this.data);
        });

        el.addEventListener('dragend', (e) => {
            e.preventDefault();
            el.classList.remove('drag-src');
        });
    }
}