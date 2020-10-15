import { NgModule } from '@angular/core';
import { CallWindowComponent } from './call-window.component';
import { MaterialModule, FuseDirectivesModule, FuseSidebarModule } from 'dist/charms-lib';
import { CommonModule } from '@angular/common';
import { ChiDraggableModule } from '../draggable/module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        CallWindowComponent
    ],
    exports: [
        CallWindowComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        FuseDirectivesModule,
        FuseSidebarModule,

        ChiDraggableModule
    ]
})
export class CallWindowModule {}
