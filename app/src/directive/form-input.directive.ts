import {
    Directive,
    ElementRef,
    OnInit,
    OnDestroy,
    Input,
    Output,
    EventEmitter,
    Renderer2
} from '@angular/core';

@Directive({
    selector: '[formInput]',
    host: {
        '(focus)': 'focus()',
        '(blur)': 'blur()',
        '(input)': 'input()'
    }
})
export class FormInputDirective implements OnInit, OnDestroy {

    @Input() error: string;
    @Input() asterisk: boolean = true;
    @Input() helpLink: string;

    @Output() helpClicked: EventEmitter<boolean> = new EventEmitter();

    inputElement: HTMLInputElement|HTMLTextAreaElement;
    divElement: HTMLDivElement;
    labelElement: HTMLLabelElement;
    helpLinkElement: HTMLAnchorElement;
    placeholder: string;

    constructor(
        el: ElementRef,
        private renderer: Renderer2
        ) {
        this.inputElement = el.nativeElement;
    }

    ngOnInit(): void {
        setTimeout(() => {
            this.placeholder = this.inputElement.getAttribute('placeholder');

            let classes = this.inputElement.classList;

            this.divElement = document.createElement('div');
            this.divElement.className = 'form-input ' + classes;

            if (this.inputElement.name) {
                this.divElement.className += ' form-input-' + this.inputElement.name;
            }

            this.inputElement.parentElement.insertBefore(this.divElement, this.inputElement.nextSibling);
            this.divElement.appendChild(this.inputElement);

            if (this.helpLink) {
                this.helpLinkElement = document.createElement('a');
                this.helpLinkElement.innerText = this.helpLink;
                this.helpLinkElement.className = 'help';
                this.divElement.appendChild(this.helpLinkElement);

                this.renderer.listen(this.helpLinkElement, 'click', e => this.clickHelp());
            }

            this.inputElement.setAttribute('placeholder', '');

            this.labelElement = document.createElement('label');
            this.labelElement.textContent = this.placeholder;
            if (this.inputElement.required && this.asterisk) {
                this.labelElement.textContent += ' *';
            }
            this.divElement.appendChild(this.labelElement);

            setTimeout(() => {
                if (this.inputElement.value) {
                    this.focus();
                }
            }, 10);
        }, 100);
    }

    ngOnDestroy(): void {
        // this.divElement.remove();
    }

    focus(): void {
        this.labelElement.className = 'active';
    }

    blur(): void {
        if (!this.inputElement.value) {
            this.labelElement.className = '';
        } else {
            this.focus();
        }
    }

    input(): void {
        if (this.helpLinkElement) {
            if (this.inputElement.value) {
                this.helpLinkElement.className = 'help gone';
            } else {
                this.helpLinkElement.className = 'help';
            }
        }
    }

    clickHelp(): void {
        this.helpClicked.emit(true);
    }
    
}