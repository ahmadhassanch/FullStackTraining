import { Component } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { ElementRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { ViewChild } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { HostListener } from '@angular/core';


import * as dateFns from 'date-fns';
import { MatInput } from '@angular/material/input';


@Component({
    selector: 'cg-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CGCalendarComponent implements OnInit, AfterViewInit, OnChanges
{
    @Input() defaultDate: any;
    @Input() type: string;
    @Input() timeFormat: any;
    @Input() min: any;
    @Input() max: any;
    @Input() from: any;
    @Input() to: any;
    @Input() showTodayButton: boolean;
    @Input() compact = true;
    @Input() calendarType: string;
    @Input() isPanelOpened: boolean;


    @Output() dateChanged: EventEmitter<any> = new EventEmitter();
    @Output() dateCanceled: EventEmitter<any> = new EventEmitter();

    @ViewChild('calendar') calendar: ElementRef;
    @ViewChild('months') months: ElementRef;
    @ViewChild('time') time: ElementRef;

    @ViewChild('istHoursField', { read: ElementRef }) istHoursField: ElementRef<MatInput>;
    @ViewChild('secondHoursField', { read: ElementRef }) secondHoursField: ElementRef<MatInput>;

    @ViewChild('istMinutesField') istMinutesField: ElementRef<MatInput>;
    @ViewChild('secondMinutesField') secondMinutesField: ElementRef<MatInput>;


    @ViewChild('calendarView') calendarView: any;
    @ViewChild('monthsView') monthsView: any;
    @ViewChild('yearsView') yearsView: any;
    @ViewChild('timeView') timeView: any;

    currentView: string;
    myDate: Date;
    dateFocused: Date;


    // date for genrate years
    dateforcalender: Date;

    hours: any;
    minutes: any;

    dayNames: any;
    monthNames: any;

    public years: any;
    public dates: Date[];

    selectedDay: Date;
    selectedMonth: number;
    selectedYear: number;

    meridiem: string;
    count = 0;

    minutesSet: boolean;
    makeIstHourFieldFocused: boolean;
    backButtonCounts: number;

    constructor(private _changeDetectorRef: ChangeDetectorRef)
    {
        this.calendarType = 'Standard'
        this.currentView = 'calendar';
        this.timeFormat = '12';

        this.dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        this.monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];

        this.years = [];

        this.myDate = new Date();
        this.dateforcalender = new Date();
        this.hours = this.myDate.getHours();
        this.minutes = this.myDate.getMinutes();

        this.setZeroAtStart();
        
        this.meridiem = dateFns.format(this.myDate, 'a');

        this.onMinuteChange(this.minutes);
        this.onHourChange({ value: this.hours });
        this.type = 'datetime';

        this.from = null;
        this.to = null;
        this.showTodayButton = true;
        this.generateCalendar(this.myDate);
        this.defaultDate = null;
        this.isPanelOpened = false;
        this.minutesSet = false;
        this.makeIstHourFieldFocused = false;
        this.backButtonCounts = 0;
    }

    @HostListener('window:keydown', ['$event'])
    keyEvent(event: KeyboardEvent)
    {
        if (event.keyCode === 9)
        {
            if (this.secondMinutesField)
            {
                if (this.makeIstHourFieldFocused)
                {
                    if (this.istHoursField)
                    {
                        setTimeout(() => {
                            this.istHoursField.nativeElement.focus();
                        }, 10);
                    }
                }
            }
        }
    }

    ngOnInit()
    {
        if (this.min == null) {
            this.min = -5333122739;
        }

        if (this.max == null) {
            this.max = 7226618461;
        }

        if (this.defaultDate != null)
        {
            this.myDate = new Date(this.defaultDate * 1000);
            this.dateforcalender = new Date(this.defaultDate * 1000);
            this.hours = this.myDate.getHours();
            this.minutes = this.myDate.getMinutes();
            this.meridiem = dateFns.format(this.myDate, 'a');

            this.setZeroAtStart();

            this.isSelected(this.myDate);
            this.initialSelected(this.myDate);
        }

        // if (this.timeFormat === '24')
        // {
        //     this.timeFormat = '23';
        // }

        // if (this.timeFormat != null)
        // {
        //     this.timeLocal = this.timeFormat;
        // }

        this.onHourFormateChange(this.timeFormat);

        this.dateFocused = this.myDate;
    }

    ngAfterViewInit()
    {
        this._changeDetectorRef.detectChanges();

        if (this.istHoursField)
        {
            setTimeout( () => this.istHoursField.nativeElement.focus(), 500);
        }

        if (this.type === 'time')
        {
            this.currentView = 'time';

            setTimeout(() =>
            {
                if (this.timeView)
                {
                    this.timeView.nativeElement.focus();
                }
            }, 500);
        } else {
            setTimeout(() =>
            {
                this.calendarView.nativeElement.focus();
            }, 500);
        }
    }

    ngOnChanges(changes: SimpleChanges): void
    {
        if (this.isPanelOpened)
        {
            if (this.type === 'time')
            {
                if(this.calendarType === 'Standard')
                {
                    this.istHoursField.nativeElement.focus();
                }
            }
        }

        if (changes.defaultDate && this.defaultDate !== null)
        {
            this.myDate = new Date(this.defaultDate * 1000);
            this.dateFocused = this.myDate;
            this.hours = this.myDate.getHours();
            this.minutes = this.myDate.getMinutes();
            this.meridiem = dateFns.format(this.myDate, 'a');

            this.setZeroAtStart();

            this.onHourFormateChange(this.timeFormat);

            this.generateCalendar(this.myDate);
            if (this.type === 'time')
            {
                this.currentView = 'time';
                setTimeout(() =>
                {
                    if (this.timeView)
                    {
                        this.timeView.nativeElement.focus();
                    }
                }, 100);
            }
            else
            {
                // default value callback
                // this.sendSelectedEvent();
                this.currentView = 'calendar';
            }
        }
    }

    initialSelected(e: any)
    {
        if (e === null || e === '')
        {
            this.myDate = new Date();
        }
        else
        {
            this.myDate = new Date(e);
        }

        this.selectedDay = this.myDate;
        this.selectedMonth = this.myDate.getMonth();
        this.selectedYear = this.myDate.getFullYear();
        this.hours = this.myDate.getHours();
        this.minutes = this.myDate.getMinutes();

        this.onMinuteChange(this.minutes);
        this.onHourChange({ value: this.hours });
        // this.timeLocal = this.timeFormat;
        this.generateCalendar(this.myDate);
        if (this.type === 'time')
        {
            this.currentView = 'time';
            setTimeout(() =>
            {
                if (this.timeView)
                {
                    this.timeView.nativeElement.focus();
                }
            }, 100);
        }
        else
        {
            this.currentView = 'calendar';
        }

        this.Meridiem = this.meridiem;
    }

    sendSelectedEvent()
    {
        this.myDate.setSeconds(0);

        // if (this.timeFormat === '23')
        // {
        //     this.meridiem = dateFns.format(this.myDate, 'a');
        // }
        
        const selectedDate = this.myDate.getTime();
        this.initialSelected(selectedDate);

        this.onHourFormateChange(this.timeFormat);

        const dt = Math.floor(this.myDate.getTime() / 1000);
        const dict = { value: dt, escape: false, date: this.myDate, timeFormat: this.timeFormat === '12' ? this.timeFormat : null };

        this.dateChanged.emit(dict);
    }

    public previous(): void
    {
        if (this.currentView === 'years')
        {
            this.dateforcalender = dateFns.addYears(this.dateforcalender, -8);
            this.generateYears(this.dateforcalender);
        }
        else if (this.currentView === 'months')
        {
            this.dateFocused = dateFns.addYears(this.dateFocused, -1);
            this.selectedYear = this.dateFocused.getFullYear();
        }
        else if (this.currentView === 'calendar')
        {
            this.dateFocused = dateFns.addMonths(this.dateFocused, -1);
            this.selectedMonth = this.dateFocused.getMonth();
            this.generateCalendar(this.dateFocused);
        }
    }

    public next(): void
    {
        if (this.currentView === 'years')
        {
            this.dateforcalender = dateFns.addYears(this.dateforcalender, 8);
            this.generateYears(this.dateforcalender);
        }
        else if (this.currentView === 'months')
        {
            this.dateFocused = dateFns.addYears(this.dateFocused, 1);
            this.selectedYear = this.dateFocused.getFullYear();
        }
        else if (this.currentView === 'calendar')
        {
            this.dateFocused = dateFns.addMonths(this.dateFocused, 1);
            this.selectedMonth = this.dateFocused.getMonth();
            this.generateCalendar(this.dateFocused);
        }
    }

    public generateCalendar(date: Date): void
    {
        this.dates = [];
        const firstDate = dateFns.startOfMonth(date);
        const start = 0 - (dateFns.getDay(firstDate) + 7) % 7;
        const end = 41 + start; // iterator ending point

        for (let i = start; i <= end; i += 1)
        {
            const day = dateFns.addDays(firstDate, i);
            this.dates.push(day);
        }
    }

    public generateYears(date): void
    {
        this.years = [];
        const start = dateFns.getYear(date) - 7;
        const end = start + 15;
        for (let i = start; i < end; i += 1)
        {
            this.years.push(i);
        }
    }

    public selectDate(date: Date): void
    {
        if (date.getTime() < this.min * 1000 && this.min !== null)
        {
            if (date.getTime() > this.max * 1000 && this.max !== null)
            {
                return;
            }

            return;
        }
        if (date.getTime() > this.max * 1000 && this.max !== null)
        {
            return;
        }
        else
        {
            this.selectedDay = date;
            this.hours = this.myDate.getHours();
            this.minutes = this.myDate.getMinutes();
            this.myDate = date;
            if (this.type === 'date')
            {
                this.sendSelectedEvent();
            }
            else if (this.type === 'datetime')
            {
                this.currentView = 'time';
                this.myDate.setHours(this.hours);
                this.myDate.setMinutes(this.minutes);

                this.onHourFormateChange(this.timeFormat);

                setTimeout(() =>
                {
                    this.istHoursField.nativeElement.focus();
                }, 500);
            }
            else
            {
                this.myDate.setHours(this.hours);
                this.myDate.setMinutes(this.minutes);
                this.onHourChange({ value: this.hours });
                this.onMinuteChange(this.minutes);

                if (this.timeFormat === '12')
                {
                    this.hours = dateFns.format(this.myDate, 'hh');
                }

                this.currentView = 'time';
                setTimeout(() =>
                {
                    if (this.timeView)
                    {
                        this.timeView.nativeElement.focus();
                    }
                }, 100);
            }
        }

        if (this.minutes < 10)
        {
            this.minutes = '0' + this.minutes;
        }
    }

    public isSelected(day: Date): boolean
    {
        if (this.selectedDay == null)
        {
            return false;
        }

        const date = new Date(this.selectedDay);
        date.setHours(0, 0, 0, 0);

        if (day.getTime() === date.getTime() && dateFns.isSameMonth(day, this.myDate))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    public isDateDisabled(date): boolean
    {
        if (this.min !== null || this.max !== null)
        {
            const date1 = new Date(this.min * 1000);
            date1.setHours(0, 0, 0, 0);

            if (this.max !== null)
            {
                return (date.getTime() < date1.getTime() || date.getTime() > this.max * 1000);
            }

            return (date.getTime() < date1.getTime())
        }
    }

    public isInRange(date)
    {
        if (this.from != null && this.to != null)
        {
            const from = new Date(this.from * 1000);
            from.setHours(0, 0, 0, 0);
            const to = new Date(this.to * 1000);
            to.setHours(0, 0, 0, 0);

            if (date.getTime() >= from.getTime() && date.getTime() <= to.getTime())
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }

    }

    public isFrom(date)
    {
        if (this.from != null)
        {
            const from = new Date(this.from * 1000);
            from.setHours(0, 0, 0, 0);
            if (date.getTime() === from.getTime())
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }

    public isTo(date)
    {
        if (this.to != null)
        {
            const to = new Date(this.to * 1000);
            to.setHours(0, 0, 0, 0);
            if (date.getTime() === to.getTime())
            {
                return true;
            }
            else
            {
                return false;
            }
        }
        else
        {
            return false;
        }
    }

    public isCurrent(day: Date): boolean
    {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        if (day.getTime() === date.getTime() && dateFns.isSameMonth(day, this.myDate))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    public isFocused(day: Date): boolean
    {
        const date = new Date(this.dateFocused);
        date.setHours(0, 0, 0, 0);

        day.setHours(0, 0, 0, 0);

        if (day.getTime() === date.getTime() && dateFns.isSameMonth(day, this.dateFocused))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    public onClickMonthButton(event)
    {
        event.preventDefault();
        this.dateFocused = this.myDate;
        this.currentView = 'months';
        setTimeout(() =>
        {
            this.monthsView.nativeElement.focus();
        }, 100);
    }

    public onClickDayButton(event)
    {
        event.preventDefault();
        this.dateFocused = this.myDate;
        this.generateCalendar(this.dateFocused);
        this.currentView = 'calendar';
        setTimeout(() =>
        {
            this.calendarView.nativeElement.focus();
        }, 100);
    }

    public onClickYearButton(event)
    {
        event.preventDefault();
        this.dateFocused = this.myDate;
        this.dateforcalender = this.myDate;
        this.generateYears(this.dateforcalender);
        this.currentView = 'years';

        setTimeout(() =>
        {
            this.yearsView.nativeElement.focus();
        }, 100);
    }

    public onClickTimeButton(event)
    {
        event.preventDefault();
        this.dateFocused = this.myDate;
        this.currentView = 'time';
        setTimeout(() =>
        {
            if (this.timeView)
            {
                this.timeView.nativeElement.focus();
            }
        }, 100);
    }

    public onMonthSelected(month: number)
    {
        this.selectedMonth = month;
        this.myDate = dateFns.setMonth(this.myDate, month);
        this.generateCalendar(this.myDate);
        this.currentView = 'calendar';

        setTimeout(() =>
        {
            this.calendarView.nativeElement.focus();
        }, 100);

        this.dateFocused = this.myDate ;
    }

    public onYearSelected(year: any)
    {
        this.selectedYear = year;
        this.myDate = dateFns.setYear(this.myDate, parseInt(year, 10));

        this.generateCalendar(this.myDate);
        this.currentView = 'months';

        setTimeout(() =>
        {
            this.monthsView.nativeElement.focus();
        }, 100);

        this.dateFocused = this.myDate;
    }

    onTimeSelected(e: any)
    {
        e.stopPropagation();
        this.sendSelectedEvent();
    }


    onHourChange(event): void
    {
        this.hours = event.value;

        if (this.hours < 10)
        {
            this.hours = '0' + this.hours.toString();
        }

        this.myDate.setHours(this.hours);
    }

    setHours()
    {
        this.hours = parseInt(this.istHoursField.nativeElement.value + this.secondHoursField.nativeElement.value, 10);
        if (this.hours < 10)
        {
            this.hours = '0' + this.hours.toString();
        }
        this.myDate.setHours(this.hours);
    }

    setMinutes()
    {
        this.minutes = parseInt(this.istMinutesField.nativeElement.value + this.secondMinutesField.nativeElement.value, 10);

        if (this.minutes < 10)
        {
            this.minutes = '0' + this.minutes.toString();
        }

        this.myDate.setMinutes(this.minutes);
    }

    onHourInputChange(event, type?: string): void
    {
        if (this.istHoursField)
        {
            if (event.value === '')
            {
                return;
            }

            this.setHours();

            if (type === 'istHour')
            {
                if (this.timeFormat === '12')
                {
                    if (parseInt(this.istHoursField.nativeElement.value, 10) === 1 && parseInt(this.secondHoursField.nativeElement.value, 10) > 2)
                    {
                        this.secondHoursField.nativeElement.value = '2';
                    }
                }
                else
                {
                    if (parseInt(this.istHoursField.nativeElement.value, 10) === 2 && parseInt(this.secondHoursField.nativeElement.value, 10) > 3)
                    {
                        this.secondHoursField.nativeElement.value = '3';
                    }
                }

                this.secondHoursField.nativeElement.focus();
            }
            else if (type === 'secondHour')
            {
                this.istMinutesField.nativeElement.focus();
            }
        }
    }

    onMinuteChange(value: any, type?: string): void
    {
        if (this.istMinutesField)
        {
            if (value === '')
            {
                return;
            }

            this.setMinutes();

            if (type === 'istMinute')
            {
                this.secondMinutesField.nativeElement.focus();
            }
        }
    }

    onChangeMeridiem(): void
    {
        this.meridiem = this.meridiem.toLowerCase() === 'am' ? 'pm':'am'
    }

    set Meridiem(value: any)
    {
        let v = dateFns.format(this.myDate, 'yyyy-MM-dd hh:mm:ss');
        v = v + ' ' + value;

        this.myDate = new Date(v);
    }

    onHourFormateChange(event: any)
    {
        this.Meridiem = this.meridiem;

        if (event === '12')
        {
            this.hours = dateFns.format(this.myDate, 'hh');
        }
        else
        {
            this.hours = dateFns.format(this.myDate, 'HH');
        }

        if (this.istHoursField)
        {
            this.istHoursField.nativeElement.focus();
        }
    }

    selectToday()
    {
        this.myDate = new Date();
        this.hours = this.myDate.getHours();
        this.minutes = this.myDate.getMinutes();
        this.onMinuteChange(this.minutes);
        this.onHourChange({ value: this.hours });

        this.generateCalendar(this.myDate);
        if (this.type !== 'date')
        {
            this.currentView = 'time';
            setTimeout(() =>
            {
                if (this.timeView)
                {
                    this.timeView.nativeElement.focus();
                }
            }, 100);
        }
        else
        {
            if (this.type !== 'date')
            {
                this.sendSelectedEvent();
            }
        }
    }

    setCenter(date: Date): boolean
    {
        return date.getDate() >= 10;
    }

    incraseTime(type: string)
    {
        if (type === 'hours')
        {

            if(this.timeFormat !== '12'){
                if(this.hours >= 12) {
                    this.meridiem = 'pm';
                }
                else {
                    this.meridiem = 'am';
                }
            }
            if (dateFns.format(this.myDate, 'a') === 'pm' && this.timeFormat === '12')
            {
                this.hours = parseInt(this.hours, 10) + 1;

                if (this.hours < 10)
                {
                    this.hours = '0' + this.hours.toString();
                }

                this.myDate.setHours(this.hours + 12);
            }
            else
            {
                this.hours = parseInt(this.hours, 10) + 1;

                if (this.hours < 10)
                {
                    this.hours = '0' + this.hours.toString();
                }

                this.myDate.setHours(this.hours);
            }
        }
        else
        {
            this.minutes = parseInt(this.minutes, 10) + 1;

            if (this.minutes < 10)
            {
                this.minutes = '0' + this.minutes.toString();
            }
            this.myDate.setMinutes(this.minutes);
        }
    }

    decreaseTime(type: string)
    {
        if (type === 'hours')
        {
            if(this.timeFormat !== '12'){
                if(this.hours >= 12){
                    this.meridiem = 'pm';
                }
                else {
                    this.meridiem = 'am';
                }
            }
            if (dateFns.format(this.myDate, 'a') === 'pm' && this.timeFormat === '12')
            {
                this.hours = parseInt(this.hours, 10) - 1;

                if (this.hours < 10)
                {
                    this.hours = '0' + this.hours.toString();
                }

                this.myDate.setHours(this.hours + 12);
            }
            else
            {
                this.hours = parseInt(this.hours, 10) - 1;

                if (this.hours < 10)
                {
                    this.hours = '0' + this.hours.toString();
                }

                this.myDate.setHours(this.hours);
            }
        }
        else
        {
            this.minutes = parseInt(this.minutes, 10) - 1;

            if (this.minutes < 10)
            {
                this.minutes = '0' + this.minutes.toString();
            }
            this.myDate.setMinutes(this.minutes);
        }
    }

    onHourFieldFocus(event: any)
    {
        event.target.select();
        this.makeIstHourFieldFocused = false;
    }

    onBlur(type: string)
    {
        if (type === 'istHour' && this.istHoursField.nativeElement.value === '')
        {
            this.istHoursField.nativeElement.value = '0';

            this.setHours();
        }
        else if (type === 'secondHour' && this.secondHoursField.nativeElement.value === '')
        {
            if (this.timeFormat === '12')
            {
                this.istHoursField.nativeElement.value = '1';
                this.secondHoursField.nativeElement.value = '2';
            }
            else
            {
                this.secondMinutesField.nativeElement.value = '0';
            }
            this.setHours();
        }
        else if (type === 'istMinute' && this.istMinutesField.nativeElement.value === '')
        {
            this.istMinutesField.nativeElement.value = '0';
            this.setMinutes();
        }
        else if (type === 'secondMinute' && this.secondMinutesField.nativeElement.value === '')
        {
            this.secondMinutesField.nativeElement.value = '0';
            this.setMinutes();
        }
    }

    onMinuteFieldFocus(event: any, type: string)
    {
        event.target.select();

        if (type === 'secondMinute')
        {
            this.makeIstHourFieldFocused = true;
        }
    }

    validateTime(event: any, value: any, section: string, type: string)
    {
        const checkForOnlyNumbers: RegExp = new RegExp(/^[0-9]+(\.[0-9]){0,1}$/g);
        if (String(event.key).trim().match(checkForOnlyNumbers) || (event.keyCode>34 && event.keyCode <41) || event.keyCode === 8 || event.keyCode === 9)
        {
            // Move Backward on Back Button;
            if (event.keyCode === 8)
            {
                if (type === 'secondMinute' && this.secondMinutesField.nativeElement.value === '')
                {
                    this.secondMinutesField.nativeElement.value = '0';
                    this.istMinutesField.nativeElement.focus();
                }
                else if (type === 'istMinute' && this.istMinutesField.nativeElement.value === '')
                {
                    this.istMinutesField.nativeElement.value = '0';
                    this.secondHoursField.nativeElement.focus();
                }
                else if (type === 'secondHour' && this.secondHoursField.nativeElement.value === '')
                {
                    if (this.timeFormat === '12')
                    {
                        this.secondHoursField.nativeElement.value = '2';
                        this.istHoursField.nativeElement.focus();
                    }
                    else
                    {
                        this.secondHoursField.nativeElement.value = '0';
                        this.istHoursField.nativeElement.focus();
                    }
                }
            }

            // Tab, Backspace, ArrowKeys are allowed.
            if (!((event.keyCode>34 && event.keyCode <41) || event.keyCode === 8 || event.keyCode === 9))
            {
                if (section === 'hours')
                {
                    if (this.timeFormat === '12')
                    {
                        if (type === 'istHour' && parseInt(event.key, 10) > 1)
                        {
                            this.preventEvent();
                        }
                        else {
                            if (parseInt(this.istHoursField.nativeElement.value, 10) === 1 && parseInt(event.key, 10) > 2)
                            {
                                this.preventEvent();
                            }
                            else if (parseInt(this.istHoursField.nativeElement.value, 10) === 0 && parseInt(event.key, 10) === 0 && type === 'secondHour')
                            {
                                this.preventEvent();
                            }
                        }
                    }
                    else
                    {
                        if (type === 'istHour' && parseInt(event.key, 10) > 2)
                        {
                            this.preventEvent();
                        }
                        else
                        {
                            if (parseInt(this.istHoursField.nativeElement.value, 10) === 2 && parseInt(event.key, 10) > 3)
                            {
                                this.preventEvent();
                            }
                        }
                    }
                }
                else
                {
                    if (type === 'istMinute' && parseInt(event.key, 10) > 5)
                    {
                        this.preventEvent();
                    }
                    else {
                        // do secondHour field work;
                    }
                }
            }
        }
        else
        {
            this.preventEvent();
        }
    }

   insertValueInString(str, index, value)
   {
        return str.substr(0, index) + value + str.substr(index);
   }

    setMinutesFieldValue(event: KeyboardEvent)
    {
        this.setZeroAtStart();
        this.istMinutesField.nativeElement.focus();
        this.minutesSet = true;
    }

    onHourEnterPress(ev: KeyboardEvent)
    {
        ev.stopPropagation();
        this.istMinutesField.nativeElement.focus();
    }

    preventEvent()
    {
        event.preventDefault();
        return;
    }

    onCancel()
    {
        this.dateCanceled.emit();
    }

    setZeroAtStart()
    {
        if (this.hours < 10)
        {
            this.hours = '0' + this.hours;
        }

        if (this.minutes < 10)
        {
            this.minutes = '0' + this.minutes;
        }
    }
}
