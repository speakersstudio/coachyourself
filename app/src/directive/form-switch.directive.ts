import {
    Directive,
    ElementRef,
    OnInit,
    Input,
    Output,
    EventEmitter,
    Renderer2
} from '@angular/core';

@Directive({
    selector: '[formSwitch]',
    host: {
    }
})
export class FormSwitchDirective implements OnInit {

    inputElement: HTMLInputElement;

    wrapper: HTMLSpanElement;
    control: HTMLSpanElement;

    private _on: boolean;

    constructor(
        el: ElementRef,
        private renderer: Renderer2
        ) {
        this.inputElement = el.nativeElement;
    }

    ngOnInit(): void {
        let classes = this.inputElement.className;

        this.inputElement.setAttribute('type', 'checkbox');

        this.wrapper = document.createElement('span');
        this.wrapper.className = classes + ' form-switch';

        if (this.inputElement.name) {
            this.wrapper.className += ' form-switch-' + this.inputElement.name;
        }

        this.inputElement.parentElement.insertBefore(this.wrapper, this.inputElement);
        this.wrapper.appendChild(this.inputElement);

        this.control = document.createElement('i');
        this.control.className = 'control';
        this.wrapper.appendChild(this.control);

        let clickHandler;
        if (this.wrapper.parentElement.tagName.toLowerCase() == 'label') {
            clickHandler = this.wrapper.parentElement;
        } else {
            clickHandler = this.wrapper;
        }

        this.renderer.listen(clickHandler, 'click', e => this.click(e));

        setTimeout(() => {
            if (this.inputElement.checked) {
                this._on = true;
                this.wrapper.classList.add('on');
            }
        }, 50);
    }

    click(event: MouseEvent): void {
        if (!this._on) {
            this.wrapper.classList.add('on');
            this._on = true;
        } else {
            this.wrapper.classList.remove('on');
            this._on = false;
        }
        
        this.inputElement.checked = this._on;
        this.inputElement.dispatchEvent(new Event('change'));

        event.preventDefault();
    }
    
}