export class OfflineChartChannel
{
    name?: string;

    width: number;
    height: number;

    yMin: number;
    yMax: number;

    Gx: number;
    Gy: number;

    gx: number;
    gy: number;

    sampleRate?: number;
    margins: number[];

    strokeStyle: string;

    duration: number;
    drawRanges?: boolean
}
