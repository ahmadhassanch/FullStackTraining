import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module';
import { CGCalendarModule } from '../calendar/module';
import { ChiPanelModule } from '../panel/module';
import { DateTimePickerComponent } from './picker';

@NgModule({
    imports: [
        CommonModule,

        FormsModule,
        ReactiveFormsModule,

        MaterialModule,

        CGCalendarModule,
        ChiPanelModule
    ],
    declarations: [
        DateTimePickerComponent
    ],
    exports: [
        DateTimePickerComponent
    ]
})
export class DateTimePickerModule { }
