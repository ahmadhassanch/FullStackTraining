import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Output } from '@angular/core';
import { ViewChild } from '@angular/core';
import { HostBinding } from '@angular/core';
import { Optional } from '@angular/core';
import { Self } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect } from '@angular/material/select';
import { MatFormFieldControl } from '@angular/material/form-field';

import { NgControl } from '@angular/forms';

import {coerceBooleanProperty} from '@angular/cdk/coercion';

import { Subject } from 'rxjs';
import { ApiService, ChiConfigService } from '../../../services';
import { GenericApiResponse } from '../../../models';
import { FormField, FormConfig, WhereData } from '../../../models/general-models';
import { RVAlertsService } from '../../alerts';
import { GeneralFormDialogComponent } from '../../general/general-form-dialog/general-form-dialog';


@Component({
    selector: 'chi-select',
    templateUrl: './picker.html',
    styleUrls: ['./picker.scss'],
    providers: [
        ApiService,
        {provide: MatFormFieldControl, useExisting: ForeignPickerComponent}
    ]
})
export class ForeignPickerComponent implements OnInit, MatFormFieldControl<string>, OnDestroy, OnChanges
{

    constructor(
        private apiService: ApiService,
        private _cd: ChangeDetectorRef,
        private configService: ChiConfigService,
        private dialog: MatDialog,
        @Optional() @Self() public ngControl: NgControl
        )
    {
        this.where = null;
        this.selectedOption = null;

        this.apiInitiated = false;
    }

    get value(): string | null
    {
        return this.mySelect.value;
    }
    set value(val: string | null)
    {
        this.mySelect.value = val;
        this.stateChanges.next();
    }

    get placeholder()
    {
        if (this.field === void 0) {
            return '';
        }

        return this.field.placeholder;
    }

    get focused()
    {
        return this.mySelect.focused;
    }

    get empty()
    {
        return this.mySelect.empty;
    }

    @HostBinding('class.floating')
    get shouldLabelFloat()
    {
        return this.focused || !this.empty;
    }

    get required()
    {
        if (this.field === void 0) {
            return false;
        }

        return this.field.required;
    }

    @Input()
    get disabled() {
        return this.field.formControl.disabled;
        // return this._disabled;
        // return true;
    }
    set disabled(dis) {
        this._disabled = coerceBooleanProperty(dis);
        // this.field.formControl.disabled = this._disabled;

        // if (this.focused)
        // {
        //     this.mySelect.focused = false;
        //     this.stateChanges.next();
        // }

        // this.mySelect.disabled = this._disabled;

        this.stateChanges.next();
    }


    get errorState()
    {
        // if (this.mySelect === void 0)
        //     return false;

        return this.mySelect.errorState;
    }


    get displayValue()
    {
        if (this.selectedOption != null)
        {
            return this.selectedOption[this.displayKey];
        }

        return null;
    }

    get displayMulValue()
    {
        if (this.selectedOption != null)
        {
            if (this.field.foreign.mode === 'double')
                return "(" + this.selectedOption[this.field.foreign.columns[1]] + ")";
            else if (this.field.foreign.mode === 'triple')
                return this.selectedOption[this.field.foreign.columns[1]] + " - " + this.selectedOption[this.field.foreign.columns[2]];
        }

        return null;
    }
    static nextId = 0;
    _previousValue: any;

    @Input() field: FormField;
    @Input() config: FormConfig;
    @Input() where: WhereData;
    @Input() tabindex:any;

    @Output() selected: EventEmitter<any> = new EventEmitter<any>();
    @Output() changeSelection: EventEmitter<any> = new EventEmitter<any>();
    @Output() signals: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(MatSelect) mySelect: MatSelect;

    stateChanges = new Subject<void>();
    selectedOption: any;
    displayKey: string;
    apiInitiated: boolean;

    @HostBinding()
    id = `chi-select-${ForeignPickerComponent.nextId++}`;
    private _disabled = false;

