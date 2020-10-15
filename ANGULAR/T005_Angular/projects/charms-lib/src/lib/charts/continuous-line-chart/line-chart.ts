import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';


import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import am4themes_animated from '@amcharts/amcharts4/themes/animated';

import { Dataset, Range } from '../line-chart/models';

am4core.useTheme(am4themes_animated);


@Component({
    selector: 'chi-cont-line-chart',
    templateUrl: './line-chart.html',
    styleUrls: ['./line-chart.scss']
})
export class ChiContinuousLineChartComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit {

    private chart: am4charts.XYChart;

    @Input() chartId: any;
    @Input() name: string;
    @Input() datasets: Dataset[];
    @Input() data: any;
    @Input() trendLine: any;
    @Input() reloadData: boolean;
    @Input() minVal: number;
    @Input() maxVal: number;
    @Input() autoScaleSetting: boolean;

    dataRange: number;

    @Output() drawTrendsLine = new EventEmitter();

    t0: any;
    t1: any;

    public activeDatasetName: string;
    public range: Range;
    private viewInit: boolean = false;
    private trendLines: any[];
    private trendLines1: any[];
    private axisDict: {};


    constructor(private cdr: ChangeDetectorRef) {
        this.chartId = 'chartDiv';
        this.name = 'Line Charts'
        this.datasets = [];
        this.data = [];
        this.dataRange = 15;
        this.autoScaleSetting = true;

        this.activeDatasetName = 'Pulse';
        this.trendLine = [];
        this.trendLines = [];
        this.trendLines1 = [];
        this.range = new Range();

        this.t0 = 0;
        this.t1 = 0;

        this.minVal = 0;
        this.maxVal= 150;
    }

    ngOnInit(): void 
    {
        this.minVal = this.autoScaleSetting ? this.minVal : -50;
        this.maxVal = this.autoScaleSetting ? this.maxVal : 110;
    }

    ngOnChanges(changes: SimpleChanges) 
    {
        if (this.viewInit && changes.hasOwnProperty('data') && changes.data.hasOwnProperty('previousValue') && changes.data.previousValue) {

            if (this.reloadData == false) 
            {
                let pre = changes.data.previousValue.length;
                let curr = this.data.length;
                let total = curr - pre;
                let index = pre;

                for (let i=0; i<total; i++) 
                {
                    // update the xMax value as data change
                    let date = this.data[index].date * 1000;
                    this.data[index].date = new Date(date);
                    this.datasets[0].xMax = this.data[index].date;

                    // Real Data Limit while removing first value and displaying recent value
                    if (this.data.length > this.dataRange) 
                    {
                        this.datasets[0].xMin = this.data[this.data.length - this.dataRange].date;
                        this.chart.addData(this.data[index], 1);
                    }

                    else {
                        if (this.data.length == 2) {
                            this.drawRanges();
                        }
                        this.datasets[0].xMin = this.data[0].date;
                        this.chart.addData(this.data[index], 0);
                    }
                    index++;
                }

                // Re-draw the ranges
                this.addRangesLineData();
            }

            else if (this.reloadData == true) 
            {
                this.data = [];
                for (let d of changes.data.currentValue) {
                    this.data.push(d);
                    // update the xMax value as data change
                    this.datasets[0].xMax = d.date;
                }

                this.preProcess();
                this.drawAmChart();
                this.drawRanges();
                this.cdr.detectChanges();
            }

        }

        if (this.viewInit && changes.hasOwnProperty('minVal')) 
        {
            this.minVal = this.autoScaleSetting ? changes.minVal.currentValue : -50;
            // this.chart['yAxes'].values[0]['strictMinMax'] = true;
            this.chart['yAxes'].values[0]['min'] = this.minVal;
        }

        if (this.viewInit && changes.hasOwnProperty('maxVal')) 
        {
            this.maxVal =  this.autoScaleSetting ? changes.maxVal.currentValue : 110;
            // this.chart['yAxes'].values[0]['strictMinMax'] = true;
            this.chart['yAxes'].values[0]['max'] = this.maxVal;
        }
    }

    preProcess() {
        for (let item of this.data) {
            item.date = new Date();
        }
    }

    ngAfterViewInit() {
        this.preProcess();
        if (this.datasets.length > 0) 
        {
            this.drawAmChart();
        }
        this.viewInit = true;
    }

