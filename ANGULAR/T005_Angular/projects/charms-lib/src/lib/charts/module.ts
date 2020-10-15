import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../material.module';
import { ChiLineChartComponent } from './line-chart/line-chart';
import { EcgChartModule } from './ecg-chart/module';
import { EcgChartAnalysisModule } from './ecg-chart-analysis/module';
import { ChiContinuousLineChartComponent } from './continuous-line-chart/line-chart';
import { OfflineChartModule } from './offline-chart/module';
import { ChiLineChart2Component } from './line-chart2/line-chart';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        
        MaterialModule,
        EcgChartModule,
        EcgChartAnalysisModule,
        OfflineChartModule
    ],
    declarations: [
        ChiLineChartComponent,
        ChiLineChart2Component,
        ChiContinuousLineChartComponent
    ],
    exports: [
        ChiLineChartComponent,
        ChiContinuousLineChartComponent,
        ChiLineChart2Component,
    ]
})
export class ChartModule
{
}
