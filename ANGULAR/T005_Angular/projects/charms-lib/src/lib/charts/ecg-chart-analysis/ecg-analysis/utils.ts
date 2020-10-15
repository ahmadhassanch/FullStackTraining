export class ECGUtils
{
    constructor() 
    {
    }

    create_element(parent: any, element_name: any) 
    {
        let ns = 'http://www.w3.org/2000/svg';
        let element = document.createElementNS(ns,  element_name);
        parent.appendChild(element);
        return element;
    }

    draw_canvas(chartId: any, w: any, h: any, padding: any) 
    {
        // w = w+padding['l']+padding['r'];
        w = w+padding['l'] + 30;
        h = h+padding['t']+padding['b'];
        
        let canvas: any = this.create_element(chartId, 'svg');
        canvas.setAttributeNS(null, 'width', w + 'px');
        canvas.setAttributeNS(null, 'height', h + 'px');
        canvas.setAttribute('xmlns', "http://www.w3.org/2000/svg");
        canvas.setAttribute('viewBox', "0 0 "+w+" "+h);
        canvas.style.backgroundColor = "#535458";
        // canvas.style.minHeight = "360px";
        return canvas;
    }

    rectangle(parent: any, padding: any, w: any, h: any, style: any, x: number = 0, y: number = 0) 
    {
        if (padding != null)
        {
            x = x + padding['l'];
            y = y + padding['t'];
        }

        let rect: any = this.create_element(parent, 'rect');
        rect.setAttributeNS(null, 'x', x);
        rect.setAttributeNS(null, 'y', y);
        rect.setAttributeNS(null, 'height', h);
        rect.setAttributeNS(null, 'width', w);
        rect.setAttributeNS(null, 'fill', style['fill']);
        rect.setAttributeNS(null, 'stroke', style['color']);
        rect.setAttributeNS(null, 'stroke-width', style['stroke']);
        rect.setAttributeNS(null, 'shape-rendering', "crispEdges");
        return rect
    }

    line(parent: any, x1: any, y1: any, x2: any, y2: any, style: any) 
    {
        let line: any = this.create_element(parent, 'line');
        line.setAttributeNS(null, 'x1', x1);
        line.setAttributeNS(null, 'y1', y1);
        line.setAttributeNS(null, 'x2', x2);
        line.setAttributeNS(null, 'y2', y2);
        line.setAttributeNS(null, 'shape-rendering', "crispEdges");
        line.style.stroke = style['color'];
        line.style.strokeWidth = style['stroke'];
    }
    
    pointToPixel(from_p1: number, from_p2: number, to_p1: number, to_p2: number, point: number)
    {
        let slope: number = (to_p2 - to_p1)/(from_p2 - from_p1);
        let pixVal: number =  to_p1 + slope * (point - from_p1);
        return pixVal;
    }
    
    pointToPixel2(from_p1: number, from_p2: number, to_p1: number, to_p2: number, point: number)
    {
        let slope: number = (to_p2 - to_p1)/(from_p2 - from_p1);
        let pixVal: number =  to_p1 + (slope * point) - (slope * from_p1);
        return pixVal;
    }
    
    rescale_data(data: any, range: any) 
    {
        let stats: any = this.get_stats(data);
        let new_data = [];
        for(let i = 0; i< data.length; i++)
        {
            let p: any = this.pointToPixel2(stats['min'], stats['max'], range[0], range[1], data[i]);
            new_data.push(p);
        }
        return new_data;
    }
    
    get_grid_pixel(pixel: number, grid: number)
    {
        return Math.round(pixel / grid) * grid;
    }
    
    text(parent: any, x: any, y: any, txt: any, size: any, color: any, type: any) 
    {
        let text: any = this.create_element(parent, 'text');
        text.setAttributeNS(null, 'fill', color);
        text.setAttributeNS(null, 'font-size', size);
        text.innerHTML = txt;
        let width = text.getBBox().width;
        let height = text.getBBox().height;
        if (type === 'v')
        {
            x = x - (width/2);
            y = y + height*1.5;
        }

        if (type === 'h')
        {
            x = x - width*1.5;
            y = y + (height/3);
        }
    
        text.setAttributeNS(null, 'x', x);
        text.setAttributeNS(null, 'y', y);
        return text;
    }

    get_stats(data: any[]) 
    {
        var stats = {};
        stats['min'] = Math.min(...data);
        stats['max'] = Math.max(...data);
        stats['len'] = data.length;
        stats['range_sum'] = Math.abs(stats['min'] - stats['max']);
        return stats;
    }
}