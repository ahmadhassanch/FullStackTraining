import { ECGUtils } from './utils';

export class ECGAnalysis
{
    main: any;
    ecg_stats: any;
    style: any;
    
    constructor(main)
    {
        this.main = main;
        this.ecg_stats = null;
        this.style = {"color": "#0078ff", "fill": "none", "stroke": "2px", "size": 12};
    }

    plot_analysis(analysis_data: any) 
    {
        let data: any = analysis_data.loc.signal;
        this.ecg_stats = analysis_data.stats;

        this.main.redraw(data);
        this.draw_points(analysis_data.loc.P, 'green', "P Wave");
        this.draw_points(analysis_data.loc.Q, '#ff01fb', "q Wave");
        this.draw_points(analysis_data.loc.R, 'blue', "R Wave");
        this.draw_points(analysis_data.loc.S, 'black', "S Wave");
        this.draw_points(analysis_data.loc.T, 'red', "T Wave", true);
    }

    draw_points(wave: any, color: any = null, label: any, final = false) 
    {
        let graph: any = this.main.graph;
        let canvas: any = this.main.canvas;
        var utils: any = new ECGUtils();
        let gH = graph.gH;
        let gW = graph.gW;
        let stats = graph.stats;
        let smooth_data = graph.points;
        let rectSize = 10;
        
        if(color != null)
            this.style['color'] = color;


        // graph.add_legend("rect", label, this.style);
        for (let i = 0; i < wave.length; i++)
        {
            let y = utils.pointToPixel(stats['min'], stats['max'], gH, 0, smooth_data[wave[i]]);
            let x = utils.pointToPixel(0, smooth_data.length, 0, gW, wave[i]);
            utils.rectangle(canvas, graph.padding, rectSize, rectSize, this.style, x-rectSize/2, y-rectSize/2);

        }
    }

    download()
    {
        let graph: any = this.main.graph;
        graph.download();
    }

    drawPoint(final, analysis_data) 
    {
        let graph: any = this.main.graph;
        let _ecg_stats = analysis_data.stats;


        if (final && _ecg_stats != null)
        {
            this.style['size'] = 15;
            graph.add_legend(" ", "Heart Rate:  "+ _ecg_stats.HR+"   bpm", this.style);
            // graph.add_legend(" ", "Heart Rate:  "+ _ecg_stats.HR+"   bpm", style);
            graph.add_legend(" ", "PR Interval:  "+ (_ecg_stats.PR_INTV/graph.sR).toFixed(2)+"   sec", this.style);
            graph.add_legend(" ", "PT Interval:  "+ (_ecg_stats.PT_INTV/graph.sR).toFixed(2)+"   sec", this.style);
            graph.add_legend(" ", "RR Interval:  "+ (_ecg_stats.RR_INTV/graph.sR).toFixed(2)+"   sec", this.style);
            graph.add_legend(" ", "QR Interval:  "+ (_ecg_stats.QR_INTV/graph.sR).toFixed(2)+"   sec", this.style);
            graph.add_legend(" ", "RS Interval:  "+ (_ecg_stats.RS_INTV/graph.sR).toFixed(2)+"   sec", this.style);
            graph.add_legend(" ", "QS Interval:  "+ (_ecg_stats.QS_INTV/graph.sR).toFixed(2)+"   sec", this.style);
        }
    }

    getMainGraph()
    {
        return this.main.graph;
    }
}