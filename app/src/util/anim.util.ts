import {
    trigger,
    state,
    style,
    transition,
    animate,
    keyframes,
    group
} from '@angular/animations';

const DEFAULT_DURATION = 200;
const DEFAULT_EASE = 'ease-in-out';

// bouncing
const EASE_IN_BACK = 'cubic-bezier(0.600, -0.280, 0.735, 0.045)';
const EASE_OUT_BACK = 'cubic-bezier(0.175, 0.885, 0.320, 1.275)';

export class DialogAnim {

    static instyle = {
        transform: 'scale(1)',
        opacity: 1
    };
    static outstyle = {
        transform: 'scale(0.1)',
        opacity: 0
    };

    static dialog = trigger('dialog', [
        state('default', style(DialogAnim.instyle)),
        state('shake', style(DialogAnim.instyle)),
        state('runaway', style({
            transform: 'scale(1) rotateZ(0)'
        })),
        transition('void => *', [
            style(DialogAnim.outstyle),
            animate(DEFAULT_DURATION + 'ms ' + EASE_OUT_BACK)
        ]),
        transition('default => void', [
            animate(DEFAULT_DURATION + 'ms ' + EASE_IN_BACK, style(DialogAnim.outstyle))
        ]),
        transition('default => shake', [
            animate('350ms', keyframes([
                style({transform: 'translateX(0px)', offset: 0}),
                style({transform: 'translateX(20px)', offset: 0.1}),
                style({transform: 'translateX(-20px)', offset: 0.3}),
                style({transform: 'translateX(20px)', offset: 0.5}),
                style({transform: 'translateX(-20px)', offset: 0.7}),
                style({transform: 'translateX(20px)', offset: 0.9}),
                style({transform: 'translateX(0px)', offset: 1})
            ]))
        ]),
        transition('runaway => void', [
            group([
                animate('3s 2s ease-in-out', style({transform: 'scale(0) rotateZ(560deg)'})),
                animate('3s 2s linear', keyframes([
                    style({left: '0px', top: '0px', offset: 0}),
                    style({left: '18px', top: '27px', offset: 0.1}),
                    style({left: '39px', top: '46px', offset: 0.2}),
                    style({left: '54px', top: '52px', offset: 0.25}),
                    style({left: '69px', top: '56px', offset: 0.3}),
                    style({left: '87px', top: '51px', offset: 0.35}),
                    style({left: '99px', top: '45px', offset: 0.4}),
                    style({left: '119px', top: '27px', offset: 0.5}),
                    style({left: '129px', top: '9px', offset: 0.55}),
                    style({left: '132px', top: '-6px', offset: 0.6}),
                    style({left: '126px', top: '-27px', offset: 0.65}),
                    style({left: '119px', top: '-37px', offset: 0.7}),
                    style({left: '91px', top: '-66px', offset: 0.8}),
                    style({left: '54px', top: '-91px', offset: 0.9}),
                    style({left: '12px', top: '-112px', offset: 1})
                ]))
            ])
        ])
    ]);

    static starburst = trigger('starburst', [
        state('in', style({transform: 'translateX(12px) translateY(-112px) scale(0)'})),
        transition('void => *', [
            // style({transform: 'translateX(12px) translateY(-112px) scale(0) rotateZ(360deg)'})
            animate('1.5s 5.5s linear', keyframes([
                style({transform: 'translateX(12px) translateY(-112px) scale(0) rotateZ(0)', offset: 0}),
                style({transform: 'translateX(12px) translateY(-112px) scale(1) rotateZ(180deg)', offset: 0.5}),
                style({transform: 'translateX(12px) translateY(-112px) scale(0) rotateZ(0)', offset: 1})
            ]))
        ])
    ])

}

export class ToggleAnim {
    static STYLE_IN = { opacity: 1 };
    static STYLE_OUT = { opacity: 0 };
    static STYLE_ABSOLUTE_OUT = {
        opacity: 0,
        position: 'absolute',
        top: 0
    };

    static fade = trigger('fade', [
        state('in', style(ToggleAnim.STYLE_IN)),
        transition('void => *', [
            style(ToggleAnim.STYLE_OUT),
            animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE)
        ]),
        transition('* => void', [
            animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, style(ToggleAnim.STYLE_OUT))
        ])
    ]);

    static fadeAbsolute = trigger('fadeAbsolute', [
        state('in', style(ToggleAnim.STYLE_IN)),
        transition('void => *', [
            style(ToggleAnim.STYLE_ABSOLUTE_OUT),
            animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE)
        ]),
        transition('* => void', [
            animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, style(ToggleAnim.STYLE_ABSOLUTE_OUT))
        ])
    ]);

    static bubbleSlow = trigger('bubbleSlow', [
        state('in', style(DialogAnim.instyle)),
        transition('void => *', [
            style(DialogAnim.outstyle),
            animate((DEFAULT_DURATION * 2) + 'ms ' + EASE_OUT_BACK)
        ]),
        transition('* => void', [
            animate((DEFAULT_DURATION * 2) + 'ms ' + EASE_IN_BACK, style(DialogAnim.outstyle))
        ])
    ]);

    static bubble = trigger('bubble', [
        state('in', style(DialogAnim.instyle)),
        transition('void => *', [
            style(DialogAnim.outstyle),
            animate(DEFAULT_DURATION + 'ms ' + EASE_OUT_BACK)
        ]),
        transition('* => void', [
            animate(DEFAULT_DURATION + 'ms ' + EASE_IN_BACK, style(DialogAnim.outstyle))
        ])
    ]);
}

export class ShrinkAnim {
    static verticalInStyle = {
            transform: 'scaleY(1)',
            opacity: 1
        };
    static verticalOutStyle = {
            transform: 'scaleY(0.1)',
            opacity: 0
        };

    static vertical = trigger('shrinkVertical', [
            state('in', style(ShrinkAnim.verticalInStyle)),
            transition('void => *', [
                style(ShrinkAnim.verticalOutStyle),
                animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE)
            ]),
            transition('* => void', [
                animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, style(ShrinkAnim.verticalOutStyle))
            ])
        ])

    static heightInStyle = {
            height: '*',
            opacity: 1,
            overflow: 'hidden'
        }

    static heightOutStyle = {
            height: '0px',
            opacity: 0,
            overflow: 'hidden'
        }

    static height = trigger('shrinkHeight', [
        state('in', style(ShrinkAnim.heightInStyle)),
        transition('void => *', [
            style(ShrinkAnim.heightOutStyle),
            animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, style(ShrinkAnim.heightInStyle))
        ]),
        transition('* => void', [
            style(ShrinkAnim.heightInStyle),
            animate(DEFAULT_DURATION + 'ms ' + DEFAULT_EASE, style(ShrinkAnim.heightOutStyle))
        ])
    ]);

}
