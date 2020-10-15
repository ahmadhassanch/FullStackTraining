import { Component, Input } from "@angular/core";
import { EcgChannel } from './models';


@Component({
    selector: 'chi-ecg-chart',
    templateUrl: './chart.html',
    styleUrls: ['./chart.scss']
})
export class EcgChartComponent
{
    channels = [0];
    channel: EcgChannel;
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