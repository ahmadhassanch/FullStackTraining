export class Range 
{
    normal: boolean;
    warning: boolean;
    critical: boolean;

    constructor() 
    {
        this.normal = false;
        this.warning = false;
        this.critical = false;
    }
}

export class RefAxis 
{
    name: string;
    position: string;
    axisColor: string;
    gridAlpha: number;
    axisThickness: number;
    offset: number;

    constructor(name: string) 
    {
        this.name = name;
        this.position = 'left';
        this.gridAlpha = 0;
        this.axisThickness = 2;
        this.offset = 0;
        this.axisColor = '000000';
    }
}

export class Dataset 
{
    name: string;
    title: string;
    color?: string;
    negColor?: string;
    refAxis?: RefAxis; // either refAxis itself or refAxisIndex 
    refAxisName?: string;
    pointStyle?: string;

    normal_high_value?: number;
    normal_low_value?: number;
    warn_low_value?: number;
    warn_high_value?: number;
    alert_low_value?: number;
    alert_high_value?: number;

    xMin: number;
    xMax: number;
    vMin: number;
    vMax: number;
}