    controlType = 'chi-select';

    autofilled?: boolean;

    @HostBinding('attr.aria-describedby') describedBy = '';

    ngOnInit()
    {
        if (this.field.disable)
        {
            this.field.formControl.disable();
        }
        this.apiService.apiSlug = this.field.foreign.foreign_table;
        this.apiService.primaryKey = this.field.foreign.foreign_column;
        this.displayKey = this.field.foreign.columns[0];

        if (this.field.foreign.where !== void 0) {
            this.where = this.field.foreign.where;
        }

        this.field.formControl.statusChanges.subscribe(s =>
        {
            this.stateChanges.next();
        });

        if (this.field.value != null) {
            this.loadSelectedData(this.field.value);
        }

        this.field.formControl.registerOnChange((e: any) =>
        {
            if (e != null)
            {
                this.loadSelectedData(e);
            }
        });

        if (this.field.value == null && this.field.foreign.loadDefault)
        {
            setTimeout(() =>
            {
                this.loadSelectedData(null);
            }, 100);
        }

        this._cd.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges)
    {
        if (changes.disabled)
        {
            this.stateChanges.next();
        }

        if (this.where != null && changes.where)
        {
            this.loadForeignData('');
        }

        // this.mySelect.updateErrorState();

        // const newValue = this.field.formControl.value;
        // if (this._previousValue !== newValue)
        // {
        //     this._previousValue = newValue;
        //     this.stateChanges.next();
        // }

        // if (this.ngControl)
        // {
        //     this.updateErrorState();
        // }

        // this._dirtyCheckNativeValue();
    }

    ngOnDestroy()
    {
        this.stateChanges.complete();
    }

    setDescribedByIds(ids: string[])
    {
        this.describedBy = ids.join(' ');
    }

    onContainerClick(event: MouseEvent)
    {
        this.mySelect.open();
    }


    // ControlValueAccessor
    writeValue(obj: any): void
    {
        // console.log('writeValue => ', obj);
    }

    registerOnChange(fn: any): void
    {
        // console.log('registerOnChange => ', fn);
    }

    registerOnTouched(fn: any): void
    {
        // console.log('registerOnTouched => ', fn);
    }

    setDisabledState?(isDisabled: boolean): void
    {
        // console.log('setDisabledState => ', isDisabled);
    }

    // \ControlValueAccessor
    // errorState: boolean = false;

    updateErrorState()
    {

        this.mySelect.updateErrorState();
        // const oldState = this.errorState;
        // const parent = this._parentFormGroup || this._parentForm;
        // const matcher = this._defaultErrorStateMatcher;
        // const control = this.ngControl ? this.ngControl.control as FormControl : null;
        // const newState = matcher.isErrorState(control, parent);

        // if (newState !== oldState)
        // {
        //   this.errorState = newState;
          this.stateChanges.next();
        // }
    }

    onSelect(ev: MatOptionSelectionChange, data: any): void
    {
        if (!ev.isUserInput)
        {
            return;
        }

        // console.log("onSelect->", ev, data);
        // this.setValue(data.id, data);

        // if value chagnes then call this
        if (data == null || this.field.value !== data.id)
        {
            this.changeSelection.emit({new: data, old: this.selectedOption});
        }

        if (data != null)
        {
            this.selectedOption = data;
            this.field.value = data.id;
            this.selected.emit(data);
        }
        else
        {
            this.selectedOption = null;
            this.field.value = null;
        }
    }

    foreignOpenedChange(opened: boolean, search: string)
    {
        this.signals.emit({type: 'RVSelectOpened'});
        if (opened)
        {
            this.loadForeignData(search);
        }

        this.stateChanges.next();
    }

    searchRecords(search: string)
    {
        if(search !== '')
        {
            this.loadForeignData(search);
            this.stateChanges.next();
        }
        else
        {
            this.loadForeignData(search);
        }
    }

