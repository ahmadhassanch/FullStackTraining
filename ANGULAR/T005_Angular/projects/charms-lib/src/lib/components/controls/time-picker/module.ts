import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';


import { CGCalendarModule } from '../calendar/module';
import { TimePickerComponent } from './picker';
import { MaterialModule } from '../../../material.module';
import { ChiPanelModule } from '../panel/module';


@NgModule({
    imports: [
        CommonModule,

        FormsModule,
        ReactiveFormsModule,

        MaterialModule,

        CGCalendarModule,
        ChiPanelModule,
    ],
    declarations: [
        TimePickerComponent
    ],
    exports: [
        TimePickerComponent
    ]
})
export class TimePickerModule { }
