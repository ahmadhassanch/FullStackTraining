export class Range {
    public normal: boolean;
    public warning: boolean;
    public critical: boolean;
    public trend: boolean;

    constructor() {
        this.normal = false;
        this.warning = false;
        this.critical = false;
        this.trend = true;
    }
}

export class RefAxis {
    public name: string;
    public position: string;
    public axisColor: string;
    public gridAlpha: number;
    public axisThickness: number;
    public offset: number;

    constructor(name: string) {
        this.name = name;
        this.position = 'left';
        this.gridAlpha = 0;
        this.axisThickness = 2;
        this.offset = 0;
        this.axisColor = '000000';
    }
}

export class Dataset {
    public name: string;
    public title: string;
    public color?: string;
    public negColor?: string;
    public refAxis?: RefAxis; // either refAxis itself or refAxisIndex 
    public refAxisName?: string;
    public pointStyle?: string;

    public normal_high_value?: number;
    public normal_low_value?: number;
    public warn_low_value?: number;
    public warn_high_value?: number;
    public alert_low_value?: number;
    public alert_high_value?: number;

    public xMin: number;
    public xMax: number;
    public vMin: number;
    public vMax: number;
}