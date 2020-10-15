import { NgModule } from '@angular/core';
import { MaterialModule, FuseSidebarModule } from 'dist/charms-lib';
import { CommonModule } from '@angular/common';
import { StarCallViewComponent } from './component';
import { ChiDraggableModule } from '../draggable/module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
    declarations: [
        StarCallViewComponent
    ],
    exports: [
        StarCallViewComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,

        FuseSidebarModule,

        ChiDraggableModule
    ]
})
export class StarCallingModule {}