    drawAmChart() {
        let chart = am4core.create(this.chartId, am4charts.XYChart);

        chart.hiddenState.properties.opacity = 0;

        chart.padding(0, 0, 0, 0);
        chart.paddingRight = 20;
        chart.paddingLeft = 25;

        chart.zoomOutButton.disabled = true;

        chart.data = this.data;

        var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
        dateAxis.renderer.grid.template.location = 0;
        dateAxis.renderer.minGridDistance = 30;
        // dateAxis.renderer.maxGridDistance = 100;

        dateAxis.renderer.labels.template.horizontalCenter = 'right';       // these three lines are for rotataion of category axis label (dateAxis.renderer.minHeight = 110) min height of label
        dateAxis.renderer.labels.template.verticalCenter = 'middle';
        dateAxis.renderer.labels.template.rotation = 270;

        dateAxis.dateFormats.setKey('second', 'ss');
        dateAxis.periodChangeDateFormats.setKey('second', '[bold]h:mm a');
        dateAxis.periodChangeDateFormats.setKey('minute', '[bold]h:mm a');
        dateAxis.periodChangeDateFormats.setKey('hour', '[bold]h:mm a');
        dateAxis.renderer.inside = true;
        dateAxis.renderer.axisFills.template.disabled = true;
        dateAxis.renderer.ticks.template.disabled = true;
        dateAxis.renderer.minHeight = 110;
        dateAxis.endLocation = 1;
        dateAxis.extraMax = 0.1;

        let _self = this; // for different scope
        dateAxis.events.on('validated', function(e) {

            // console.log('ev-> ', e)
            let v0 = e.target['_finalMin'];
            let v1 = e.target['_finalMax'];
            let r0 = e.target['_finalStart'];
            let r1 = e.target['_finalEnd'];

            if ((v0 != undefined || v0 != null) && (v1 != undefined || v1 != null) && (r0 != undefined || r0 != null) && (r1 != undefined || r1 != null)) {

                _self.t0 = null;
                _self.t1 = null;
                _self.t0 = (v0+(v1-v0)*r0) / 1000;
                _self.t1 = (v0+(v1-v0)*r1) / 1000;
            }

            // e.lastZoomed = e;
        });

        var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
        // valueAxis.tooltip.disabled = true;
        valueAxis.interpolationDuration = 500;
        valueAxis.rangeChangeDuration = 500;
        valueAxis.renderer.inside = true;
        valueAxis.renderer.minLabelPosition = 0.05;
        valueAxis.renderer.maxLabelPosition = 0.95;

        if (!this.autoScaleSetting) {
            valueAxis.strictMinMax = true;
        }
        // valueAxis.strictMinMax = true;

        valueAxis.min = this.minVal;
        valueAxis.max = this.maxVal; 

        valueAxis.renderer.axisFills.template.disabled = true;
        valueAxis.renderer.ticks.template.disabled = true;

        var series = chart.series.push(new am4charts.LineSeries());
        series.dataFields.dateX = 'date';
        series.dataFields.valueY = this.name;
        series.interpolationDuration = 500;
        // series.tooltipText = "[{dateX}: bold]{valueY}[/]";
        series.defaultState.transitionDuration = 0;
        series.tensionX = 0.8;
        series.connect = true;

        var bullet = series.bullets.push(new am4charts.CircleBullet());
        bullet.stroke = am4core.color('#88f');
        bullet.strokeWidth = 3;

        dateAxis.interpolationDuration = 500;
        dateAxis.rangeChangeDuration = 500;
        series.fillOpacity = 1;

        var gradient = new am4core.LinearGradient();
        gradient.addColor(chart.colors.getIndex(0), 0.2);
        gradient.addColor(chart.colors.getIndex(0), 0);
        series.fill = gradient;

        // need to set this, otherwise fillOpacity is not changed and not set
        dateAxis.events.on('datarangechanged', function () {
            am4core.iter.each(dateAxis.renderer.labels.iterator(), function (label) {
                label.fillOpacity = label.fillOpacity;
            })
        })

        // bullet at the front of the line
        var bullet = series.createChild(am4charts.CircleBullet);
        bullet.circle.radius = 5;
        bullet.fillOpacity = 1;
        bullet.fill = chart.colors.getIndex(0);
        bullet.isMeasured = false;

        series.events.on('validated', function() {
            bullet.moveTo(series.dataItems.last.point);
            bullet.validatePosition();
        });

        chart.scrollbarX = new am4core.Scrollbar();

        chart.scrollbarX.events.on('up', () => {
            if ((this.t0 != undefined || this.t0 != null) && (this.t1 != undefined || this.t1 != null)) {
                let dict = {'t0': this.t0, 't1': this.t1};
                this.drawTrendsLine.emit(dict);
            }
        });


        // New changes regarding to tooltip text
        // forcely changed color of tooltip text
        series.tooltip.getFillFromObject = false;
        series.tooltip.background.fill = am4core.color('#CEB1BE');
        series.tooltipText = '{dateX} \n[bold font-size: 17px]{valueY}[/]';

        /* Create a cursor */
        chart.cursor = new am4charts.XYCursor();
        /* Configure axis tooltip */
        var axisTooltip = dateAxis.tooltip;
        // axisTooltip.background.fill = am4core.color("#07BEB8");
        axisTooltip.background.strokeWidth = 0;
        axisTooltip.background.cornerRadius = 3;
        axisTooltip.background.pointerLength = 0;
        // axisTooltip.dy = 5;

        /* Decorate axis tooltip content */
        dateAxis.adapter.add('getTooltipText', (text) => {
            return '[bold]' + text + '[/]';
        });
        // End of New Changes


        // newly added (START)

        chart.events.on('ready', function(ev) 
        {
            if (_self.autoScaleSetting) 
            {
                valueAxis.min = valueAxis.minZoomed;
                valueAxis.max = valueAxis.maxZoomed;
            }
            else {
                valueAxis.min = -50;
                valueAxis.max = 110;
            }
        });
        // newly added (ENDS)

        //   chart.startDuration = 0;

        this.chart = chart;
    }

