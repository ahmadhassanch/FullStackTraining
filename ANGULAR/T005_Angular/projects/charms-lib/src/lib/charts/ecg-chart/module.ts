import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EcgChartComponent } from './chart';
import { EcgChannelComponent } from './chart-chanel/channel';
import { MaterialModule } from '../../material.module';



@NgModule({
    imports: [
        CommonModule,

        MaterialModule,
    ],
    declarations: [
        EcgChartComponent,
        EcgChannelComponent
    ],
    exports: [
        EcgChartComponent,
        EcgChannelComponent
    ],
})
export class EcgChartModule
{
}
