import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ViewChild } from '@angular/core';
import { ViewRef } from '@angular/core';
import { Self } from '@angular/core';
import { Optional } from '@angular/core';
import { HostBinding } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { MatInput } from '@angular/material/input';
import { MatFormFieldControl } from '@angular/material/form-field';
import { NgControl } from '@angular/forms';

import {coerceBooleanProperty} from '@angular/cdk/coercion';
import { Subject } from 'rxjs';

import { ChiPanelComponent } from '../panel/panel.component';

import { FormField } from '../../../models/general-models';
import { FORMATS } from '../../general/formats';



@Component({
    selector: 'chi-date-picker',
    templateUrl: './picker.html',
    styleUrls: ['./picker.scss'],
    providers: [
        {provide: MatFormFieldControl, useExisting: DatePickerComponent}
    ]
})
export class DatePickerComponent implements OnInit, OnDestroy, OnChanges, MatFormFieldControl<string> 
{
    static nextId = 0;

    @Input() defaultDate: any;
    @Input() min: any;
    @Input() max: any;
    @Input() type: string;
    @Input() showTodayButton = false;
    @Input() compact = false;

    @Input() field: FormField = null;

    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('datePanel') datePanel: ChiPanelComponent;
    @ViewChild(MatInput) myInput: MatInput;


    stateChanges = new Subject<void>();
    selectedOption: any;

    constructor(private _cd: ChangeDetectorRef, @Optional() @Self() public ngControl: NgControl)
    {
        this.defaultDate = null;
    }

    ngOnInit()
    {
        if (this.min == null)
        {
            this.min = -5333122739;
        }

        if (this.max == null)
        {
            this.max = 7226618461;
        }

        if (this.type === void 0 || this.type === '')
        {
            this.type = 'date';
        }

        if (this.field.value != null) {
            this.defaultDate = this.field.value;
        }

        this._cd.detectChanges();

        this.field.formControl.statusChanges.subscribe(s =>
        {
            this.stateChanges.next();
        });

        this.field.formControl.registerOnChange((e: any) =>
        {
            // console.log('comes here', e);
            this.defaultDate = e;

            if (this._cd && !(this._cd as ViewRef).destroyed) {
                this._cd.detectChanges();
            }
        });
    }

    get formatDate() {
        return FORMATS.date(this.field.value);
    }

    _previousValue: any;

//     ngDoCheck()
//     {
//         this.myInput.updateErrorState();

//         const newValue = this.field.formControl.value;
//         if (this._previousValue !== newValue)
//         {
//             this._previousValue = newValue;
//             this.stateChanges.next();
//         }
//    }

    ngOnChanges(changes: SimpleChanges)
    {
        if (changes.disabled)
        {
            this.stateChanges.next();
        }
    }

    ngOnDestroy()
    {
        this.stateChanges.complete();
        this._cd.detach();
    }

    get value(): string | null
    {
        return this.myInput.value;
    }

    set value(val: string | null)
    {
        this.myInput.value = val;
        this.stateChanges.next();
    }

    @HostBinding()
    id = `chi-date-picker-${DatePickerComponent.nextId++}`;

    get placeholder()
    {
        if (this.field === void 0)
            return '';

        return this.field.placeholder;
    }

    get focused()
    {
        return this.myInput.focused;
    }

    get empty()
    {
        return this.myInput.empty;
    }

    @HostBinding('class.floating')
    get shouldLabelFloat()
    {
        // return true;
        return this.focused || !this.empty;
    }

    get required()
    {
        if (this.field === void 0)
            return false;

        return this.field.required;
    }

    @Input()
    get disabled()
    {
        return this.field.formControl.disabled;
    }

    set disabled(dis)
    {
        this._disabled = coerceBooleanProperty(dis);
        this.stateChanges.next();
    }
    private _disabled = false;


    get errorState()
    {
        return this.myInput.errorState;
    }

    @HostBinding('attr.aria-describedby') describedBy = '';

    setDescribedByIds(ids: string[])
    {
        this.describedBy = ids.join(' ');
    }

    onContainerClick(event: MouseEvent)
    {
        console.log('-- Container Clicked --');
    }

    updateErrorState()
    {
        this.myInput.updateErrorState();
        this.stateChanges.next();
    }

    selectDate(e: any): void
    {
        // console.log('-- Send By Calender --> ', e);

        if (e != null && e.value)
        {
            this.field.value = e.value;
            this.selected.emit(e.value);
        }

        this.datePanel.closePanel();
    }

    onResetDate()
    {
        this.field.value = null;
        this.selected.emit(null);
    }
}