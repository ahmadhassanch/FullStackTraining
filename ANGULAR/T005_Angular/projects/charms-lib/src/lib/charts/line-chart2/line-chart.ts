import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Input } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';


import * as am4core from '@amcharts/amcharts4/core';
import * as am4charts from '@amcharts/amcharts4/charts';
import { FuseConfigService } from '../../services';


@Component({
    selector: 'chi-line-chart2',
    templateUrl: './line-chart.html',
    styleUrls: ['./line-chart.scss']
})
export class ChiLineChart2Component implements OnInit, OnDestroy, AfterViewInit 
{
    @Input() x_label: string;
    @Input() y_label: string;
    @Input() chartId: any;
    @Input() name: string;
    @Input() data: any;
    @Input() dateAtXaxis: boolean;

    fname: string;
    private chart: am4charts.XYChart;
    currentTheme: string;

    constructor(private cdr: ChangeDetectorRef, private _fuseConfigService: FuseConfigService) {
        this.chartId = 'chartDiv';
        this.name = 'Line Charts';
        this.data = [];

        this.x_label = 'X Axis';
        this.y_label = 'Y Axis';
        this.dateAtXaxis = false;
    }

    ngOnInit(): void 
    {
        this._fuseConfigService.config
            .subscribe((config) => {
               this.currentTheme = config['colorTheme'];
            });
        
    }

    ngAfterViewInit() 
    {
        if (this.dateAtXaxis)
        {
            this.preProcess();
        }

        this.drawAmChart();
    }

    preProcess() 
    {
        for (let item of this.data) {
            item.value_x_axis = new Date(item.value_x_axis*1000);
        }
    }

    drawAmChart() 
    {
        let chart = am4core.create(this.chartId, am4charts.XYChart);
        
        // data
        chart.data = this.data;
        chart.paddingRight = 20;

        let valueAxisX: any;
        if (this.dateAtXaxis)
        {
            valueAxisX = chart.xAxes.push(new  am4charts.DateAxis());

            valueAxisX.renderer.grid.template.location = 0;
            valueAxisX.renderer.minGridDistance = 60;

            valueAxisX.renderer.labels.template.horizontalCenter = "right";       // these three lines are for rotataion of category axis label (dateAxis.renderer.minHeight = 110) min height of label
            valueAxisX.renderer.labels.template.verticalCenter = "middle";
            valueAxisX.renderer.labels.template.rotation = 285;

            // Set Hours, minutes and seconds to specified format when zoomed.
            valueAxisX.dateFormats.setKey("second", "ss");
            valueAxisX.periodChangeDateFormats.setKey("second", "d MMM, HH:mm");
            valueAxisX.dateFormats.setKey("minute", "d MMM, HH:mm");
            valueAxisX.periodChangeDateFormats.setKey("minute", "d MMM, HH:mm");
            valueAxisX.dateFormats.setKey("hour", "d MMM, HH:mm");
            valueAxisX.periodChangeDateFormats.setKey("hour", "d MMM, HH:mm");

            // Format of the date shown on bullet tooltip;
            valueAxisX.tooltipDateFormat = "d MMM, HH:mm a";
        }
        else
        {
            valueAxisX = chart.xAxes.push(new am4charts.ValueAxis());
        }
        
        valueAxisX.renderer.grid.template.location = 0;
        valueAxisX.title.text = this.x_label;
        // valueAxisX.renderer.minGridDistance = 60;
        // valueAxisX.renderer.labels.template.horizontalCenter = "right"; // these three lines are for rotataion of category axis label (dateAxis.renderer.minHeight = 110) min height of label
        // valueAxisX.renderer.labels.template.verticalCenter = "middle";
        // valueAxisX.renderer.labels.template.rotation = 285;
        // Set FontSize nad Font Weight of date labels shown on x-axis;
        valueAxisX.renderer.fontSize = '12px';
        valueAxisX.renderer.fontWeight = '600';
        // valueAxisX.renderer.inside = true;
        // valueAxisX.renderer.axisFills.template.disabled = true;
        // valueAxisX.renderer.ticks.template.disabled = true;
        // valueAxisX.renderer.minHeight = 110;
        // Create value axis
        let valueAxisY = chart.yAxes.push(new am4charts.ValueAxis());
        valueAxisY.title.text = this.y_label;
        // Create series
        let lineSeries = chart.series.push(new am4charts.LineSeries());
        lineSeries.dataFields.valueY = 'value_y_axis';
        
        if (this.dateAtXaxis)
        {
            lineSeries.dataFields.dateX = "value_x_axis";
            lineSeries.tooltipText = "{dateX} ([b]{valueY})[/]";

            let bullet = lineSeries.bullets.push(new am4charts.CircleBullet());
            bullet.strokeWidth = 1;
            bullet.circle.fill = lineSeries.stroke;
        }
        else
        {
            lineSeries.dataFields.valueX = 'value_x_axis';
        }
        
        /* Add legend */
        // chart.legend = new am4charts.Legend();
        /* Add Scrollbar */
        chart.scrollbarX = new am4core.Scrollbar();
        chart.scrollbarY = new am4core.Scrollbar();
        /* Create a cursor */
        chart.cursor = new am4charts.XYCursor();

        // Theme Setting;
        if (this.currentTheme === 'theme-default')
        {
            valueAxisX.title.fill = am4core.color("#fff");
            valueAxisY.title.fill = am4core.color("#fff");

            // Set xAxis labels color;
            valueAxisX.renderer.labels.template.fill = am4core.color("#fff");
            // Set xAxis grid lines color;
            valueAxisX.renderer.grid.template.stroke = am4core.color("#c0c0c2"); 
        
            // Set yAxis labels color;
            valueAxisY.renderer.labels.template.fill = am4core.color("#fff");
            // Set yAxis grid lines color;
            valueAxisY.renderer.grid.template.stroke = am4core.color("#c0c0c2"); 
        }

        this.chart = chart;
    }
    ngOnDestroy() {
        if (this.chart) {
            this.chart.dispose();
            this.cdr.detach();
        }
    }
}
