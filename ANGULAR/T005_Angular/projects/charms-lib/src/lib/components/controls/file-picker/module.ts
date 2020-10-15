import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


import { CGCalendarModule } from '../calendar/module';
import { ChiFilePickerComponent } from './picker';
import { MaterialModule } from '../../../material.module';
import { ImagePickerModule } from '../image-picker/module';


@NgModule({
    imports: [
        CommonModule,

        FormsModule,
        ReactiveFormsModule,

        MaterialModule,

        CGCalendarModule,
        ImagePickerModule
    ],
    declarations: [
        ChiFilePickerComponent
    ],
    exports: [
        ChiFilePickerComponent
    ],
    entryComponents: [ChiFilePickerComponent]
})
export class ChiFilePickerModule { }
