import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../../material.module';
import { ImagePickerElComponent } from './form.component';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MaterialModule
    ],
    declarations: [
        ImagePickerElComponent
    ],
    exports: [
        ImagePickerElComponent
    ]
})
export class ImagePickerElModule { }
