import { Component } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Input } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Output } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormControl } from '@angular/forms';


import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { Subject } from 'rxjs';

import * as dateFns from 'date-fns';
import { ApiService } from '../../../services';
import { GenericApiResponse } from '../../../models';
import { ChiPanelComponent } from '../../controls/panel/panel.component';
import { TableColumn, TableConfig, WhereData, FilterDropDownModel, FormField } from '../../../models/general-models';

@Component({
    selector: 'table-filter',
    templateUrl: './table-filter.component.html',
    styleUrls: ['./table-filter.component.scss'],
    providers: [ApiService]
})
export class DataTableFilterComponent implements OnInit, OnDestroy
{
    theForm: FormGroup;
    @Input() column: TableColumn;
    @Input() dataService: Subject<any>;
    @Input() config: TableConfig;
    @Input() where: WhereData;
    @Input() showSearch: boolean;
    @Input() selectedValues: string[];

    @ViewChild('tableFilterPanel') chiPanel: ChiPanelComponent;

    searchControl: FormControl;

    @Output() signals = new EventEmitter<any>();


    sortOrder: string;

    isSelected: boolean;
    isCleared: boolean;
    selectedCount: number;
    loading: boolean;

    filterList: FilterDropDownModel[];
    SelectedfilterList: FilterDropDownModel[];

    panelEvents: Subject<any>;

    // DateRange Filter
    from: FormField;
    to: FormField;
    isDateRangeFilterApplied: boolean;
    // tslint:disable-next-line:variable-name
    max_date: any;

    constructor(private _apiService: ApiService, private formBuilder: FormBuilder, private _cd: ChangeDetectorRef)
    {
        this.theForm = this.formBuilder.group({});
        this.selectedCount = 0;

        this.filterList = [];
        this.SelectedfilterList = [];
        this.selectedValues = [];
        this.showSearch = true;
        this.loading = false;

        this.sortOrder = null;
        this.panelEvents = new Subject<any>();
        this.searchControl = new FormControl('');

        this.panelEvents.subscribe((e: any) =>
        {
            if (e === 'opened')
            {
                this.loadFilterData();
            }
        });

        this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(query =>
        {
            this.loadFilterData();
        });

        // DateRange Filter
        this.from = new FormField({ name: 'from', title: 'Date', type: 'date'});
        this.to = new FormField({ name: 'to', title: 'Date', type: 'date'});

        this.isDateRangeFilterApplied = false;
        this.max_date = Math.floor(dateFns.startOfDay(dateFns.addDays(new Date(), 0)).getTime() / 1000);
    }

    ngOnInit(): void
    {
        this._apiService.apiSlug = this.config.slug;
        this._apiService.primaryKey = this.config.key;

        this.theForm.addControl('from', this.from.formControl);
        this.theForm.addControl('to', this.to.formControl);
    }

    ngOnDestroy()
    {
        this.panelEvents.complete();
        this._cd.detach();
    }

    onSortOrder()
    {
        if (this.sortOrder == null)
        {
            this.sortOrder = 'ASC';
        }
        else if (this.sortOrder === 'ASC')
        {
            this.sortOrder = 'DESC';
        }
        else
        {
            this.sortOrder = null;
        }

        const d = { type: 'SortUpdated', data: { active: this.column.name, direction: this.sortOrder }, resetOffset: true };
        this.signals.emit(d);
    }

    onFilterSelectAll(event)
    {
        if (this.column.filterType === 'Standard')
        {
            event.preventDefault();
            this.selectedCount = 0;

            for (const opt of this.filterList)
            {
                opt.selected = true;
                this.selectedCount++;
            }

            this.isSelected = true;
            this.isCleared = false;
        }
    }

    onFilterClearAll(event)
    {
        if (event != null)
        {
            event.preventDefault();
        }

        if (this.column.filterType === 'DateRange')
        {
            this.fromVal = null;
            this.toVal = null;

            this._cd.detectChanges();
        }

        for (const opt of this.filterList)
        {
            opt.selected = false;
        }

        this.isSelected = false;
        this.isCleared = true;
        this.selectedCount = 0;
    }

    onFilterCheckToggle(opt: FilterDropDownModel)
    {
        this.selectedCount = 0;

        for (const key of this.filterList)
        {
            if (key.selected === true)
            {
                this.selectedCount++;
            }
        }

        if (this.filterList.length === this.selectedCount)
        {
            this.isSelected = true;
            this.isCleared = false;
        }
        else if (this.selectedCount > 0 && this.selectedCount < this.filterList.length)
        {
            this.isSelected = false;
            this.isCleared = false;
        }
        else if (this.selectedCount === 0)
        {
            this.isSelected = false;
            this.isCleared = true;
        }
    }

