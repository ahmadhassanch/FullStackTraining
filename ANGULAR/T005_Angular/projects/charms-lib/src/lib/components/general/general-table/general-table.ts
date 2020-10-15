import { Component } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Input } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Output } from '@angular/core';
import { ElementRef } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';

import { PageEvent, MatPaginator} from '@angular/material/paginator';
import { Sort, SortDirection } from '@angular/material/sort';
import { MatAutocompleteSelectedEvent, MatAutocompleteTrigger,  } from '@angular/material/autocomplete';
import { MatChipInputEvent,  } from '@angular/material/chips';

import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { FormControl } from '@angular/forms';
import { ENTER } from '@angular/cdk/keycodes';
import { FORMATS } from '../formats';
import { Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { ApiService } from '../../../services';
import { RVAlertsService, RVAlertAction } from '../../../components/alerts';
import { GenericApiResponse } from '../../../models';
import { ChiConfigService } from '../../../services/app.config.service';
import { TableConfig, TableAction, TableColumn, TableSearchOption, ListPayload, FilterAction, RowAction, ScrollOptions, WhereData, ListOrder } from '../../../models/general-models';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { PatientGeneralAdvanceFilterComponent } from '../patient_advance_filter/advance_filter';
import { MatDialog } from '@angular/material/dialog';


@Component({
    selector: 'chi-general-table',
    templateUrl: './general-table.html',
    styleUrls: ['./general-table.scss'],
    providers: [ApiService],
    animations: [
        trigger('searchContainerState', [
            state('collapsed', style({ width: '40px' })),
            state('expanded', style({ width: '400px' })),
            transition('expanded <=> collapsed', animate('250ms ease-in-out'))
        ]),
    ]
})
export class GeneralTableComponent implements OnInit, OnChanges, OnDestroy
{

    constructor(
        protected apiService: ApiService,
        private _router: Router,
        private _configService: ChiConfigService,
        private dialog: MatDialog)
    {
        this.config = null;
        this.actions = null;
        this.columns = [];
        this.endpoint = null;
        this.foreignKey = null;
        this.loadOnInit = true;

        this.activeSortDirection = '';
        this.activeSearchFilters = [];
        this.activeColumnFilters = [];
        this.tableFilters = [];
        this.displayedColumns = [];
        this.tableRowActions = [];

        this.psOptions = new ScrollOptions();
        this._unsubscribeAll = new Subject();
        this.aciveColumnFilterType = 'Standard';
        this.icon = 'add';
        this.showPillDispenserBtn = false;
        this.showSearchCriteriaBtn = false;
        this.isLoading = false;
        this.selectionTitle = null;
        this.selectedRow = null;
        this.phrViewAllBtn = false;
        // this.advanceFilter = null;
        this.showAdvanceFilter = false;
        this.filterCols = null;
    }
;

    get addPerms(): boolean
    {
        const p = this._configService.getPermission('add', this.apiService.apiSlug);
        if (p.permission) {
            return true;
        }

        return false;
    }
    // Inputs;
    @Input() config: TableConfig;
    @Input() actions: Subject<TableAction>;
    @Input() endpoint: string;
    @Input() btnText: string;
    @Input() showPillDispenserBtn: boolean;
    @Input() showSearchCriteriaBtn: boolean;
    @Input() icon: string;
    @Input() loadOnInit: boolean;
    @Input() foreignKey: string;
    @Input() foreignKeyVal: any;
    @Input() isLoading: boolean;
    @Input() phrViewAllBtn: boolean;
    filterCols: any;
    // @Input() advanceFilter: Subject<boolean>;


    // Outputs;
    @Output() signals = new EventEmitter<any>();

    // References;
    @ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;
    @ViewChild('trigger') autoCompleteTrigger: MatAutocompleteTrigger;
    @ViewChild(MatPaginator) paginator: MatPaginator;


    // Booleans;
    loading = false;
    dataError = false;
    showFilter = false;
    interactedWithSearch = false;
    showAdvanceFilter: boolean;

    // Strings;
    activeSortColumn: string;
    selectionTitle: string;
    aciveColumnFilterType: string;

    // Numbers;
    separatorKeysCodes: number[] = [ENTER];
    totalRecords = 0;
    limit = 10;
    offset = 0;

    // any
    selectedRow: any;

    // Others;
    dataSource = [];
    displayedColumns = [];
    apiColumns = [];
    columns: TableColumn[];
    activeSortDirection: SortDirection;

    searchOptions: TableSearchOption[];
    activeSearchFilters: TableSearchOption[];
    activeColumnFilters: any[];
    searchControl = new FormControl('');
    psOptions: ScrollOptions;

    tableRowActions: RowAction[];

    private _unsubscribeAll: Subject<any>;
    private lastPayload: ListPayload;
    private tableFilters: FilterAction[];

    // selection

    selection = new SelectionModel<any>(true, []);

    showError = (i: number, row: any) => {
        return this.dataError;
    }

    ngOnInit(): void
    {
        this.apiService.apiSlug = this.config.slug;
        this.apiService.primaryKey = this.config.key;

        this.searchOptions = this.config.searchOptions;

        if(this.actions != null)
        {
            this.actions.pipe(takeUntil(this._unsubscribeAll)).subscribe((e: TableAction) =>
            {
                this.handleTableAction(e);
            });
        }

        // if(this.advanceFilter != null)
        // {
        //     this.advanceFilter.pipe(takeUntil(this._unsubscribeAll)).subscribe((e: boolean) =>
        //     {
        //         this.showAdvanceFilter = e;
        //     });
        // }

        this.btnText = this.btnText ? this.btnText : 'Add New';

        this.initTable();

        if (this.loadOnInit) {
            this.fetchTableData();
        }
        else {
            this.dataError = true;
            const r = {
                title: 'No Search Criteria',
                message: 'Please add some search filters to load data'
            };
            this.dataSource = [r];
        }

        this.searchControl.valueChanges.pipe(debounceTime(400), distinctUntilChanged()).subscribe(query =>
        {
            this.onSearchData();
        });
    }

    ngOnChanges(changes: SimpleChanges): void
    {
        // Fetch Table data when the Foreign Key Value changes
        if (changes.hasOwnProperty('foreignKeyVal') && this.foreignKeyVal && !changes.foreignKeyVal.firstChange)
        {
            this.fetchTableData();
        }
    }

    ngOnDestroy(): void
    {
        if(this._unsubscribeAll != null)
        {
            this._unsubscribeAll.next();
            this._unsubscribeAll.complete();
        }
    }

    initTable()
    {
        this.columns = [];
        this.apiColumns = [];

        this.psOptions.suppressScrollX = this.config.suppressScrollX === true ? true : false;
        this.psOptions.suppressScrollY = this.config.suppressScrollY === true ? true : false;

        this.limit = (this.config.pageSize === void  0 || this.config.pageSize === null) ? 10 :  this.config.pageSize;

        // if(!this.config.suppressScrollY)
        // {
        //     this.renderer.setStyle( this.generalTable.nativeElement, 'overflow', 'unset !important' );
        // }
        // this.renderer.setStyle( this.generalTable.nativeElement, 'overflow', 'unset !important' );

        if(this.config.pageSize === void 0)
            this.config.pageSize = 10;
        if(this.config.pageSizeOptions === void 0)
            this.config.pageSizeOptions = [10, 25, 50, 100];

        for(const col of this.config.columns)
        {
            // const col2 = new DataColumn(col);
            this.columns.push(col);

            if (!col.exclude)
            {
                this.apiColumns.push(col.name);
            }

            if (col.visible)
            {
                this.displayedColumns.push(col.name);
            }
        }

        if (this.config.showRowActions)
        {
            this.tableRowActions = this.config.rowActions;

            // If not an in-route table than show actions as columns otherwise show actions in table header;
            // In-route tables examples (Observation, Patient etc)
            if (this.config.inRoute === false)
            {
                for (const ac of this.tableRowActions)
                {
                    this.displayedColumns.push(ac.toolTip);

                    if (ac.visible_in_row)
                    {
                        this.displayedColumns.push('row_actions');
                    }
                }
            }
        }

        if (this.config.selectionEnabled)
            this.displayedColumns.unshift('selection');

        this.selectionTitle = this.config.selectionTitle;
        this.lastPayload = new ListPayload(this.apiColumns);

        if (this.config.rowActions.length === 0 && this.config.defaultRowActions)
        {
            this.config.rowActions.push(
                { icon: 'edit', toolTip: 'Edit', action: 'OnEdit', class: 'priamry-fg', permission_action: 'update' },
                { icon: 'delete', toolTip: 'Delete', action: 'OnDelete', class: 'warn-fg', permission_action: 'delete' }
            );
        }
    }

    addFilter(e: MatChipInputEvent): void
    {
        console.log('AddFilter =>', e);
    }

    onShow(): void
    {
        // this.overlayService.next(e);
    }
    alphaOnly(ev:any):boolean {
        const key = ev.keyCode;
        return ((key >= 65 && key <= 90) || key === 8 || key === 9 || key === 32);
    }
    onOpenFilter(): void
    {
        this.showFilter = !this.showFilter;
    }

    filterSelected(e: MatAutocompleteSelectedEvent): void
    {

        const v = (this.searchInput.nativeElement.value || '').trim();

        if (!v)
            return;

        const opt: TableSearchOption = e.option.value;
        opt.search = v;
        this.activeSearchFilters.push(opt);

        console.log('search selected-> ', opt, v)

        this.searchInput.nativeElement.value = '';
        this.searchControl.setValue(null);

        this.resetOffset();
        this.fetchTableData();
    }

    disableSearchItems(): boolean
    {
        if (this.searchInput === void 0)
            return true;

        const v = (this.searchInput.nativeElement.value || '').trim();
        return !v;
    }

    removeSearch(f: TableSearchOption)
    {
        const index = this.activeSearchFilters.indexOf(f);

        if (index >= 0)
        {
            this.activeSearchFilters.splice(index, 1);
        }

        this.resetOffset();
        this.fetchTableData();
    }

    handleTableAction(e: TableAction)
    {
        this.selectedRow = null;

        if (e.action === 'reload')
        {
            this.fetchTableData();
        }
        else if (e.action === 'set_filter')
        {
            this.lastPayload.where = e.where;
            this.fetchTableData();
        }
        else if (e.action === 'set_selected_row')
        {
            this.selectedRow = e.row;
        }
    }

    fetchTableData(): void
    {
        this.selection.clear();
        this.selectedRow = null;

        this.loading = true;

        const payload: ListPayload = new ListPayload(this.lastPayload.columns);

        if (this.config.query_params != null)
        {
            payload.params = this.config.query_params;
        }

        if (this.config.where != null)
        {
            payload.where = new WhereData(this.config.where);
        }

        if (this.config.search !== '')
        {
            payload.search = this.config.search;
        }

        // if (this.last_payload.where !== void 0)
            // payload.where = new WhereData(this.last_payload.where);

        if (this.config.paging)
        {
            payload.limit = this.limit;
            payload.offset = this.offset;
        }
        else
        {
            payload.ResetLimit();
        }

        if (this.foreignKey != null)
        {
            payload.addTopWhere(new WhereData({column: this.foreignKey, search: this.foreignKeyVal}));
        }

        if (this.config.order != null)
        {
            this.config.order.forEach((order: ListOrder) =>
            {
                payload.AddOrder(order.column, order.dir)
            });
        }

        if (this.activeSortDirection !== '')
        {
            payload.AddOrder(this.activeSortColumn, this.activeSortDirection);
        }

        // if (this.activeSearchFilters.length > 0)
        // {
        //     if (payload.where === void 0)
        //         payload.where = new WhereData({group: 'and'});
        //     else if(payload.where.group !== 'and')
        //     {
        //         const w = new WhereData({group: 'and'});
        //         w.children.push(payload.where);

        //         payload.where = w;
        //     }

        //     this.activeSearchFilters.forEach(w =>
        //     {
        //         payload.where.children.push(new WhereData(w));
        //     });
        // }

        // Searching Data Table
        if(this.activeSearchFilters.length === 1)
        {
            payload.addTopWhere(new WhereData(this.activeSearchFilters[0]));
        }
        else if (this.activeSearchFilters.length > 1)
        {
            payload.addTopWhereDict(this._getCustomizePayload(this.activeSearchFilters));
        }
        // End

        // Filtering Data Table
        if(this.activeColumnFilters.length === 1)
        {
            if (this.aciveColumnFilterType === 'Standard')
                payload.addTopWhere(new WhereData(this.activeColumnFilters[0]));

            else if (this.aciveColumnFilterType === 'DateRange')
                payload.addTopWhere(new WhereData(this.activeColumnFilters[0]));
        }

        else if (this.activeColumnFilters.length > 1)
        {
            if (this.aciveColumnFilterType === 'Standard')
                payload.addTopWhereDict(this._getCustomizePayload(this.activeColumnFilters));

            else if (this.aciveColumnFilterType === 'DateRange')
                payload.addTopWhereDict(this._getCustomizePayload(this.activeColumnFilters));
        }

        else if (this.config.query_params !== void 0 && this.config.query_params !== null)
        {
            for (const key in this.config.query_params) {
                payload[key] = this.config.query_params[key];
            }
        }
        // End

        let endpoint = this.endpoint;
        if(endpoint == null)
            endpoint = this.apiService.apiSlug + '/List';

        this.apiService.post(endpoint, payload).then((r: GenericApiResponse) =>
        {
            this.onApiResponse(r);
        }, (error: GenericApiResponse) =>
        {
            this.loading = false;
            this.dataError = true;

            const r = {
                title: 'Error ' + error.ErrorCode,
                message: error.ErrorMessage
            };

            this.dataSource = [r];
        });
    }

    onApiResponse(response: GenericApiResponse): void
    {
        // console.log('API RESP = ', response);

        if (response.Status === 'Ok')
        {
            // console.log('api resp response = ', response);
            this.dataSource = response.data.data;
            this.totalRecords = response.data.total_records;
            this.loading = false;
            this.dataError = false;
            const d = {type: 'TotalRecords', total_records: this.totalRecords};

            if (this.dataSource.length === 0)
            {
                this.dataError = true;
                const r = {
                    title: 'No Record Found',
                    message: ''
                };

                this.dataSource = [r];
            }

            this.signals.emit(d);
        }
        else
        {
            this.loading = false;
            this.dataError = true;
            const r = {
                title: 'Error Loading Data',
                message: response.ErrorMessage
            };

            this.dataSource = [r];
        }
    }

    onPageChange(e: PageEvent)
    {
        this.limit = e.pageSize;
        this.offset = (e.pageSize * e.pageIndex);

        this.fetchTableData();
    }

    onSortChange(e: Sort)
    {
        this.activeSortColumn = e.active;
        this.activeSortDirection = e.direction;

        this.fetchTableData();
    }

    onFilterActions(e: FilterAction)
    {
        // console.log('Arrived Action = ', e);
        if (e.active)
        {
            this.tableFilters.push(e);
        }
        else
        {
            const i = this.tableFilters.indexOf(e);
            if(i > -1)
                this.tableFilters.splice(i, 1);
        }

        this.fetchTableData();
    }

    onAdd(e: any): void
    {
        const d = {type: 'OpenForm'};

        this.signals.emit(d);
    }

    onRowAction(event: any, action: RowAction, row?: any): void
    {
        event.stopPropagation();
        let r = this.selectedRow;
        if (row)
        {
            r = row;
        }

        const ac = {row: r, type: action.action};
        this.signals.emit(ac);
        if (action.action === 'OnDelete')
        {
            this.onDelete(r);
        }

    }

    disableActionInRow(row: any)
    {
        if (row === this.selectedRow)
        {
            return false;
        }

        return true;
    }

    onCellAction(e: MouseEvent, column: TableColumn, row: any): void
    {
        if (column.cellClicked)
        {
            const d = {
                type: 'CellClick',
                row
            };

            this.signals.emit(d);
            e.stopPropagation();
        }

        if (column.cellClickAction != null)
        {
            const ac = {row, type: column.cellClickAction};
            this.signals.emit(ac);
            e.stopPropagation();
            // this[column.cellClickAction](row);
            return;
        }

        if (column.url == null)
            return;

        const url = column.url.replace(':id', row[this.apiService.primaryKey]);
        this._router.navigateByUrl(url);
    }

    cellValue(col: TableColumn, row: any)
    {
        // if (!col.format)
        //     return row[col.name];

        // return FORMATS[col.format](row[col.name], row, col);

        if (this._configService.getIsSecurityEnabled())
        {
            if (col.encrypted && this._configService.getIsSecurityUnlocked())
            {
                const encCol = col.name + '_enc';

                // every time not executing the whole method just return form here
                const enck = col.name + '_enc_dec';
                if (row[enck] !== void 0)
                {
                    return row[enck];
                }

                if (!col.format)
                {
                    if (row[encCol] !== void 0 && row[encCol] !== null) {
                        const v = this._configService.decryptText(row[encCol]);
                        row[enck] = v;
                        return v;
                    }
                    else
                    {
                        return '';
                    }
                }
                else
                {
                    if (col.format === 'patient_name')
                    {
                        if (row[encCol] !== void 0 && row[encCol] !== null)
                        {

                            const lnEncCol = encCol.replace(/first_name_enc/g, 'last_name_enc');
                            const fv = this._configService.decryptText(row[encCol]);
                            let lv = '';
                            if (row[lnEncCol] != null) {
                                lv = this._configService.decryptText(row[lnEncCol]);
                            }

                            const val = fv + ' ' + lv
                            row[enck] = val;

                            return val;
                        }
                        else
                        {
                            return '';
                        }
                    }

                    // formats other than patient format
                    const fm = this._configService.decryptText(row[encCol]);
                    const v = FORMATS[col.format](fm, row, col);
                    row[enck] = v;
                    return v;
                }
            }
            else
            {
                return this.otherFormat(col, row);
            }
        }
        else
        {
            return this.otherFormat(col, row);
        }
    }

    otherFormat(col: TableColumn, row: any)
    {
        if (!col.format) {
            return row[col.name];
        }

        if (col.format === 'patient_name')
        {
            if (row[col.name] !== void 0 && row[col.name] !== null)
            {
                const lastName = col.name.replace(/first_name/g, 'last_name');
                return row[col.name] + ' ' + row[lastName];
            }
            else
            {
                return '';
            }
        }

        return FORMATS[col.format](row[col.name], row, col);
    }

    onBtnRefresh(): void
    {
        this.fetchTableData();
    }

    _getPermissions(action: any)
    {
        if (action !== undefined)
        {
            const p = this._configService.getPermission(action, this.apiService.apiSlug);
            if (p.permission) {
                return true;
            }
            return false;
        }

        return true;
    }

    onDelete(row: any) {
        RVAlertsService.confirmWithInput('Delete Record', 'Comments', true).subscribe((action: RVAlertAction) => {
            if (action.positive) {
                const payload = {
                    oid: row[this.config.key],
                    Comments: action.value
                };

                this.apiService.doDelete(payload).then((resp: GenericApiResponse) => {

                    if (resp.Status === 'Ok') {
                        if (this.dataSource.length === 1 && this.totalRecords >= 1)
                        {
                            if (this.offset > 0)
                            {
                                this.offset = this.offset - this.limit;
                                if (this.offset < 0)
                                this.offset= (-1)*this.offset;
                            }

                            this.paginator.previousPage();
                        }
                        this.actions.next( {action: 'reload'} );
                    } else {
                        RVAlertsService.error('Error Deleting Record!', resp.ErrorMessage)
                    }
                }, (error: GenericApiResponse)=> {
                    RVAlertsService.error('Error Deleting Record!', error.ErrorMessage)
                });
            }
        });
    }

    onGetFilterRows(e)
    {
        if (e.hasOwnProperty('resetOffset') && e.resetOffset)
        {
            this.resetOffset();
        }

        if (e.type === 'SortUpdated')
        {
           this.onSortChange(e.data);
        }

        if (e.type === 'FilterUpdated')
        {
            this.aciveColumnFilterType = e.filterTye;
            for (let i = 0; i < this.activeColumnFilters.length; i++)
            {
                if (this.activeColumnFilters[i].column === e.data.column)
                {
                    if (e.data.search.length > 0)
                    {
                        this.activeColumnFilters[i].search = e.data.search;
                    }
                    else
                    {
                        this.activeColumnFilters.splice(i, 1);
                    }

                    this.fetchTableData();
                    return;
                }
            }

            if (e.data.search.length > 0)
            {
                this.activeColumnFilters.push(e.data);
                this.fetchTableData();
            }
        }
    }

    onRowClick(row: any)
    {
        this.tableRowActions = [];
        if (this.selectedRow === row)
        {
            this.selectedRow = null;

            // Update Actions;
            for (const ac of this.config.rowActions)
            {
                if(this._getPermissions(ac.permission_action))
                {
                    this.tableRowActions.push(ac);
                }
            }
        }
        else
        {
            this.selectedRow = row;

            // Update Actions;
            for (const ac of this.config.rowActions)
            {
                if((ac.condition === undefined || ac.condition(row, ac.action)) && this._getPermissions(ac.permission_action))
                {
                    this.tableRowActions.push(ac);
                }
            }
        }

        const d = {
            type: 'RowClick',
            row
        };

        this.signals.emit(d);
    }

    _getCustomizePayload(value: any[])
    {
        const where = new WhereData({group: 'and'});
        for (const w of value)
        {
            where.children.push(new WhereData(w));
        }

        return where;
    }

    // _getDateRangeFiler(value: any[])
    // {
    //    const where = new WhereData({group: 'and'});
    //     for (const w of value)
    //     {
    //         if (w.search.length > 0 && w.search[0] !== null)
    //         {
    //             let _from: WhereData = {column: w.column, search: w.search[0], op: 'ge'};
    //             where.children.push(new WhereData(_from));
    //         }

    //         if (w.search.length > 1 && w.search[1] !== null)
    //         {
    //             let _to: WhereData = {column: w.column, search: w.search[1], op: 'le'};
    //             where.children.push(new WhereData(_to));
    //         }
    //     }
    //     return where;
    // }

    checkRowActionCond(row: any)
    {
        const isVisible = true;
        return isVisible;
        // if (this.config.rowActions.length > 0)
        // {
        //     this.config.rowActions.forEach(action => {

        //         if (action.condition !== undefined || action.condition !== null)
        //         {
        //             if (action.condition(row, action.action))
        //             {
        //                 console.log('condition -> ', action.condition(row, action.action));
        //                 console.log('row -> ', row);
        //                 is_visible = true;
        //             }
        //             else
        //             {
        //                 is_visible = false;
        //             }

        //         }
        //         else{
        //             is_visible = true;
        //         }
        //     })
        // }

        // return is_visible;
    }

    // customization

    onPillDispenserBtnClick(e: any): void
    {
        const d = {type: 'OpenPillDispenserForm'};

        this.signals.emit(d);
    }

    onSearchCriteriaBtnClick(e: any): void
    {
        const d = {type: 'SearchCriteria', row: []};

        this.signals.emit(d);
    }

    updateSchedule(e: any, records: any[]): void
    {
        const d = {type: 'UpdateSchedule', row: records};

        this.signals.emit(d);
    }

    onSelectedRecords(e: any, records: any[]): void
    {
        const d = {type: 'SelectedRecords', row: records};

        this.signals.emit(d);
    }

    onPHRViewAll(ev: any)
    {
        const d = {type: 'PHRViewAll', row: {type: 'test'}};

        this.signals.emit(d);
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.forEach(row => this.selection.select(row));
    }

    search(input: HTMLInputElement)
    {
        console.log('Search data -> ', input.value);
    }

    onAdvanceFilter(col: any)
    {
        // const d = {type: 'AdvanceFilter', row: col};
        // this.signals.emit(d);

        const dialogRef = this.dialog.open(PatientGeneralAdvanceFilterComponent,{
            width: '70vw',
            maxWidth: '70vw',
            height: '80vh',
            panelClass: 'chi-custom-height-container'

        })
        dialogRef.componentInstance.inDailog = col.showInDialog;
        dialogRef.componentInstance.title = 'Patient Search';
        dialogRef.componentInstance.data = this.filterCols;
        dialogRef.componentInstance.slug = col.advanceFilterSlug;

        dialogRef.afterClosed().subscribe(resp =>
        {
            if (resp && resp !== void 0)
            {
                this.resetOffset();
                this.filterCols = resp.data;
                this.showAdvanceFilter = resp.haveData;

                const d = {type: 'AdvanceFilter', row: {where: resp.where}};
                this.signals.emit(d);
            }
        })
    }

    onToggleChange(ev: any)
    {
        const d = {type: 'Toggle', value: ev.checked};
        this.signals.emit(d);
    }

    resetOffset()
    {
        this.offset = 0;
        this.paginator.pageIndex = 0;
    }

    toggleSearch(): void
    {
        // this.interactedWithSearch = !this.interactedWithSearch;

        // if (this.interactedWithSearch)
        // {
        //     this.searchInput.nativeElement.value = '';
        // }
        // else
        // {
        //     setTimeout(() => {
        //         this.autoCompleteTrigger.closePanel();
        //     }, 10);
        // }

        this.interactedWithSearch = !this.interactedWithSearch;
        if (this.searchControl.value !== '')
        {
            this.searchControl.setValue('');
        }
    }

    onSearchData(): void
    {
        this.config.search = this.searchControl.value;
        this.resetOffset();
        this.fetchTableData();
    }
}
