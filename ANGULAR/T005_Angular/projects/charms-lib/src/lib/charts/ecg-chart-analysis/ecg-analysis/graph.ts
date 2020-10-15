import { ECGUtils } from './utils';

export class ECGGraph
{
    grids: any;
    utils: any;
    debug: boolean;
    padding: any;
    chartId: any;
    gW: any;
    sR: any;
    lg_h: any;
    points: any[];
    data: any[];
    stats: any;
    gH: any;
    canvas: any;
    lg_w: any;
    legend: boolean;

    constructor(chartId, points, w, sR, padding={"l":50, "t": 50, "r": 50, "b": 50}, border = true, legend  = true)
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

        this.utils = new ECGUtils();
        this.debug = false;
        this.padding = padding;
        this.chartId = chartId;
        this.gW = w;
        this.sR = sR;
        this.lg_h = 0;
        this.points = points;
        this.data = [];
        this.stats = this.utils.get_stats(this.points);
        this.gH = this.find_height();
        this.canvas = this.utils.draw_canvas(this.chartId, this.gW, this.gH, this.padding);
        this.lg_w = null;
        this.legend = legend;

        if (border)
        {
            var style = {"color": "#ff9597", "fill": "none", "stroke": "2px"};
            this.utils.rectangle(this.canvas, this.padding, this.gW, this.gH, style);
        }

    }

    find_height() 
    {
        let grid: any = this.grids[0]['grid'];
        let delta: any = this.utils.pointToPixel(0, this.stats['len']/this.sR, this.padding['l'],
            this.gW+this.padding['l'], grid[0]) - this.padding['l'];
        return (delta/grid[1]) * this.stats['range_sum'];
    }

    draw_grid()
    {
        for (let key in this.grids)
        {
            let conf: any = this.grids[key];
            this.draw_Vgrid(conf['grid'][0], conf['style'], conf['label']);
            this.draw_Hgrid(conf['grid'][1], conf['style'], conf['label']);
        }
    }

    draw_Vgrid(gridX: any, style: any, label: any) 
    {
        // Vertical Lines
        let pVal: number = 0;
        var prev: number = 0;

        for (let i = 0; i <= this.stats['len']/this.sR; i+= gridX)
        {
            i = this.utils.get_grid_pixel(i, gridX);
            pVal = this.utils.pointToPixel(0, this.stats['len']/this.sR, this.padding['l'], this.gW+this.padding['l'], i);
            
            if (gridX === 0.04 && this.debug)
                console.log("VGrid: "+ (pVal-prev).toFixed(2));

            prev = pVal;
            if(i <= this.stats['len']/this.sR)
            {
                this.utils.line(this.canvas, pVal, 0 + this.padding['t'], pVal, this.gH + this.padding['t'], style);
                if (label) 
                    this.utils.text(this.canvas, pVal, this.gH + this.padding['t'], i.toFixed(2), 10, '#fff','v');
            }
        }
    }

    draw_Hgrid(gridY: any, style: any, label: any)
    {
        // Horizontal Lines
        let pVal: number = 0;
        var prev: number = 0;

        for (let i = this.stats['min']; i <= this.stats['max']; i+= gridY)
        {
            i = this.utils.get_grid_pixel(i, gridY);
            pVal = this.utils.pointToPixel(this.stats['min'], this.stats['max'], this.gH+this.padding['t'], this.padding['t'], i);
            
            if (gridY === 0.1 && this.debug)
                console.log("HGrid: "+ (pVal-prev).toFixed(2));

            prev = pVal;
            if(i >= this.stats['min'] && i <= this.stats['max'])
            {
                this.utils.line(this.canvas,0+this.padding['l'], pVal ,this.gW+this.padding['l'], pVal, style);
                if (label)
                    this.utils.text(this.canvas, this.padding['l'], pVal, i.toFixed(2), 10, '#fff', 'h');
            }
        }
    }

    draw_legends(w: any)
    {
        this.lg_w = w;
        // var style = {"color": "#ff9597", "fill": "white", "stroke": "2px"};
        // var p = Object.create(this.padding);
        // rectangle(this.canvas, p, this.lg_w, this.gH, style, this.gW+10, 0);
    }

    add_legend(shape: string, txt: any, style: any)
    {
        let p: number = 20;
        let x: any = this.gW;
        let y: any = this.lg_h;

        if (shape === 'rect') 
        {
            x = x+p;
            this.utils.rectangle(this.canvas, this.padding, style['size'], style['size'], style, x, y);
        }
        x = x + this.padding['l'];
        y = y + this.padding['t'];

        this.utils.text(this.canvas, x + p, y+p/2, txt, style['size'], 'black', '');
        this.lg_h += style['size']*2;
    }

    set_xlabel(txt: string, size: number = 18, color: string = '#fff')
    {
        let x: number = this.gW / 2;
        let y: number = this.gH+this.padding['t']+this.padding['b']-size;
        this.utils.text(this.canvas, x, y, txt, size, color, '');
    }

    set_ylabel(txt: string, size: number = 18, color: string = '#fff')
    {
        let x: number = this.padding['l']/2;
        let y: number= (this.gH + this.padding['t']+ this.padding['b'])/2;
        let txt_elem: any = this.utils.text(this.canvas, x, y, txt, size, color, '');
        let xT: number = x + txt_elem.getBBox().width/2;
        let yT: number = y + txt_elem.getBBox().height/2;
        let rot: any = -90+" "+xT+","+yT;
        txt_elem.setAttribute("transform", "rotate(" + rot + ")")
    }

    plot(scale: number = 1.0)
    {
        let poly: any = this.utils.create_element(this.canvas, 'polyline');
        poly.style.fill= "none";
        poly.style.stroke = "rgb(4, 243, 113)";
        poly.style.strokeWidth = '2px';
        for (let i = 0; i < this.points.length; i++)
        {
            this.points[i] = this.points[i]* scale;
            let y = this.utils.pointToPixel(this.stats['min'], this.stats['max'], this.gH+this.padding['t'], this.padding['t'], this.points[i]);
            let x = this.utils.pointToPixel(0, this.points.length, this.padding['l'], this.gW+this.padding['l'], i);
            this.data.push([x,y])
        }
        poly.setAttributeNS(null, 'points', this.data);
    }

    download(chartId: any) 
    {
        let xml_tag = '<?xml version="1.0" encoding="UTF-8" ?>';
        let text = xml_tag+chartId.innerHTML,
        blob = new Blob([text], { type: 'text/plain' }),
        anchor = document.createElement('a');
        // let loc = window.location.pathname;
        // let dir = loc.substring(0, loc.lastIndexOf('/'));
        anchor.download = "graph.svg";
        anchor.href = URL.createObjectURL(blob);
        // anchor.href = (window.webkitURL || window.URL).createObjectURL(blob);
        anchor.dataset.downloadurl = ['svg', anchor.download, anchor.href].join(':');
        anchor.click();
    }
}