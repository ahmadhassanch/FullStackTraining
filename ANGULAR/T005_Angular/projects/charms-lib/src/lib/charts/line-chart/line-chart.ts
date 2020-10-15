import { Component } from "@angular/core";
import { OnInit } from "@angular/core";
import { OnDestroy } from "@angular/core";
import { OnChanges } from "@angular/core";
import { AfterViewInit } from "@angular/core";
import { Input } from "@angular/core";
import { Output } from "@angular/core";
import { EventEmitter } from "@angular/core";
import { ChangeDetectorRef } from "@angular/core";

import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";

import { Dataset, Range } from './models';
import { FuseConfigService } from '../../services';


@Component({
    selector: 'chi-line-chart',
    templateUrl: './line-chart.html',
    styleUrls: ['./line-chart.scss']
})
export class ChiLineChartComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit 
{
    @Input() chartId: any;
    @Input() name: string;
    @Input() datasets: Dataset[];
    @Input() data: any;
    @Input() trendLine: any[];
    @Input() reloadData: boolean;

    @Output() trendValue = new EventEmitter();

    t0: any;
    t1: any;

    public activeDatasetName: string;
    public range: Range;
    private viewInit: boolean = false;
    private trendLines: any[];
    private axisDict: {};
    private chartSeries: any;

    index: number;

    private chart: am4charts.XYChart;
    currentTheme: string;

    private colors: any = [
            '#a87932',
            '#0fbdd2',
            '#008080', 
            '#f7699c', 
            '#420dab', 
            '#afabd2', 
            '#c79dd7', 
            '#607d8b'
        ];

    constructor(private cdr: ChangeDetectorRef, private _fuseConfigService: FuseConfigService) {
        this.chartId = 'chartDiv';
        this.name = 'Line Charts'
        this.datasets = [];
        this.data = [];

        this.activeDatasetName = 'Pulse';
        this.trendLine = [];
        this.trendLines = [];
        this.range = new Range(); 

        this.t0 = 0;
        this.t1 = 0;
        this.index = 0;
    }

    ngOnInit(): void {
        this._fuseConfigService.config
            .subscribe((config) => {
               this.currentTheme = config['colorTheme'];
            });
        
    }

    ngOnChanges(changes: any) {
        if (this.viewInit && changes.trendLine) 
        {
            this.updateTrendLine(this.trendLine);
        }
    }

    preProcess() 
    {
        for (let item of this.data) {
            item.date = new Date(item.date);
        }
    }

    ngAfterViewInit() 
    {
        this.preProcess();
        this.drawAmChart();
        // this.onTrendsChange(null);
        this.viewInit = true;
    }

