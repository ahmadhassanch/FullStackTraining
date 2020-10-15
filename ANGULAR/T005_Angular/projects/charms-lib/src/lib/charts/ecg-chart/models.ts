export class EcgChannel
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

    hMin?: number; // for height
    hMax?: number;

    duration: number;
    drawRanges?: boolean;
    defaultGrids?: boolean;
    nonEcgGraphGrids?: boolean;
}

export class PlayBackControl
{
    showControl?: boolean;
    play?: boolean;
    duration?: string;
    min?: number;
    max?: number;
    offset?: number;
    speed?: number;
    playback?: boolean;
    minSpeed?: number;
    maxSpeed?: number;
}
