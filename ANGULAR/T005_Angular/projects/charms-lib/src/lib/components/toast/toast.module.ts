import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../material.module';

import { ToastComponent } from './toast.component';
import { defaultToastConfig, TOAST_CONFIG_TOKEN } from './toast.config';


@NgModule({
    imports: [
        CommonModule,
        MaterialModule
    ],
    declarations: [
        ToastComponent
    ],
    exports: [
        ToastComponent
    ],
    entryComponents: [
        ToastComponent
    ]
})
export class ToastModule
{
    public static forRoot(config = defaultToastConfig): ModuleWithProviders {
        return {
            ngModule: ToastModule,
            providers: [
                {
                    provide: TOAST_CONFIG_TOKEN,
                    useValue: { ...defaultToastConfig, ...config },
                },
            ],
        };
    }
}