    drawAmChart() 
    {
        let chart = am4core.create(this.chartId, am4charts.XYChart);

        // data
        chart.data = this.data;
        chart.paddingRight = 20;

        let dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.renderer.minGridDistance = 60;

        dateAxis.renderer.labels.template.horizontalCenter = "right";       // these three lines are for rotataion of category axis label (dateAxis.renderer.minHeight = 110) min height of label
        dateAxis.renderer.labels.template.verticalCenter = "middle";
        dateAxis.renderer.labels.template.rotation = 270;

        if (this.currentTheme === 'theme-default')
        {
            // Set xAxis Labels Color
            dateAxis.renderer.labels.template.fill = am4core.color("#fff");
            // Set xAxis Grid lines color
            dateAxis.renderer.grid.template.stroke = am4core.color("#c0c0c2");
        }

        dateAxis.dateFormats.setKey("second", "ss");
        dateAxis.periodChangeDateFormats.setKey("second", "[bold]h:mm a");
        dateAxis.periodChangeDateFormats.setKey("minute", "[bold]h:mm a");
        dateAxis.periodChangeDateFormats.setKey("hour", "[bold]h:mm a");
        dateAxis.renderer.inside = true;
        dateAxis.renderer.axisFills.template.disabled = true;
        dateAxis.renderer.ticks.template.disabled = true;
        dateAxis.renderer.minHeight = 110;

        dateAxis.events.on("validated", (e) => {

            let v0 = e.target['_finalMin'];
            let v1 = e.target['_finalMax'];
            let r0 = e.target['_finalStart'];
            let r1 = e.target['_finalEnd'];

            if ((v0 != undefined || v0 != null) && (v1 != undefined || v1 != null) && (r0 != undefined || r0 != null) && (r1 != undefined || r1 != null)) {
                
                this.t0 = null;
                this.t1 = null;
                this.t0 = (v0+(v1-v0)*r0) / 1000;
                this.t1 = (v0+(v1-v0)*r1) / 1000;
            }
        });

        this.axisDict = [];
        this.chartSeries = {};

        for (let i=0; i<this.datasets.length; i++) 
        {
            let dataset: any = this.datasets[i];
           

            if (i==0) {
                this.activeDatasetName = dataset.name;
            }

            if (dataset.refAxis != null) {
                let valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
                valueAxis.renderer.minWidth = 35;
                
                if (this.currentTheme === 'theme-default')
                {
                    // Set yAxis labels color;
                    valueAxis.renderer.labels.template.fill = am4core.color("#fff");

                    // Set yAxis grid lines color;
                    valueAxis.renderer.grid.template.stroke = am4core.color("#c0c0c2");
                }

                this.axisDict[dataset.refAxis.name] = valueAxis;
                dataset.refAxisName = dataset.refAxis.name;
            }
        
            this.index += i;

            this.chartSeries[dataset.name] = dataset;

            let valueAxis1 = this.axisDict[dataset.refAxisName];

            if (valueAxis1 == null) {
                alert('no value axis found for name: '+dataset.refAxisName);
                return;
            }

            let series = chart.series.push(new am4charts.LineSeries());
            dataset.dataSeries = series;

            series.dataFields.dateX = "date";
            series.dataFields.valueY = dataset.name;
            series.name = dataset.name;

            series.tooltipText = dataset.name + ": [b]{valueY}[/]";

            // random color picker for graphs
            let color = '#a87932';
            let j = 0;
            if (i > this.colors.length-1) {
                let index = Math.floor(Math.random() * (this.colors.length - 0 )) + 0;
                if (index > -1 && index < this.colors.length) {
                    j = index;
                }
            }
            else {
                j = i;
            }
            
            series.stroke = this.colors[j];
            
            let bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.tooltipText = dataset.name + ": [b]{valueY}[/]";
            bullet.strokeWidth = 1;
            bullet.stroke = am4core.color(color)
            bullet.circle.fill = series.stroke;
            

            dataset.normalRangeLines = this.makeRangeLines(chart, dataset, 'Normal', 'green');
            dataset.warningRangeLines =  this.makeRangeLines(chart, dataset, 'Warning', 'orange');
            dataset.criticalRangeLines =  this.makeRangeLines(chart, dataset, 'Critical', 'red');
            
            let tName = dataset.name.toLowerCase().replace(/\s/g, "_") + '_TrendLines';
            dataset[tName] = this.makeTrendLines(chart, dataset, this.colors[j]);

            // Hidden Legends
            if (this.index > 2) {
                
                series.hidden = true;
                dataset[tName].hidden = true;
            }
        }

        /* Add legend */
        chart.legend = new am4charts.Legend();
        
        /* Add Scrollbar */
        chart.scrollbarX = new am4core.Scrollbar();

        // Update TrendLines
        chart.scrollbarX.events.on("up", (e) => {
            if ((this.t0 != undefined || this.t0 != null) && (this.t1 != undefined || this.t1 != null)) {
                let dict = {'name': this.name, 't0': this.t0, 't1': this.t1};
                this.trendValue.emit(dict);
            }
        });

        /* Create a cursor */
        chart.cursor = new am4charts.XYCursor();

        // Legend Click (toggle series)
        chart.legend.itemContainers.template.events.on("hit", (e) => {

            const name = e.target.dataItem['name'];
            const ds = this.chartSeries[name];

            this.toggleLegends(ds);

        }, this);

        this.chart = chart;
    }

    makeRangeLines(chart: am4charts.XYChart, dataset: any, type: string, color: string) 
    {
        let tlcase = type.toLowerCase();

        if (tlcase == 'warning')
            tlcase = 'warn';
        if (tlcase == 'critical')
            tlcase = 'alert';

        let data1 = [
            { "date": new Date(dataset.xMin), "value": dataset[tlcase + '_low_value'] },
            { "date": new Date(dataset.xMax), "value": dataset[tlcase + '_low_value'] }
        ]

        let data2 = [
            { "date": new Date(dataset.xMin), "value": dataset[tlcase + '_high_value'] },
            { "date": new Date(dataset.xMax), "value": dataset[tlcase + '_high_value'] }
        ]

        var l1 = chart.series.push(new am4charts.LineSeries());
        l1.dataFields.valueY = "value";
        l1.dataFields.dateX = "date";
        l1.name = type + " Low";
        l1.strokeWidth = 1
        l1.stroke = l1.fill = am4core.color(color);
        l1.data = data1;
        l1.tooltipText = dataset.title + " " + type +" Low\n[bold font-size: 17px] {valueY}[/]";
        l1.hiddenInLegend = true;
        l1.hidden = true;

        var l2 = chart.series.push(new am4charts.LineSeries());
        l2.dataFields.valueY = "value";
        l2.dataFields.dateX = "date";
        l2.name = type + " High";
        l2.strokeWidth = 1
        l2.stroke = l2.fill = am4core.color(color);
        l2.data = data2;
        l2.tooltipText = dataset.title + " " + type +" High\n[bold font-size: 17px] {valueY}[/]";
        l2.hiddenInLegend = true;
        l2.hidden = true;

        return [l1, l2];
    }