    loadFilterData()
    {
        const payload = {
            columns: [ this.config.columns ],
            column: this.column.name,
            search: null,
            where: void 0,
            limit: void 0
        };

        if(this.showSearch && this.searchControl.value.length > 1)
        {
            payload.search = this.searchControl.value;
        }

        if(this.selectedValues.length > 0)
        {
            this.where = { column: this.column.name, op: 'ne', search: this.selectedValues };
            payload.where = this.where;
        }

        payload.limit = 20;

        this.loading = true;

        this._apiService.getFilterOptions(payload).then((response: GenericApiResponse) =>
        {
            if (response.Status === 'Ok')
            {
                this.loadData(response.data);
            }

            this.loading = false;

        }, (error: any) =>
        {
            console.log('Error loading data', error.toString());
        });
    }

    loadData(data: any): void
    {
        this.filterList = [];
        if (this.SelectedfilterList.length > 0) {
            this.filterList = JSON.parse(JSON.stringify(this.SelectedfilterList));
        }

        for (const item of data) {
            this.filterList.push(item);
        }

        this.selectedCount = 0;
        for (const m of this.filterList) {
            if (this.selectedValues.includes(m.value)) {
                m.selected = true;
                this.selectedCount++;
            }
        }

        this.onFilterCheckToggle(null);
    }

    onClearSearch()
    {
        this.searchControl.setValue('');
        // this.loadFilterData();
    }

    onResetFilter()
    {
        // this.fromVal = null;
        // this.toVal = null;

        // this._cd.detectChanges();

        if (this.to == null && this.from == null)
        {
            this.isDateRangeFilterApplied = false;
        }
        this.selectedCount = 0;
        this.chiPanel.closePanel();
    }

    onApplyFilters()
    {
        this.isDateRangeFilterApplied = false;

        this.selectedValues = [];
        let filterType = 'Standard';
        let op = 'eq';

        if (this.column.filterType === 'Standard')
        {
            this.setSelectedValues();
            filterType = 'Standard';
        }
        else if (this.column.filterType === 'DateRange')
        {
            let from = this.theForm.controls.from.value;
            let to = this.theForm.controls.to.value;
            filterType = 'DateRange';
            op = 'bt';

            if (from !==null && to !== null)
            {
                from = this._getTime(dateFns.startOfDay(new Date(from*1000)));
                to = this._getTime(dateFns.endOfDay(new Date(to*1000)));
            }

            if (from !== null) {
                this.selectedValues.push(from);
            }

            if (to !== null) {
                this.selectedValues.push(to);
            }

            if (to !== null && from !== null)
            {
                this.isDateRangeFilterApplied = true;
            }
        }

        let values = this.selectedValues.length > 0 ? this.selectedValues : [];
        const d = { type: 'FilterUpdated', filterTye: filterType, data: { column: this.column.name, search: values, op: op }, resetOffset: true };
        this.signals.emit(d);
        this.chiPanel.closePanel();
    }

    setSelectedValues() {
        this.SelectedfilterList = [];
        this.selectedValues = [];
        for (const opt of this.filterList) {
            if ( opt.selected === true) {
                this.SelectedfilterList.push(opt);
                this.selectedValues.push(opt.value);
            }
        }
    }

    onDateSelected(e: any, field: FormField): void
    {
        field.formControl.markAsDirty();
        field.formControl.setValue(e);
    }

    getformValidity()
    {
        let notValid: boolean = false;

        if (this.column.filterType === 'DateRange')
        {
            let formData: any = this.theForm.value;

            if (formData['from'] === null && formData['to'] === null)
            {
                notValid = false;
            }

            else if (formData['from'] !== null && formData['to'] === null)
            {
                notValid = true;
            }

            else if (formData['from'] === null && formData['to'] !== null)
            {
                notValid = true;
            }
        }

        return notValid;
    }

    private _getTime(date: Date)
    {
        let timestamp = date.getTime() / 1000;
        timestamp = Math.floor(timestamp);
        return timestamp;
    }

    set fromVal(val: any)
    {
        this.theForm.controls.from.setValue(val);
    }

    set toVal(val: any)
    {
        this.theForm.controls.to.setValue(val);
    }

    get fromVal()
    {
        return this.theForm.controls.from.value;
    }

    get toVal()
    {
        return this.theForm.controls.to.value;
    }

    get _isSelected()
    {
        if (this.column.filterType === 'DateRange')
            return true;

        return this.isSelected
    }

    get _isCleared()
    {
        if (this.column.filterType === 'DateRange')
        {
            if (this.fromVal !== null || this.toVal !== null)
                return false;
            else
                return true
        }
        return this.isCleared
    }
}