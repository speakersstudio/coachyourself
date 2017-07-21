import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
// import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IPlusView } from '../view/iplus.view';
import { LoginView } from '../view/login.view';
import { UserFormView } from '../view/user-form.view';
import { LandingHeroView } from '../view/landing-hero.view';
import { LegalView } from '../view/legal.view';

// services
import { UserService } from "../service/user.service";
import { CartService } from '../service/cart.service';
import { AppService } from '../service/app.service';

import { FormInputDirective } from '../directive/form-input.directive';
import { BracketCardDirective } from '../directive/bracket-card.directive';
import { DraggableDirective } from '../directive/draggable.directive';
import { DroppableDirective } from '../directive/droppable.directive';
import { FormSwitchDirective } from '../directive/form-switch.directive';
import { InfiniteScrollDirective } from '../directive/infinite-scroll.directive';

@NgModule({
    imports: [
        // BrowserModule,
        CommonModule,
        FormsModule,
        RouterModule
    ],
    declarations: [
        IPlusView,
        LoginView,
        UserFormView,
        LandingHeroView,
        LegalView,
        FormInputDirective,
        BracketCardDirective,
        DraggableDirective,
        DroppableDirective,
        FormSwitchDirective,
        InfiniteScrollDirective
    ],
    exports: [
        IPlusView,
        LoginView,
        UserFormView,
        LandingHeroView,
        LegalView,
        FormInputDirective,
        BracketCardDirective,
        DraggableDirective,
        DroppableDirective,
        FormSwitchDirective,
        InfiniteScrollDirective
    ],
    providers: [
        AppService,
        UserService,
        CartService
    ]
})

export class SharedModule { }
