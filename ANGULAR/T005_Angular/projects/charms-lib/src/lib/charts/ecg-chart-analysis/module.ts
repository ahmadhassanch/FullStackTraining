import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EcgChartAnalysisComponent } from './chart';
import { MaterialModule } from '../../material.module';


@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule
    ],
    declarations: [
        EcgChartAnalysisComponent
    ],
    exports: [
        EcgChartAnalysisComponent
    ],
})
export class EcgChartAnalysisModule
{
}