    makeTrendLines(chart: am4charts.XYChart, dataset: any, color: string) 
    {
        this.trendLine = [];
        if (dataset.hasOwnProperty('start_point') && dataset.start_point != null && dataset.hasOwnProperty('end_point') && dataset.end_point != null) {
            this.trendLine =  [
                { "date": new Date(dataset.start_point['date']), "value": dataset.start_point[dataset.name] },
                { "date": new Date(dataset.end_point['date']), "value": dataset.end_point[dataset.name] },
            ]
        }
        
        var trend = chart.series.push(new am4charts.LineSeries());
        trend.dataFields.valueY = "value";
        trend.dataFields.dateX = "date";
        trend.name = dataset.name;
        trend.strokeWidth = 2
        trend.strokeDasharray = "6"
        trend.stroke = trend.fill = am4core.color(color);
        trend.data = this.trendLine;
        trend.tooltipText = dataset.title + " Trend";
        trend.hiddenInLegend = true;

        return trend;
    }

    toggleLegends(ds: any) 
    {
        setTimeout(() => {
            console.log('on toggle-> ', ds.dataSeries);
            console.log('if stat 1', ds.dataSeries.visible);
    
            let tName = ds.name.toLowerCase().replace(/\s/g, "_") + '_TrendLines';

            if (ds.dataSeries.visible) 
            {
                if (this.range.trend) {
                    ds[tName].show();
                }

                else {
                    ds[tName].hide();
                }

                for (let i=0; i< ds.normalRangeLines.length; i++) {
                    
                    if (this.range.normal) {
                        ds.normalRangeLines[i].show();
                    }
        
                    else {
                        ds.normalRangeLines[i].hide();
                        // ds.normalRangeLines[i].hidden = true;
                    }
                }

                for (let i=0; i< ds.warningRangeLines.length; i++) {
                    
                    if (this.range.warning) {
                        ds.warningRangeLines[i].show();
                    }
        
                    else {
                        ds.warningRangeLines[i].hide();
                        // ds.warningRangeLines[i].hidden = true;
                    }
                }

                for (let i=0; i< ds.criticalRangeLines.length; i++) {
                    
                    if (this.range.critical) {
                        ds.criticalRangeLines[i].show();
                    }
        
                    else {
                        ds.criticalRangeLines[i].hide();
                        // ds.criticalRangeLines[i].hidden = true;
                    }
                }
            }
            
            else {
                // ds[tName].hidden = true;
                ds[tName].hide();

                for (let i=0; i< ds.normalRangeLines.length; i++) {
                    ds.normalRangeLines[i].hide();
                    ds.warningRangeLines[i].hide();
                    ds.criticalRangeLines[i].hide();
                }
            }
        }, 1000);
    }

    ngOnDestroy() {
        if (this.chart) {
            this.chart.dispose();
            this.cdr.detach();
        }
    }

    onRangesChange(ev: any) {
        for (let d of this.datasets) {
            const name = d['name'];
            const ds = this.chartSeries[name];
            this.toggleLegends(ds);
        }
    }

    onTrendsChange(ev: any) {
        for (let d of this.datasets) {
            const name = d['name'];
            const ds = this.chartSeries[name];
            this.toggleLegends(ds);
        }
    }

    updateTrendLine(data: any) 
    {
        if (data.length > 0) 
        {
            for (let d of this.datasets) {
                const name = d['name'];
                const ds = this.chartSeries[name];
                let trend = ds.name.toLowerCase().replace(/\s/g, "_") + '_TrendLines';
    
                let _trendLine: any = [];
                if (data[0].hasOwnProperty('start_point') && data[0].start_point != null && data[0].hasOwnProperty('end_point') && data[0].end_point != null) {
                    _trendLine =  [
                        { "date": new Date(data[0].start_point['date']), "value": data[0].start_point[data[0].name] },
                        { "date": new Date(data[0].end_point['date']), "value": data[0].end_point[data[0].name] }
                    ]
    
                    ds[trend]['data'] = _trendLine;
                    this.cdr.detectChanges();
                }
            }
        }
    }
}