import { NgModule } from '@angular/core';

import { ChiDraggableDialogDirective } from './draggable.directive';


@NgModule({
    declarations: [
        ChiDraggableDialogDirective
    ],
    exports: [
        ChiDraggableDialogDirective
    ]
})
export class ChiDraggableModule {}