    advanceSearch(ev: any)
    {
        const e = {
            type: 'AdvanceSearch'
        }

        this.signals.emit(e);
    }

    loadSelectedData(val: any)
    {
        if (this.apiInitiated)
        {
            return;
        }

        this.apiInitiated = true;
        const payload: any = {
            columns: this.field.foreign.columns,
            slug: this.field.foreign.foreign_table,
            // where: new WhereData({column: this.field.foreign.foreign_column, search: val})
        };

        if (val)
        {
            payload.where = new WhereData({column: this.field.foreign.foreign_column, search: val});
        }
        // else if (this.where)
        // {
        //     payload.where = this.where;
        // }

        if (this.field.foreign.query_params) {
            for (const key in this.field.foreign.query_params) {
                payload[key] = this.field.foreign.query_params[key];
            }
        }

        this.field.loading = true;

        this.apiService.getSelectOptions(payload).then((response: GenericApiResponse) =>
        {
            this.field.loading = false;

            this.field.options = response.data;
            this.selectedOption = response.data[0];
            this._cd.detectChanges();

            if (this.field.value == null && this.field.foreign.loadDefault && this.selectedOption)
            {
                this.field.value = this.selectedOption[this.field.name];
            }

            setTimeout(() =>
            {
                this.apiInitiated = false;
            }, 1000);
        }).catch( (error: any) =>
        {
            this.apiInitiated = false;
            this.field.loading = false;
            console.log('Error loading foreign data', error);
        });
    }

    loadForeignData(search: string): void
    {
        if (this.apiInitiated)
        {
            return;
        }

        this.apiInitiated = true;
        const payload = {
            columns: this.field.foreign.columns,
            slug: this.field.foreign.foreign_table,
            search: null,
            where: void 0,
            limit: void 0
        };

        if (search !== '')
        {
            payload.search = search;
        }

        if(this.where != null)
        {
            let whr = this.where;
            if (this.field.value != null) {
                const where = {group: 'or', children: [
                    this.where,
                    {column: this.field.foreign.foreign_column, search: this.field.value, op: 'eq'}
                ]};
                whr = where;
            }
            payload.where = whr;
        }

        if (this.field.foreign.query_params) {
            for (const key in this.field.foreign.query_params) {
                payload[key] = this.field.foreign.query_params[key];
            }
        }

        payload.limit = this.field.foreign.limit;

        this.field.loading = true;
        this.apiService.getSelectOptions(payload).then((response: GenericApiResponse) =>
        {
            this.field.options = response.data;
            this.field.loading = false;

            this.apiInitiated = false;
        }).catch((error: GenericApiResponse) =>
        {
            this.field.loading = false;
            this.apiInitiated = false;
            console.log('Error loading foreign data', error);
        });
    }

    onAdd(ev: MatOptionSelectionChange): void
    {
        if (!ev.isUserInput)
        {
            // console.log('Not User Input, Going back');
            return;
        }

        // console.log('Show Add Dialog');

        // this.field.foreign.component

        if (this.field.foreign.component != null)
        {
            const ref = this.dialog.open(this.field.foreign.component, this.field.foreign.dialogConfig);

            ref.afterClosed().subscribe((result: any) =>
            {
                this.loadForeignData(null);
            });
        }
        else if (this.field.foreign.configName != null)
        {
            // const config = this.configService.getController(this.field.foreign.configName);
            const config = this.configService.getUserData(this.field.foreign.configName);
            const ref = this.dialog.open(GeneralFormDialogComponent, this.field.foreign.dialogConfig);

            ref.componentInstance.config = config;

            ref.afterClosed().subscribe((result: any) =>
            {
                this.loadForeignData(null);
            });

            // RVAlertsService.error('Will open general', '...');
        }
        else
        {
            RVAlertsService.error('Error Opening Form', 'Please provide valid parameters');
        }
    }
}
