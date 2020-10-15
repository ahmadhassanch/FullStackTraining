import { NgModule } from '@angular/core';
import { CallWindowComponent } from './call-window.component';
import { MaterialModule, FuseDirectivesModule } from 'dist/charms-lib';
import { CommonModule } from '@angular/common';
import { StarCallingModule } from '../star/module';
import { ChiDraggableModule } from '../draggable/module';


@NgModule({
    declarations: [
        CallWindowComponent
    ],
    exports: [
        CallWindowComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FuseDirectivesModule,

        StarCallingModule,
        ChiDraggableModule
    ]
})
export class CallWindowModule {}