    drawTrendLine() {

        for (let tline of this.trendLines1) {
            this.chart.series.removeValue(tline);
        }

        this.trendLines1 = [];

        var trend = this.chart.series.push(new am4charts.LineSeries());
        trend.dataFields.valueY = this.name;
        trend.dataFields.dateX = 'date';
        trend.strokeWidth = 1
        trend.stroke = trend.fill = am4core.color('#00ff00');
        trend.data = this.trendLine;
        this.trendLines1.push(trend);

        let bullet = trend.bullets.push(new am4charts.CircleBullet());
        bullet.tooltipText = '{new Data(date)} \n[bold font-size: 17px]value: {valueY}[/]';
        bullet.strokeWidth = 1;
        bullet.stroke = am4core.color('#00ff00')
        bullet.circle.fill = trend.stroke;

        let hoverState = bullet.states.create('hover');
        hoverState.properties.scale = 1.7;
    };

    drawRanges() {

        for (let tline of this.trendLines) {
            this.chart.series.removeValue(tline);
        }

        this.trendLines = [];

        if (this.range.normal) {

            // this.chart.synchronizeGrid = false;

            for (let i=0; i < this.datasets.length; i++) {
                let dataset = this.datasets[i]

                //  1000 means => 1 sec = 1000 milisecs
                let msMax = dataset.xMax + (1000*60);
                let data1 = [
                    { 'date': new Date(dataset.xMin), 'value': dataset.normal_low_value },
                    { 'date': new Date(msMax), 'value': dataset.normal_low_value }
                ]

                let data2 = [
                    { 'date': new Date(dataset.xMin), 'value': dataset.normal_high_value },
                    { 'date': new Date(msMax), 'value': dataset.normal_high_value }
                ]

                let text = dataset.title + ' Normal low';

                var l1 = this.chart.series.push(new am4charts.LineSeries());
                l1.dataFields.valueY = 'value';
                l1.dataFields.dateX = 'date';
                l1.strokeWidth = 1
                l1.stroke = l1.fill = am4core.color('#2196f3');
                l1.name = 'Normal Low';
                l1.data = data1;
                l1.tooltipText = '{dataset.title} Normal low\n[bold font-size: 17px]value: {valueY}[/]';
                this.trendLines.push(l1);

                var l2 = this.chart.series.push(new am4charts.LineSeries());
                l2.dataFields.valueY = 'value';
                l2.dataFields.dateX = 'date';
                l2.strokeWidth = 1
                l2.stroke = l2.fill = am4core.color('#2196f3');
                l2.name = 'Normal High';
                l2.data = data2;
                l2.tooltipText = '{dataset.title} Normal High\n[bold font-size: 17px]value: {valueY}[/]';
                this.trendLines.push(l2);

            }
        }

        if (this.range.warning) {

            // this.chart.synchronizeGrid = false;

            for (let i=0; i < this.datasets.length; i++) {
                let dataset = this.datasets[i]

                //  1000 means => 1 sec = 1000 milisecs
                let msMax = dataset.xMax + (1000*60);

                let data1 = [
                    { 'date': new Date(dataset.xMin), 'value': dataset.warn_low_value },
                    { 'date': new Date(msMax), 'value': dataset.warn_low_value }
                ]

                let data2 = [
                    { 'date': new Date(dataset.xMin), 'value': dataset.warn_high_value },
                    { 'date': new Date(msMax), 'value': dataset.warn_high_value }
                ]

                let text = dataset.title + ' Normal low';

                var l1 = this.chart.series.push(new am4charts.LineSeries());
                l1.dataFields.valueY = 'value';
                l1.dataFields.dateX = 'date';
                l1.strokeWidth = 1
                l1.stroke = l1.fill = am4core.color('#ffab40');
                l1.name = 'Warning Low';
                l1.data = data1;
                l1.tooltipText = '{dataset.title} Warning low\n[bold font-size: 17px]value: {valueY}[/]';
                this.trendLines.push(l1);

                var l2 = this.chart.series.push(new am4charts.LineSeries());
                l2.dataFields.valueY = 'value';
                l2.dataFields.dateX = 'date';
                l2.strokeWidth = 1
                l2.stroke = l2.fill = am4core.color('#ffab40');
                l2.name = 'Warning High';
                l2.data = data2;
                l2.tooltipText = '{dataset.title} Warning High\n[bold font-size: 17px]value: {valueY}[/]';
                this.trendLines.push(l2);

            }
        }

        if (this.range.critical) {

            // this.chart.synchronizeGrid = false;

            for (let i=0; i < this.datasets.length; i++) {

                let dataset = this.datasets[i]

                //  1000 means => 1 sec = 1000 milisecs
                let msMax = dataset.xMax + (1000*60);

                // In data array first object represent initial value while 2nd object represent final value
                let data1 = [
                    { 'date': new Date(dataset.xMin), 'value': dataset.alert_low_value },
                    { 'date': new Date(msMax), 'value': dataset.alert_low_value }
                ]

                let data2 = [
                    { 'date': new Date(dataset.xMin), 'value': dataset.alert_high_value },
                    { 'date': new Date(msMax), 'value': dataset.alert_high_value }
                ]

                var l1 = this.chart.series.push(new am4charts.LineSeries());
                l1.dataFields.valueY = 'value';
                l1.dataFields.dateX = 'date';
                l1.strokeWidth = 1
                l1.stroke = l1.fill = am4core.color('#f44336');
                l1.name = 'Critical Low';
                l1.data = data1;
                l1.tooltipText = '{dataset.title} Critical low\n[bold font-size: 17px]value: {valueY}[/]';
                this.trendLines.push(l1);

                var l2 = this.chart.series.push(new am4charts.LineSeries());
                l2.dataFields.valueY = 'value';
                l2.dataFields.dateX = 'date';
                l2.strokeWidth = 1
                l2.stroke = l2.fill = am4core.color('#f44336');
                l2.name = 'Critical High';
                l2.data = data2;
                l2.tooltipText = '{dataset.title} Critical High\n[bold font-size: 17px]value: {valueY}[/]';
                this.trendLines.push(l2);

            }
        }
    }

