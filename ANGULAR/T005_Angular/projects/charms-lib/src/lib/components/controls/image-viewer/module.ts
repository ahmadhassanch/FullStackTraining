import { NgModule } from '@angular/core';

import { ImageViewerComponent } from './image-viewer.component';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [ ImageViewerComponent ],

    imports: [
        CommonModule,
        
        MaterialModule
    ],
    exports: [ ImageViewerComponent ],
    providers: [],
})
export class ImageViewerModule { }
