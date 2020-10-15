import { NgModule } from '@angular/core';
import { StarCallingModule } from './star/module';
import { CallWindowModule } from './call-window/module';
import { ChiDraggableModule } from './draggable/module';


@NgModule({
    imports: [
        StarCallingModule,
        CallWindowModule,
        ChiDraggableModule
    ],
    exports: [
        StarCallingModule,
        CallWindowModule,
        ChiDraggableModule
    ]
})
export class RootSharedModule {}
