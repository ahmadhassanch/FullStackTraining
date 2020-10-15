import { Component, Input } from "@angular/core";
import { OfflineChartChannel } from './models';


@Component({
    selector: 'chi-offline-chart',
    templateUrl: './chart.html',
    styleUrls: ['./chart.scss']
})
export class OfflineChartComponent
{
    channels = [0];
    channel: OfflineChartChannel;
    @Input() isResized: boolean;

    constructor()
    {
        this.channel = {
            name: 'TOCO',

            height: 250,
            width: 0,
            yMin: -50,
            yMax: 50,
            margins: [10, 20, 15, 30],

            Gx: 1,
            gx: 0.1,

            Gy: 20,
            gy: 5,

            sampleRate: 10,

            strokeStyle: '#ffff00',

            duration: 10,
            drawRanges: false
        };

        this.isResized = false;
    }
}