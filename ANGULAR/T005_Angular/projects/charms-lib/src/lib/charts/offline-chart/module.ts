import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';


import { OfflineChartComponent } from './chart';
import { OfflineChartChannelComponent } from './offline-chart-chanel/channel';
import { MaterialModule } from '../../material.module';



@NgModule({
    imports: [
        CommonModule,
        
        MaterialModule,
    ],
    declarations: [
        OfflineChartComponent,
        OfflineChartChannelComponent
    ],
    exports: [
        OfflineChartComponent,
        OfflineChartChannelComponent
    ],
})
export class OfflineChartModule
{
}
