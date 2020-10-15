import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


import { ForeignPickerComponent } from './picker';
import { MaterialModule } from '../../../material.module';
import { SelectSearchModule } from '../select-search/module';


@NgModule({
    imports: [
        CommonModule,

        FormsModule,
        ReactiveFormsModule,

        MaterialModule,
        SelectSearchModule
    ],
    declarations: [
        ForeignPickerComponent
    ],
    exports: [
        ForeignPickerComponent
    ]
})
export class SelectModule { }
