import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { MaterialModule } from '../../../material.module';
import { ChiPanelComponent } from './panel.component';
import { ChiPanelTrigger } from './panel-trigger';
import { ChiPanelCloseDirective } from './panel.directive';

@NgModule({
    imports: [
        CommonModule,
        MaterialModule
    ],
    declarations: [
        ChiPanelTrigger, ChiPanelComponent, ChiPanelCloseDirective
    ],
    exports: [
        ChiPanelTrigger, ChiPanelComponent, ChiPanelCloseDirective
    ]
})
export class ChiPanelModule { }
