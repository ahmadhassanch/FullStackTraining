import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Input } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { HostListener } from '@angular/core';

import { OfflineChartChannel } from '../models';



@Component({
    selector: 'chi-offline-chart-channel',
    templateUrl: './channel.html',
    styleUrls: ['./channel.scss']
})
export class OfflineChartChannelComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
    @Input() channel: OfflineChartChannel;
    @Input() data: any;
    @Input() isResized: boolean;
    @Input() markedData?: any;

    @ViewChild('chart') chart: ElementRef;

    yScale: number;
    yZero: number;

    graphWidth: number;
    graphHeight: number;
    plotWidth: number;
    plotHeight: number;

    currentX: number;
    currentY: number;

    lastTime: number;
    lastValue: number;

    graphCanvas: HTMLCanvasElement;
    gridCanvas: HTMLCanvasElement;
    fadeCanvas: HTMLCanvasElement;
    fadeDiv: HTMLElement;

    horiLabelsCanvas: HTMLCanvasElement;
    vertLabelsCanvas: HTMLCanvasElement;
    pointerCanvas: HTMLCanvasElement;

    graphContext: CanvasRenderingContext2D;
    gridContext: CanvasRenderingContext2D;
    fadeContext: CanvasRenderingContext2D;

    horiLabelContext: CanvasRenderingContext2D;
    vertLabelContext: CanvasRenderingContext2D;
    pointerContext: CanvasRenderingContext2D;

    pixelsPerSample: number;
    pixelsPerUnitX: number;
    pixelsPerUnitY: number;

    drawStarted: boolean;
    startTime: number;
    currPacket: any;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resize();
    }

    constructor()
    {
        this.currentX = 0.0;
        this.currentY = 0.0;
        this.data = [];

        this.drawStarted = false;
        this.isResized = false;
        this.markedData = null;
    }

    ngOnInit(): void
    {
        this.graphHeight = this.channel.height;

        this.startTime = (new Date()).getTime() / 1000.0;

        const dy = this.channel.yMax - this.channel.yMin;
        const mid = this.channel.yMin + dy / 2;

        this.currPacket = [0];
        // for (let i = 0; i < 512; i++)
        // {
        //     this.currPacket.push(mid);
        // }

        if (this.data)
        {
            this.currPacket = this.data;
        }
    }

    ngAfterViewInit(): void
    {
        this.channel.width = this.chart.nativeElement.offsetWidth;
        this.graphWidth = this.channel.width;


        this.plotWidth = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.plotHeight = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];

        this.pixelsPerSample = this.plotWidth / this.channel.duration / this.channel.sampleRate;

        const dy = this.channel.yMax - this.channel.yMin;

        this.pixelsPerUnitX = this.plotWidth / this.channel.duration;
        this.pixelsPerUnitY = this.plotHeight / dy;

        this.yZero = this.plotHeight + this.plotHeight / dy * this.channel.yMin;

        this.initChannel();
        this.drawGrid();
        // this.drawData();
        // this.addSample();
        this.drawData();

        // if (this.markedData !== null && this.markedData !== void 0)
        // {
        //     this.drawPoint();
        // }
    }

    ngOnDestroy()
    {
    }

    ngOnChanges(changes: SimpleChanges)
    {
        if (this.drawStarted && changes.data)
        {
            this.currPacket = changes.data.currentValue;
            this.drawData();
        }

        if (this.drawStarted && changes.isResized)
        {
            this.resize();
        }

        // if (changes.markedData && this.markedData !== null && this.markedData !== void 0)
        // {
        //     this.drawPoint();
        // }
    }

    private initChannel()
    {
        this.graphCanvas = this.createCanvas(this.graphWidth, this.graphHeight);
        this.graphCanvas.width = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.graphCanvas.height = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];
        this.graphCanvas.style.top = this.channel.margins[0] + 'px';
        this.graphCanvas.style.right = this.channel.margins[1] + 'px';
        this.graphCanvas.style.bottom = this.channel.margins[2] + 'px';
        this.graphCanvas.style.left = this.channel.margins[3] + 'px';
        // this.graphCanvas.style.background = '#0a0c1a';
        this.graphContext = this.graphCanvas.getContext('2d');
        this.graphContext.strokeStyle = this.channel.strokeStyle;

        this.gridCanvas = this.createCanvas(this.graphWidth, this.graphHeight);
        this.gridCanvas.width = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.gridCanvas.height = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];
        this.gridCanvas.style.top = this.channel.margins[0] + 'px';
        this.gridCanvas.style.right = this.channel.margins[1] + 'px';
        this.gridCanvas.style.bottom = this.channel.margins[2] + 'px';
        this.gridCanvas.style.left = this.channel.margins[3] + 'px';
        this.gridCanvas.style.background = '#0a0c1a';
        // this.gridCanvas.style.background = '#ffff00';
        this.gridContext = this.gridCanvas.getContext('2d');


        // this.horiLabelsCanvas = this.createCanvas(this.graphWidth, this.channel.height);
        // this.horiLabelsCanvas.style.left = '-40px';
        // this.horiLabelContext = this.horiLabelsCanvas.getContext('2d');

        // this.vertLabelsCanvas = this.createCanvas(this.graphWidth, this.channel.height);
        // this.vertLabelsCanvas.style.left = '-40px';
        // this.vertLabelContext = this.vertLabelsCanvas.getContext('2d');

        // this.pointerCanvas = this.createCanvas(this.graphWidth, this.graphHeight);
        // this.pointerContext = this.pointerCanvas.getContext('2d');

        this.chart.nativeElement.appendChild(this.gridCanvas);
        this.chart.nativeElement.appendChild(this.graphCanvas);

        // this.chart.nativeElement.appendChild(this.fadeDiv);
        // this.fadeDiv.appendChild(this.fadeCanvas);
        // this.chart.nativeElement.appendChild(this.fadeCanvas);

        // this.chart.nativeElement.appendChild(this.horiLabelsCanvas);
        // this.chart.nativeElement.appendChild(this.vertLabelsCanvas);
        // this.chart.nativeElement.appendChild(this.pointerCanvas);
    }

    private createCanvas(w: number, h: number)
    {
        const canvas = document.createElement('canvas') as HTMLCanvasElement;
        canvas.width = w;
        canvas.height = h;
        canvas.style.position = 'absolute';

        return canvas;
    }

    private drawGrid()
    {
        this.gridContext.beginPath();
        this.gridContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.gridContext.lineWidth = 0.5;
        for (let i = 0; i <= this.channel.duration; i += this.channel.gx) {
            const x = i * this.pixelsPerUnitX;
            this.gridContext.moveTo(x, 0);
            this.gridContext.lineTo(x, this.graphHeight);
        }
        this.gridContext.stroke();

        this.gridContext.beginPath();
        this.gridContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.gridContext.lineWidth = 1.0;
        for (let i = 0; i <= this.channel.duration; i += this.channel.Gx) {
            const x = i * this.pixelsPerUnitX;
            this.gridContext.moveTo(x, 0);
            this.gridContext.lineTo(x, this.graphHeight);
        }
        this.gridContext.stroke();

        this.gridContext.beginPath();
        this.gridContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.gridContext.lineWidth = 0.5;

        let yStart = this.getStartY(this.channel.gy);
        for (let i = yStart; i <= this.channel.yMax; i += this.channel.gy) {
            const y = this.converToCanvasCoords(i);
            this.gridContext.moveTo(0, y);
            this.gridContext.lineTo(this.plotWidth, y);
        }
        this.gridContext.stroke();

        this.gridContext.beginPath();
        this.gridContext.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        this.gridContext.lineWidth = 1.0;

        yStart = this.getStartY(this.channel.Gy);
        for (let i = yStart; i <= this.channel.yMax; i += this.channel.Gy) {
            const y = this.converToCanvasCoords(i);
            this.gridContext.moveTo(0, y);
            this.gridContext.lineTo(this.plotWidth, y);
        }

        if (this.channel.drawRanges)
        {
            this.drawRanges();
        }

        this.gridContext.stroke();

    }

    drawRanges()
    {
        this.gridContext.fillStyle = this.channel.strokeStyle;
        this.gridContext.textBaseline='bottom'
        this.gridContext.font = 'bold 14px Arial';
        this.gridContext.fillText((this.channel.yMax).toString(), 0, 15);
        this.gridContext.stroke();

        this.gridContext.fillText((this.channel.yMin).toString(), 0, this.plotHeight);
        this.gridContext.stroke();
    }

    eraseArea(n: number)
    {
        this.graphContext.clearRect(this.lastTime, 0, 20, this.plotHeight);

        // if (this.lastTime + (n * 0.01) > this.channel.width)
        // {
        //     this.graphContext.clearRect(0, 0, 20, this.plotHeight);
        // }
    }

    drawData()
    {
        // console.log('Channel Data', this.currPacket)
        if (!this.drawStarted)
        {
            this.drawStarted = true;
            this.lastTime = 0;  // data.time - this.startTime;
            this.lastValue = this.currPacket[0];
        }

        // this.eraseArea(data.length);
        this.graphContext.clearRect(0, 0, this.plotWidth, this.plotHeight);

        this.graphContext.beginPath();

        // this.graphContext.strokeStyle = 'rgba(255, 255, 0, 1)';
        this.graphContext.strokeStyle = this.channel.strokeStyle;
        this.graphContext.lineCap = 'round';
        this.graphContext.lineJoin = 'round';
        this.graphContext.lineWidth = 2.0;



        let cTime = 0;
        let cY = 0;
        this.graphContext.moveTo(0, this.converToCanvasCoords(this.currPacket[0]));

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this.currPacket.length; i++)
        {
            // cTime += 0.1;
            cTime += this.pixelsPerSample;
            cY = this.currPacket[i];

            // this.graphContext.moveTo(oTime, this.converToCanvasCoords(oY));
            this.graphContext.lineTo(cTime, this.converToCanvasCoords(cY));
            // this.graphContext.arcTo(
            //     cTime, this.converToCanvasCoords(cY),
            //     oTime, this.converToCanvasCoords(oY),
            //     1.5);

            // if (cTime > this.channel.width)
            // {
            //     cTime = 0;
            //     this.graphContext.stroke();

            //     this.graphContext.clearRect(0, 0, (this.channel.sampleRate * 0.5) * this.pixelsPerSample, this.plotHeight);

            //     this.graphContext.beginPath();
            //     this.graphContext.moveTo(cTime, this.converToCanvasCoords(cY));
            // }

        }

        this.lastTime = cTime;
        this.lastValue = cY;

       this.graphContext.stroke();
    }

    getStartY(g: number) {
        return Math.ceil(this.channel.yMin / g) * g;
    }

    converToCanvasCoords(v: number) {
        return (this.yZero - (this.pixelsPerUnitY * v));
    }

    // tslint:disable-next-line: variable-name
    private drawFine(total_time, total_vt_grids, inc_val) {
        const inc = this.graphWidth / total_time;
        let time = 0;
        let val = 0;

        for (let i = this.graphHeight; i >= 0; i -= total_vt_grids) {
            this.vertLabelContext.fillStyle = 'green';
            this.vertLabelContext.textBaseline = 'middle';
            this.vertLabelContext.font = '14px Roboto';
            this.vertLabelContext.textAlign = 'right';
            this.vertLabelContext.fillText(val.toFixed(0), 34, i);

            this.gridContext.moveTo(0, i);
            this.gridContext.lineTo(this.graphWidth, i);
            val += inc_val;
        }

        for (let i = 0; i <= this.graphWidth; i += inc) {
            this.horiLabelContext.fillStyle = 'green';
            this.horiLabelContext.textBaseline = 'bottom';
            this.horiLabelContext.font = '14px Roboto';
            this.horiLabelContext.textAlign = 'center';
            this.horiLabelContext.fillText(time.toFixed(0), i + 40, this.graphHeight + 20);

            this.gridContext.moveTo(i, 0);
            this.gridContext.lineTo(i, this.graphHeight);
            time += 1;
        }
    }

    resize()
    {
        const w = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        const h = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];

        this.graphContext.clearRect(0, 0, w, h);
        this.gridContext.clearRect(0, 0, w, h);

        this.channel.width = this.chart.nativeElement.offsetWidth;
        this.graphWidth = this.channel.width;


        this.plotWidth = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.plotHeight = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];

        this.pixelsPerSample = this.plotWidth / this.channel.duration / this.channel.sampleRate;

        const dy = this.channel.yMax - this.channel.yMin;

        this.pixelsPerUnitX = this.plotWidth / this.channel.duration;
        this.pixelsPerUnitY = this.plotHeight / dy;

        this.yZero = this.plotHeight + this.plotHeight / dy * this.channel.yMin;

        this.graphCanvas.width = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.graphCanvas.height = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];
        this.gridCanvas.width = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.gridCanvas.height = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];

        this.drawGrid();
        this.drawData();
    }

    drawPoint()
    {
        this.graphContext.clearRect(0, 0, this.plotWidth, this.plotHeight);
        if (this.markedData !== null && this.markedData !== void 0)
        {
            for (let i=0; i< this.markedData.FMOV; i++)
            {
                if (this.markedData.FMOV[i] !== 0)
                {
                    const cY = this.markedData.FHR[i];
                    this.graphContext.moveTo(cY, 0);
                    this.graphContext.lineTo(cY, 20);
                    this.graphContext.moveTo(cY-10, 20-10);
                    this.graphContext.lineTo(cY, 20);
                    this.graphContext.moveTo(cY+10, 20-10);
                    this.graphContext.lineTo(cY, 20);
                    this.graphContext.closePath();
                    this.graphContext.stroke();
                }
            }
        }
    }
}