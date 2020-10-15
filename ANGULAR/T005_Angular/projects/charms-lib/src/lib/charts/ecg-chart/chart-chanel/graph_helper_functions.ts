import { EcgChannel } from '../models';

export class EcgGridsHelperFunctions
{
    grids: any;

    constructor()
    {
        this.grids = {
            0: {
                'grid': [0.04, 0.1], 
                'label': false, 
                'style': {'stroke': '0.5px', 'color': 'rgb(255,176,162)'}
            },
            
            1: {
                'grid': [0.2, 0.5], 
                'label': false, 
                'style': {'stroke': '1px', 'color': '#ff9597'}
            },

            2: {
                'grid': [1.0, 1.0], 
                'label': true, 
                'style': {'stroke': '1px', 'color': 'none'}
            }
        };
    }

    get_grid_pixel(pixel: number, grid: number)
    {
        return Math.round(pixel / grid) * grid;
    }

    pointToPixel(from_p1: number, from_p2: number, to_p1: number, to_p2: number, point: number)
    {
        let slope: number = (to_p2 - to_p1)/(from_p2 - from_p1);
        let pixVal: number =  to_p1 + slope * (point - from_p1);
        return pixVal;
    }

    find_height(min: number, max: number, duration: number, sampleRate: number, graphwidth: any) 
    {
        let grid: any = this.grids[0]['grid'];
        let delta: any = this.pointToPixel(0, duration, 0, graphwidth, grid[0]) - 0;
        const m: number = Math.abs(min - max);
        return (delta/grid[1]) * m;
    }

    draw_Vgrid(gridX: any, style: any, label: any, channel: EcgChannel, plotWidth: any, gridContext) 
    {

        gridContext.beginPath();
        gridContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        gridContext.lineWidth = style['stroke'];

        // Vertical Lines
        let pVal: number = 0;
        var prev: number = 0;

        for (let i = 0; i <= channel.duration; i+= gridX)
        {
            i = this.get_grid_pixel(i, gridX);
            pVal = this.pointToPixel(0, channel.duration, 0, plotWidth, i);
            
            prev = pVal;
            if(i <= channel.duration)
            {
                gridContext.moveTo(pVal, 0);
                gridContext.lineTo(pVal, channel.height);
            }
        }
    }

    draw_Hgrid(gridY: any, style: any, label: any, channel: EcgChannel, plotWidth: any, gridContext)
    {
        // Horizontal Lines
        let pVal: number = 0;
        var prev: number = 0;

        // this.gridContext.beginPath();
        // this.gridContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        // this.gridContext.lineWidth = style['stroke'];

        for (let i = channel.yMin; i <= channel.yMax; i+= gridY)
        {
            i = this.get_grid_pixel(i, gridY);
            pVal = this.pointToPixel(channel.yMin, channel.yMax, channel.height, 0, i);
            
            prev = pVal;
            if(i >= channel.yMin && i <= channel.yMax)
            {
                gridContext.moveTo(0, pVal);
                gridContext.lineTo(plotWidth, pVal);
            }
   
        }
    }

    get _grids()
    {
        return this.grids;
    }
}