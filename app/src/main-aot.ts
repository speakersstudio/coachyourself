import { platformBrowser } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';

import { AppModuleNgFactory } from '../aot/app/src/module/app.module.ngfactory';

import { CONFIG_TOKEN } from './constants';

fetch('/config').then(response => {
    response.json().then(configData => {
        const platform = platformBrowser([{
            provide: CONFIG_TOKEN, useValue: configData
        }]);
        enableProdMode();
        platform.bootstrapModuleFactory(AppModuleNgFactory);
    });
})