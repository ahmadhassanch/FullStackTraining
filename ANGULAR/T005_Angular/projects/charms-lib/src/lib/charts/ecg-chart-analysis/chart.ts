import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { HostListener } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';

import { ECGAnalysis } from './ecg-analysis/analysis';
import { ECGUtils } from './ecg-analysis/utils';
import { ECGGraph } from './ecg-analysis/graph';
import { ApiService } from '../../services';
import { GenericApiResponse } from '../../models';
import { RVAlertsService } from '../../components/alerts';

@Component({
    selector: 'chi-ecg-chart-anal',
    templateUrl: './chart.html',
    styleUrls: ['./chart.scss'],
    providers: [ApiService]
})
export class EcgChartAnalysisComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
    @Input() name: any;
    @Input()  data: any[] = [];
    @Input() sampleRate: any;
    analyizedData: any[];

    chartId: any;
    canvas: any;
    pad: any;
    legend: boolean;
    legend_area: number;
    graph: any;
    smooth_data: any;
    analysis: any;
    smooth_analysis: any;
    analyisGraph: any;
    utils: any;
    width: any;
    isAnalyzed: boolean;
    isSmooth: boolean;
    value: number;
    loading: boolean;
    isDraw: boolean;

    widthVal = 5;

    @ViewChild('chart') chart: ElementRef;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.perform_analysis();
    }

    constructor(private apiService: ApiService, private cdr: ChangeDetectorRef)
    {
        this.name = 'ECG';
        this.chartId = null;
        this.canvas = null;
        this.pad = {'l':100, 't': 20, 'r': 50, 'b': 70};
        this.legend =  true;
        this.legend_area = 0.15;
        this.graph = null;
        this.smooth_data = null;
        this.analysis = null;
        this.smooth_analysis = null;

        this.analyisGraph = new ECGAnalysis(this);
        this.utils = new ECGUtils();

        this.isAnalyzed = false;
        this.isSmooth = true;
        this.value = 0;
        this.loading = true;
        this.isDraw = false;
        this.sampleRate = 250;
        this.analyizedData = [];
        this.setReadings();
    }

    ngOnInit(): void
    {
        // Initial calls
        console.log('sample rate-> ', this.sampleRate, ' data length-> ', this.data.length);

        this.get_analysis(this.data, true, false);
        this.get_smooth_signal(this.utils.pointToPixel(0, 10, 0.99, 0.10, this.value));
    }

    ngOnChanges(changes: SimpleChanges)
    {
        console.log('onChanges-> ', changes)
        if (changes.data && !changes.data.firstChange && this.data.length > 0 && this.isDraw)
        {
            this.get_analysis(this.data, true, false);
            this.get_smooth_signal(this.utils.pointToPixel(0, 10, 0.99, 0.10, this.value));
            this.redraw(this.data);
        }
    }

    ngAfterViewInit(): void
    {
        this.chartId = document.getElementById('chartID');
        this.isDraw = true;

        this.redraw(this.data);

    }

    ngOnDestroy(): void
    {
        this.cdr.detach();
    }

    redraw(data: any[])
    {
        this.width = this.chart.nativeElement.offsetWidth * this.widthVal;

        try {
            this.chartId.removeChild(this.canvas);
        }
        catch (e) {

        }

        if(this.legend)
        {
            this.pad.r = window.outerWidth*this.legend_area;
        }

        // let w = this.width - ((this.pad['l'] + this.pad['r']));
        let w = this.width - ((this.pad.l));
        this.graph = new ECGGraph(this.chartId, data, w, this.sampleRate, this.pad, true, this.legend = true);
        this.canvas = this.graph.canvas;
        this.graph.draw_grid();
        this.graph.plot();
        this.graph.draw_legends(w=250);
        this.graph.set_xlabel('Time (second)');
        this.graph.set_ylabel('mV');

        this.cdr.detectChanges();
    }

    set_analysis(data)
    {
        const st = this.utils.get_stats(this.data);
        data.loc.signal = this.utils.rescale_data(data.loc.signal, [st.min,st.max]);
        this.analysis = data;
    }

    set_smoothData(data)
    {
        const st = this.utils.get_stats(this.data);
        this.smooth_data = this.utils.rescale_data(data, [st.min,st.max]);
    }

    set_smoothData_analysis(data)
    {
        const st = this.utils.get_stats(this.data);
        data.loc.signal = this.utils.rescale_data(data.loc.signal, [st.min,st.max]);
        this.smooth_analysis = data;
    }

    get_analysis(_data: any[], initial: boolean, change: boolean)
    {
        if (_data.length > 0)
        {
            const payload = {
                ecg_data: _data,
                sample_rate: this.sampleRate
            }

            this.apiService.post('ecg_analysis/GetAnalysis', payload).then((resp: GenericApiResponse)=> {

                if (initial)
                {
                    this.set_analysis(JSON.parse(resp.data));
                    this.analyzed(JSON.parse(resp.data))
                }
                else
                {
                    this.set_smoothData_analysis(JSON.parse(resp.data));
                }

                if (change)
                {
                    this.perform_analysis();
                }

            }, (error: GenericApiResponse) => {
                RVAlertsService.error('Error while analysis', error.ErrorMessage)
            });
        }
        else{
            this.loading = false;
        }
    }

    get_smooth_signal(smooth_factor: number, change: boolean = false)
    {
        if (this.data.length > 0)
        {
            const payload = {
                ecg_data: this.data,
                smooth_factor
            }

            this.apiService.post('ecg_analysis/GetSmoothData', payload).then((resp: GenericApiResponse)=> {

                this.set_smoothData(JSON.parse(resp.data));
                this.get_analysis(this.smooth_data, false, change);

                this.loading = false;

            }, (error: GenericApiResponse) => {
                RVAlertsService.error('Error while smooth signal', error.ErrorMessage)
            });
        }
        else{
            this.loading = false;
        }
    }

    perform_analysis()
    {
        if (this.isAnalyzed && this.isSmooth)
        {
            this.analyisGraph.plot_analysis(this.smooth_analysis);
            this.analyzed(this.smooth_analysis);
        }

        else if(this.isAnalyzed && !this.isSmooth)
        {
            this.analyisGraph.plot_analysis(this.analysis);
            this.analyzed(this.analysis);
        }

        else if(!this.isAnalyzed && this.isSmooth)
        {
            this.redraw(this.smooth_data);
            this.analyzed(this.smooth_analysis);
        }

        else if(!this.isAnalyzed && !this.isSmooth) {
            this.redraw(this.data);
        }
    }

    analyzed(data)
    {
        // this.analyisGraph.drawPoint(true, data);
        // this.analyizedData = [];
        const graph: any = this.analyisGraph.getMainGraph();
        let _ecg_stats = data.stats;

        if (_ecg_stats != null)
        {

            this.analyizedData.forEach((el: any)=> {
                if (el.name === 'heart_rate')
                {
                    el.value = _ecg_stats.HR
                }
                else if (el.name === 'pr_interval')
                {
                    el.value = ((_ecg_stats.PR_INTV/graph.sR)*1000).toFixed(2)
                }
                else if (el.name === 'pt_interval')
                {
                    el.value = ((_ecg_stats.PT_INTV/graph.sR)*1000).toFixed(2)
                }
                else if (el.name === 'rr_interval')
                {
                    el.value = ((_ecg_stats.RR_INTV/graph.sR)*1000).toFixed(2)
                }
                else if (el.name === 'qr_interval')
                {
                    el.value = ((_ecg_stats.QR_INTV/graph.sR)*1000).toFixed(2)
                }
                else if (el.name === 'rs_interval')
                {
                    el.value = ((_ecg_stats.RS_INTV/graph.sR)*1000).toFixed(2)
                }
                else if (el.name === 'qs_interval')
                {
                    el.value = ((_ecg_stats.QS_INTV/graph.sR)*1000).toFixed(2)
                }
                else if (el.name === 'st_interval')
                {
                    el.value = ((_ecg_stats.ST_INTV/graph.sR)*1000).toFixed(2)
                }
                else if (el.name === 'qt_interval')
                {
                    el.value = ((_ecg_stats.QT_INTV/graph.sR)*1000).toFixed(2)
                }
            });
        }

    }

    onSmoothValueChange()
    {
        this.loading = true;
        const val: number = this.utils.pointToPixel(0, 10, 0.99, 0.10, this.value);
        this.get_smooth_signal(val, true);
    }

    onDownloadFile()
    {
        this.graph.download(this.chartId);
    }

    onChangeWidth()
    {
        this.redraw(this.data);
        this.perform_analysis();
    }

    getStyle(item: any)
    {
        return '2px solid ' + item.color;
    }

    setReadings()
    {
        this.analyizedData = [];

        this.analyizedData = [
            {
                key: 'Heart Rate',
                name: 'heart_rate',
                value: null,
                unit: 'bpm',
                rect: false,
                color: 'green'
            },
            {
                key: 'PR Interval',
                name: 'pr_interval',
                value: null,
                unit: 'ms',
                rect: false,
                color: '#ff01fb'
            },
            {
                key: 'PT Interval',
                name: 'pt_interval',
                value: null,
                unit: 'ms',
                rect: false,
                color: 'blue'
            },
            {
                key: 'RR Interval',
                name: 'rr_interval',
                value: null,
                unit: 'ms',
                rect: false,
                color: 'black'
            },
            {
                key: 'QR Interval',
                name: 'qr_interval',
                value: null,
                unit: 'ms',
                rect: false,
                color: 'red'
            },
            {
                key: 'RS Interval',
                name: 'rs_interval',
                value: null,
                unit: 'ms',
                rect: false,
                color: null
            },
            {
                key: 'QS Interval',
                name: 'qs_interval',
                value: null,
                unit: 'ms',
                rect: false,
                color: false
            },
            {
                key: 'ST Interval',
                name: 'st_interval',
                value: null,
                unit: 'ms',
                rect: false,
                color: null
            },
            {
                key: 'QT Interval',
                name: 'qt_interval',
                value: null,
                unit: 'ms',
                rect: false,
                color: false
            }
        ]
    }

    getValue(row: any)
    {
        if (row.value !== null && row.value !== void 0 && row.value !== '')
        {
            return row.value;
        }

        return '--';
    }
}