    addRangesLineData() {

        for (let d of this.trendLines) {
            if (d.name == 'Normal Low') {
                d.addData({ 'date': new Date(this.datasets[0].xMin), 'value': this.datasets[0].normal_low_value }, 1)
                d.addData({ 'date': new Date(this.datasets[0].xMax), 'value': this.datasets[0].normal_low_value }, 1)
            }

            else if (d.name == 'Normal High') {
                d.addData({ 'date': new Date(this.datasets[0].xMin), 'value': this.datasets[0].normal_high_value }, 1)
                d.addData({ 'date': new Date(this.datasets[0].xMax), 'value': this.datasets[0].normal_high_value }, 1)
            }

            else if (d.name == 'Warning Low') {
                d.addData({ 'date': new Date(this.datasets[0].xMin), 'value': this.datasets[0].warn_low_value }, 1)
                d.addData({ 'date': new Date(this.datasets[0].xMax), 'value': this.datasets[0].warn_low_value }, 1)
            }

            else if (d.name == 'Warning High') {
                d.addData({ 'date': new Date(this.datasets[0].xMin), 'value': this.datasets[0].warn_high_value }, 1)
                d.addData({ 'date': new Date(this.datasets[0].xMax), 'value': this.datasets[0].warn_high_value }, 1)
            }

            else if (d.name == 'Critical Low') {
                d.addData({ 'date': new Date(this.datasets[0].xMin), 'value': this.datasets[0].alert_low_value }, 1)
                d.addData({ 'date': new Date(this.datasets[0].xMax), 'value': this.datasets[0].alert_low_value }, 1)
            }

            else if (d.name == 'Critical High') {
                d.addData({ 'date': new Date(this.datasets[0].xMin), 'value': this.datasets[0].alert_high_value }, 1)
                d.addData({ 'date': new Date(this.datasets[0].xMax), 'value': this.datasets[0].alert_high_value }, 1)
            }
        }
    }

    onRangesChange(ev: any) {
        this.drawRanges();
    }

    ngOnDestroy()
    {
        if (this.chart) {
            this.chart.dispose();
            this.cdr.detach();
        }
    }

    onTrendsChange(e: any)
    {

    }
}