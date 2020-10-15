import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule  } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';


import { GeneralTableComponent } from './general-table/general-table';
import { GeneralFormComponent } from './general-form/general-form';
import { GeneralFormDialogComponent } from './general-form-dialog/general-form-dialog';
import { GeneralPageComponent } from './general-page/general-page';
import { DataTableFilterComponent } from './data-table-filter/table-filter.component';

import { MaterialModule } from '../../material.module';
import { FuseDirectivesModule } from '../../directives';
import { ChiPanelModule } from '../controls/panel/module';
import { SelectModule, DatePickerModule, TimePickerModule, ChiFilePickerModule } from '../controls';
import { PatientGeneralAdvanceFilterComponent } from './patient_advance_filter/advance_filter';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        MaterialModule,
        FuseDirectivesModule,
        ChiPanelModule,
        SelectModule,
        DatePickerModule,
        TimePickerModule,
        ChiFilePickerModule
    ],
    declarations: [
        GeneralTableComponent,
        GeneralFormComponent,
        GeneralPageComponent,
        DataTableFilterComponent,
        PatientGeneralAdvanceFilterComponent,

        GeneralFormDialogComponent
    ],
    exports: [
        GeneralTableComponent,
        GeneralFormComponent,
        GeneralPageComponent,
        DataTableFilterComponent,
        PatientGeneralAdvanceFilterComponent,

        GeneralFormDialogComponent
    ],
    entryComponents: [
        GeneralFormComponent,
        GeneralFormDialogComponent
    ]
})
export class GeneralModule
{
}
