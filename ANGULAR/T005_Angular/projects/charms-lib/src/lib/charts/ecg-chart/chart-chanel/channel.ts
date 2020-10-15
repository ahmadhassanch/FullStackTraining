import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Renderer2 } from '@angular/core';
import { HostListener } from '@angular/core';

import { EcgChannel } from '../models';
import { EcgGridsHelperFunctions } from './graph_helper_functions';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
    selector: 'chi-ecg-channel',
    templateUrl: './channel.html',
    styleUrls: ['./channel.scss']
})
export class EcgChannelComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges
{
    @Input() channel: EcgChannel;
    @Input() data: any;
    @Input() isResized: boolean;
    @Input() isMarked: boolean;
    @Input() pushInitialData: boolean;
    @Input() timerCalled: boolean;
    @Input() onPlayLastDrawTime: number;
    @Input() isDrawGrids: boolean;
    @Input() session_status: Subject<any>;
    @Output() signals = new EventEmitter<any>();

    @ViewChild('chart') chart: ElementRef;
    gridsHelper: EcgGridsHelperFunctions;

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
    dataStream; any;
    currPacket: any;
    currIdx: number;
    bufDelay = 0;

    lastDrawTime: number;
    lastBufferSize: number;

    isSessionBreak: boolean;
    isSessionReconnected: boolean;
    isPaused: boolean;
    private _unsubscribeAll: Subject<any>;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.resize();
    }

    // @HostListener('window:blur', ['$event'])
    // onBlur(event: any): void {
    //     this._onBlur();
    // }

    // @HostListener('window:focus', ['$event'])
    // onFocus(event: any): void {
    //     this._onFocus();
    // }

    constructor(private renderer:Renderer2, private elRef: ElementRef)
    {
        this.currentX = 0.0;
        this.currentY = 0.0;
        this.lastDrawTime = null;
        this.onPlayLastDrawTime = null;

        this.data = [];
        this.dataStream = [];

        this.drawStarted = false;
        this.isResized = false;
        this.isMarked = false;
        this.pushInitialData = false;
        this.lastBufferSize = 0;
        this.isPaused = false;
        this.timerCalled = false;
        this.isDrawGrids = true;
        this.isSessionBreak = false;
        this.isSessionReconnected = false;
        this.session_status = null;
        this._unsubscribeAll = new Subject();
        this.gridsHelper = new EcgGridsHelperFunctions();
    }

    ngOnInit(): void
    {
        this.channel.defaultGrids = (this.channel.defaultGrids !== null && this.channel.defaultGrids !== void 0) ? this.channel.defaultGrids : true;
        this.channel.nonEcgGraphGrids = (this.channel.nonEcgGraphGrids !== null && this.channel.nonEcgGraphGrids !== void 0) ? this.channel.nonEcgGraphGrids : false;
        this.graphHeight = this.channel.height;

        this.startTime = (new Date()).getTime() / 1000.0;
        this.lastDrawTime = this.startTime;


        const dy = this.channel.yMax - this.channel.yMin;
        const mid = this.channel.yMin + dy / 2;

        this.currPacket = [];
        this.currIdx = 0;
        if (this.pushInitialData)
        {
            for (let i = 0; i < 0; i++)
            {
                this.currPacket.push(mid);
            }
        }

        if (this.session_status !== null)
        {
            this.session_status.pipe(takeUntil(this._unsubscribeAll)).subscribe((data: any) =>
            {
                if (data !== null && data !== void 0)
                {
                    console.log(this.channel.name, ' Session Status=> ', data.type, " Break=> ", this.isSessionBreak, " Reconnected=> ", this.isSessionReconnected)
                    if (data.type === 'Session-Break')
                    {
                        this.isSessionReconnected = false;
                        let delay: any = ((this.lastBufferSize / 256.0)).toFixed(1);
                        if (parseFloat(delay) === 0.0)
                        {
                            this.drawSessionStatus('red');
                            this.isSessionBreak = false;
                        }
                        else
                        {
                            this.isSessionBreak = true;
                        }
                    }

                    else if (data.type === 'Session-Reconnect')
                    {
                        if (this.isSessionBreak)
                        {
                            this.isSessionReconnected = true;
                        }
                        else
                        {
                            this.drawSessionStatus('green');
                            this.isSessionReconnected = false;
                        }
                    }
                }
            });
        }
    }

    drawSessionStatus(stroke: string) 
    {
        this.graphContext.beginPath();
        this.graphContext.strokeStyle = stroke;
        this.graphContext.lineWidth = 3;

        this.graphContext.moveTo(this.lastTime, 0);
        this.graphContext.lineTo(this.lastTime, this.channel.height);

        this.graphContext.stroke();
        this.graphContext.lineWidth = 3;
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
       
        // calculating height for ecg square grids
        this.findHeight();
        this.initChannel();
        this.drawGrids();
        
        // this.addSample();
        this.lastTime = 0;  // data.time - this.startTime;
        this.lastValue = this.currPacket[0];
        this.lastDrawTime = (new Date()).getTime() * 0.001; // divided by 1000
        this.drawStarted = true;
        if (this.isMarked)
            this.drawPoint();
    }

    ngOnChanges(changes: SimpleChanges)
    {
        if (this.drawStarted && changes.data && !this.isPaused)
        {
            // this.drawData(changes.data.currentValue);
            if (changes.data.currentValue !== null && changes.data.currentValue !== void 0)
                this.dataStream.push(changes.data.currentValue);
        }

        if (this.drawStarted && changes.isResized) 
        {
            this.resize();
        }

        
		if (this.drawStarted && changes.isMarked) {
			if (changes.isMarked.currentValue == true) {
				this.drawPoint();
			}
        }
        
        if (this.drawStarted && changes.timerCalled) {
            this.drawData1();
        }
    }

    ngOnDestroy() 
    {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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
        // this.graphContext.lineCap = 'round';
        // this.graphContext.lineJoin = 'round';
        // this.graphContext.lineWidth = 2.0;

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
        const canvas = <HTMLCanvasElement>document.createElement('canvas');
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

        // let inc: number = this.gridCanvas.width/this.channel.duration;
        // let count: number = 0;
        // for (let i = 0; i <= this.gridCanvas.width; i+=inc) 
        // {
        //     console.log('loop-> ', inc)
        //     const d2 = this.renderer.createElement('span');
        //     const text = this.renderer.createText(count.toString());
        //     this.renderer.setStyle(d2, 'color', 'white');
        //     this.renderer.setStyle(d2, 'position', 'absolute');
        //     this.renderer.setStyle(d2, 'bottom', '-10px');
        //     this.renderer.setStyle(d2, 'left', i+'px');
        //     this.renderer.setStyle(d2, 'font-size', '10px');
        //     this.renderer.setProperty(d2, 'id', 'x_label_'+count);
        //     this.renderer.appendChild(d2, text);
        //     this.renderer.appendChild(this.chart.nativeElement, d2);
        //     count += 1;
        // }

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
    }

    drawData1()
    {
        if (this.currIdx + 1 > this.currPacket.length && this.dataStream.length === 0)
        {
            this.lastDrawTime = (new Date()).getTime() * 0.001;
            return;
        }

        this.lastBufferSize = this.getBufferSize();
        const currTime = (new Date()).getTime() * 0.001;

        if (this.onPlayLastDrawTime)
        {
            this.lastDrawTime = this.onPlayLastDrawTime;
        }

        let dT = 1;
        let cr = 10
        if (this.channel.sampleRate > 1)
        {
            dT = currTime - this.lastDrawTime;
            cr = (this.channel.sampleRate * 0.1) * this.pixelsPerSample

            if (this.lastBufferSize > 4.5 * this.channel.sampleRate)
            {
                // console.log('lastBufferSize -> 4.5');
                dT *= 1.5;
            }
            else if (this.lastBufferSize > 2.5 * this.channel.sampleRate)
            {
                // console.log('lastBufferSize -> 2.5');
                dT *= 1.10;
            }
            
        }

        const numPoints = Math.floor(dT * this.channel.sampleRate);

        this.lastDrawTime = currTime;
        
        this.graphContext.beginPath();
        this.graphContext.moveTo(this.lastTime, this.converToCanvasCoords(this.lastValue));

        let cTime = this.lastTime;
        let cY = this.lastValue;

        for (let i = 0; i < numPoints; i++)
        {
            if (this.currIdx + 1 > this.currPacket.length)
            {
                if (this.dataStream.length === 0)
                {
                    break;
                }

                this.currPacket = this.dataStream[0];
                this.currIdx = 0;
                this.dataStream.splice(0, 1);
            }

            cTime += this.pixelsPerSample;
            cY = this.currPacket[this.currIdx];
            this.currIdx++;

            this.graphContext.clearRect(cTime, 0, cr, this.plotHeight);
            // this.graphContext.clearRect(cTime, 0, 10, this.plotHeight);
            this.graphContext.strokeStyle = this.channel.strokeStyle;
            this.graphContext.lineCap = 'round';
            this.graphContext.lineJoin = 'round';
            this.graphContext.lineWidth = 2.0;
            this.graphContext.lineTo(cTime, this.converToCanvasCoords(cY));
            

            if (cTime > this.channel.width)
            {
                cTime = 0;
                this.graphContext.stroke();

                this.graphContext.clearRect(0, 0, cr, this.plotHeight);
                // this.graphContext.clearRect(0, 0, (this.channel.sampleRate * 0.1) * this.pixelsPerSample, this.plotHeight);

                this.graphContext.beginPath();
                this.graphContext.moveTo(cTime, this.converToCanvasCoords(cY));
            }

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

    findHeight()
    {
        let min: number = this.channel.yMin;
        let max: number = this.channel.yMax;

        if (this.channel.nonEcgGraphGrids && this.channel.defaultGrids)
        {
            min = (this.channel.hMin !== null && this.channel.hMin !== void 0) ? this.channel.hMin : -1.6;
            max = (this.channel.hMax !== null && this.channel.hMax !== void 0) ? this.channel.hMax : 1.6;
        }

        if (!this.channel.defaultGrids || (this.channel.nonEcgGraphGrids && this.channel.defaultGrids))
        {
            this.channel.height = this.gridsHelper.find_height(min, max, this.channel.duration, this.channel.sampleRate, this.plotWidth);
            this.graphHeight = this.channel.height;
            this.plotHeight = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];
            const dy = this.channel.yMax - this.channel.yMin;
            this.pixelsPerUnitY = this.plotHeight / dy;
            this.yZero = this.plotHeight + this.plotHeight / dy * this.channel.yMin;
            // console.log('height-> ', this.channel.height)
        }
    }
    
    resize() 
    {
        this.clearGraph();

        this.channel.width = this.chart.nativeElement.offsetWidth;
        this.graphWidth = this.channel.width;


        this.plotWidth = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.plotHeight = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];

        this.pixelsPerSample = this.plotWidth / this.channel.duration / this.channel.sampleRate;

        const dy = this.channel.yMax - this.channel.yMin;

        this.pixelsPerUnitX = this.plotWidth / this.channel.duration;
        this.pixelsPerUnitY = this.plotHeight / dy;

        this.yZero = this.plotHeight + this.plotHeight / dy * this.channel.yMin;

        // calculating height for ecg square grids
        this.findHeight();
        
        this.graphCanvas.width = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.graphCanvas.height = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];
        this.gridCanvas.width = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        this.gridCanvas.height = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];

        this.lastTime = 0;

        this.drawGrids();
    }

    _onBlur() 
    {
        this.clearGraph();
        this.isPaused = true;
    }

    _onFocus() 
    {
        this.dataStream = [];
        this.isPaused = false;
        this.lastTime = 0;
        this.clearGraph();
        this.drawGrids();
    }

    drawGrids() 
    {
        if (this.isDrawGrids)
        {
            if (!this.channel.defaultGrids)
            {
                let grids: any = this.gridsHelper._grids
                for (let key in grids)
                {
                    let conf: any = grids[key];
                    this.drawECGGRid(conf);
                }
            }
            else
            {
                this.drawGrid();
            }
        }
    }

    drawECGGRid(conf: any)
    {
        this.gridsHelper.draw_Vgrid(conf['grid'][0], conf['style'], conf['label'], this.channel, this.plotWidth, this.gridContext);      
        this.gridsHelper.draw_Hgrid(conf['grid'][1], conf['style'], conf['label'], this.channel, this.plotWidth, this.gridContext);
        
        // if (this.channel.drawRanges) 
        // {
        //     this.drawRanges();
        // }
        this.gridContext.stroke();

    }

    clearGraph() 
    {
        // console.log('clear react-> ', this.chart)
        // let inc: number = this.gridCanvas.width/this.channel.duration;
        // let count: number = 0;
        // for (let i = 0; i <= this.gridCanvas.width; i+=inc) 
        // {
        //     let id: string = 'x_label_' + count;

        //     let el = document.getElementById(id);
        //     el.remove();
        //     count += 1;
        // }

        let w = this.graphWidth - this.channel.margins[1] - this.channel.margins[3];
        let h = this.graphHeight - this.channel.margins[0] - this.channel.margins[2];

		this.graphContext.clearRect(0, 0, w, h);
        this.gridContext.clearRect(0, 0, w, h);
    }
    
    drawPoint() {
        let cY = this.lastTime
		// Arrow
		// this.context.beginPath();
		this.graphContext.moveTo(cY, 0);
		this.graphContext.lineTo(cY, 20);
		this.graphContext.moveTo(cY-10, 20-10);
		this.graphContext.lineTo(cY, 20);
		// this.context.strokeStyle="red";
		this.graphContext.closePath();
		this.graphContext.stroke();
		// this.context.lineTo(x+10, 10);
    }
    
    getBufferSize()
    {
        let s = this.currPacket.length - this.currIdx;

        for(let i=0; i<this.dataStream.length; i++)
        {
            s += this.dataStream[i].length;
        }

        const ac = {data: s, type: 'lastBufferSize'};
        this.signals.emit(ac);
        return s;
    }

    getDelay()
    {
        let delay: any = ((this.lastBufferSize / 256.0)).toFixed(1);

        if (parseFloat(delay) === 0.0 && this.isSessionBreak)
        {
            console.log('channel name session break=> ', this.channel.name);
            this.isSessionBreak = false;
            this.drawSessionStatus('red');
            if (this.isSessionReconnected)
            {
                this.isSessionReconnected = false;
                this.drawSessionStatus('green');
            }
        }

        return delay;
    }
}