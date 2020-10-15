import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';


import { Subject, Subscription } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { DATE_FORMAT } from '../../general/formats';
import { RVAlertsService } from '../../alerts/alerts.service';

@Component({
    selector: 'multi-selector',
    templateUrl: './multi-selection.component.html',
    styleUrls: ['./multi-selection.component.scss'],
})
export class MultiSelectionComponent implements OnInit, OnChanges, OnDestroy 
{
    @Input() showAddButton: boolean;
    @Input() showSearch: boolean;
    @Input() showSelectAll: boolean;
    @Input() showOkButton: boolean;
    @Input() isDisabled: boolean;
    @Input() isEpisode: boolean;
    @Input() inDialog: boolean;
    @Input() title: string;
    @Input() itemInRows: number;
    @Input() selectedRecordIds: any[];
    @Input() ids: any[];
    @Input() showDivider: boolean;
    @Input() isEpisodeVitals: boolean;

    @Output() signals = new EventEmitter<any>();

    mAllRecordsSelected: boolean;
    mSelectedRecordIds: any[];
    mSelectedRecordIdsCopy: any[];
    mTableData: any[];
    searchButtonToggle: boolean;
    itemWidth: number;

    dataService: Subject<any>;
    subsRef: Subscription;
    loading: boolean;

    constructor(private cdr: ChangeDetectorRef, private dialogRef: MatDialogRef<MultiSelectionComponent>) {
        // for episode onbaord date
       this.isEpisode = false;
       this.inDialog = false;

        this.mAllRecordsSelected = false;
        this.mSelectedRecordIds = [];
        this.mSelectedRecordIdsCopy = [];
        this.ids = [];
        this.mTableData = [];
        this.itemInRows = 3;
        this.itemWidth = 100;

        this.title = 'Select';
        this.subsRef = null;
        this.dataService = new Subject();

        this.showAddButton = true;
        this.showSearch = false;
        this.showOkButton = false;
        this.showSelectAll = true;
        this.isDisabled = false;

        this.searchButtonToggle = false;
        this.loading = true;
        this.showDivider = true;
        this.isEpisodeVitals = false;
    }

    ngOnInit(): void {

        this.itemWidth = (100 - 1) / this.itemInRows;

        this.subsRef = this.dataService.subscribe((data: any[]) => {
            this.mTableData = [];
            for (let row of data) {
                this.mTableData.push(row);

                row.selected = false;
                
                if (this.selectedRecordIds.length > 0)
                {
                    if (this.selectedRecordIds.indexOf(row.id) !== -1) {
                        row.selected = true;
                        this.mSelectedRecordIds.push(row.id);
                    }
                }
                else
                {
                    if (this.mSelectedRecordIds.indexOf(row.id) !== -1) {
                        row.selected = true;
                    }
                }
                
            }
            this.loading = false;
        });

        this.mSelectedRecordIdsCopy = JSON.parse(JSON.stringify(this.mSelectedRecordIds));
        let dict = {dataService: this.dataService};
        const d = {type: 'onFetchData', data: dict};
        this.signals.emit(d);

        if (this.mSelectedRecordIds.length > 0 && this.mSelectedRecordIds.length == this.mTableData.length)
            this.mAllRecordsSelected = true;

        this.cdr.detectChanges();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.selectedRecordIds) {
            this.mSelectedRecordIdsCopy = JSON.parse(JSON.stringify(this.mSelectedRecordIds));
            this.mSelectedRecordIds =[];

            for (let row of this.mTableData) {
                row.selected = false;

                if (this.selectedRecordIds.indexOf(row.id) !== -1) {
                    row.selected = true;
                    this.mSelectedRecordIds.push(row.id);
                }
            }
            const d = {type: 'onSelectionChange', data: this.mSelectedRecordIds};
            this.signals.emit(d);
        }

        this.cdr.detectChanges();
    }

    ngOnDestroy(): void {
        if (this.subsRef) {
            this.subsRef.unsubscribe();
        }
    }

    get selectedRecords() {
        let records = [];
        for (let row of this.mTableData)
        {
            if (row.selected) {
                records.push(row);
            }
        }
        return records;
    }

    onButtonSelectAll(ev: any) {
        if (!this.isDisabled)
        {
            this.mSelectedRecordIdsCopy = JSON.parse(JSON.stringify(this.mSelectedRecordIds));
            this.mSelectedRecordIds = [];
            if (this.mAllRecordsSelected) {
                for (let row of this.mTableData)
                {
                    row.selected = true;
                    this.mSelectedRecordIds.push(row.id);
                }
            }
            else if (this.mAllRecordsSelected == false) {
                
                for (let row of this.mTableData)
                {
                    row.selected = false;
                }
            }

            const d = {type: 'onSelectionChange', data: this.mSelectedRecordIds};
            this.signals.emit(d);
            const d2 = {type: 'onIdsChange', data: this.mSelectedRecordIds};
            this.signals.emit(d2);
        }
    }

    onSearch(ev: any) {
        let dict = {dataService: this.dataService, search: ev};
        const d = {type: 'onFetchData', data: dict};
        this.signals.emit(d);
    }

    onAddRecord(ev: any) {
        let dict = {dataService: this.dataService};
        const d = {type: 'onAddClick', data: dict};
        this.signals.emit(d);
    }

    onOkClicked(ev: any)
    {
        const d = {type: 'onOkClick', data: this.mSelectedRecordIds};
        this.signals.emit(d); 
    }

    onSelect(row: any, index: number) {
        
        if (!this.isDisabled) {
            this.mSelectedRecordIds = [];
            row.selected = !row.selected;

            for (let r of this.mTableData) {
                if (r.selected == true)
                    this.mSelectedRecordIds.push(r.id);
            }

            // if row.selected == flase then checks this id in this.ids array and if exist then remove it from array 
            if (row.selected == false) {
                for (let i=0; i<this.ids.length; i++) {
                    if (this.ids[i] == row.id) {
                        this.ids.splice(i, 1);
                    }
                }
            }

            // check if this.mSelectedRecordIds arry does not contain ids from this.ids array then push these ids
            // in this.mSelectedRecordIds array
            for (let _id of this.ids) {
                if (!this.mSelectedRecordIds.includes(_id)) {
                    this.mSelectedRecordIds.push(_id);
                }
            }

            // emit new selected ids array
            const d = {type: 'onSelectionChange', data: this.mSelectedRecordIds};
            this.signals.emit(d);
            const d2 = {type: 'onIdsChange', data: this.mSelectedRecordIds};
            this.signals.emit(d2);
            
        }
    }

    onSearchClick(ev: any) {
        this.searchButtonToggle = ev;
    }

    getDate(row: any) {
        let start_date = DATE_FORMAT(row.onboard_date);
        let end_date = DATE_FORMAT(row.date_updated);

        if (row.is_active)
            end_date = 'N/A';

        return start_date + ' - ' + end_date;
    }

    onCancel() 
    {
        if (this.isEpisodeVitals) 
        {
            if (this.mSelectedRecordIds.length == 0) 
            {
                RVAlertsService.error("Error", "Select at least one resultable")
                return;
            }
            else {
                this.dialogRef.close();
            }
        }
        
        else {
            this.dialogRef.close();
        }
    }
}
