import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


import { CGCalendarModule } from '../calendar/module';
import { FilePickerComponent } from './file-picker';
import { FileDropzoneDialogComponent } from './file-dropzone';
import { DropzoneModule } from './dropzone/dropzone.module';
import { FileDropzoneModule } from './just-picker/file-dropzone.module';
import { ChiPanelModule } from '../panel/module';
import { MaterialModule } from '../../../material.module';
import { FuseDirectivesModule } from '../../../directives';
import { ImagePickerElModule } from './image-picker-elemet/module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        FuseDirectivesModule,
        MaterialModule,
        CGCalendarModule,
        ChiPanelModule,
        DropzoneModule,
        FileDropzoneModule,
        ImagePickerElModule,
    ],
    declarations: [
        FilePickerComponent,
        FileDropzoneDialogComponent

    ],
    entryComponents: [
        FilePickerComponent,
        FileDropzoneDialogComponent
    ],
    exports: [
        FilePickerComponent,
        DropzoneModule,
        FileDropzoneModule
    ]
})
export class ImagePickerModule { }
