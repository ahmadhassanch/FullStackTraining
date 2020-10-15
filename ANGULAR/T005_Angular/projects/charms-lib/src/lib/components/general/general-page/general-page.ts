import { Component } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { Platform } from '@angular/cdk/platform';
import { ActivatedRoute } from '@angular/router';
import { trigger, state, style, transition, animate } from '@angular/animations';

import { Subject } from 'rxjs';

import { ApiService } from '../../../services';
import { ChiConfigService } from '../../../services/app.config.service';
import { ControllerConfig, TableConfig, FormConfig } from '../../../models/general-models';
import { RVAlertsService, RVAlertAction } from '../../alerts';


@Component({
    selector: 'chi-general-page',
    templateUrl: './general-page.html',
    styleUrls: ['./general-page.scss'],
    providers: [ApiService],
    animations: [
        trigger('tableExpand', [
            state('collapsed', style({ 'max-width': '{{tableWidth}}%', 'margin-right': '8px' }), {params: {tableWidth: 70}}),
            state('expanded', style({ 'max-width': '{{tableWidth}}%' }), {params: {tableWidth: 100}}),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('formExpand', [
            state('collapsed', style({ display: 'none', 'max-width': '0' })),
            state('expanded', style({ 'max-width': '{{formWidth}}%' }), {params: {formWidth: 30}}),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
    ]

})
export class GeneralPageComponent implements OnInit, OnDestroy
{
    @Input() config: ControllerConfig;
    @Input() actions: Subject<any>;

    @Input() foreignKey: string;
    @Input() foreignKeyVal: any;
    @Input() asChild: boolean;
    @Input() isDialog: boolean;
    @Input() isSmallTable: boolean;
    @Output() pageSignals = new EventEmitter();

    tableWidth = 100;
    formWidth = 0;

    tableConfig: TableConfig;
    formConfig: FormConfig;

    oid: any;
    isMobile: boolean;

    isFormDirty = false;

    lastSelectedRow = null;

    constructor(
        protected apiService: ApiService,
        protected _route: ActivatedRoute,
        private _platform: Platform,
        private _configService: ChiConfigService)
    {
        this.config = null;
        this.oid = null;
        this.actions = new Subject();

        this.isSmallTable = false;
    }

    ngOnInit(): void
    {
        if ( this._platform.ANDROID || this._platform.IOS )
        {
            this.isMobile = true;
        }

        if (this.config == null)
        {
            const rd = this._route.snapshot.data;
            if (rd != null && rd.name !== void 0)
            {
                const ctrl = this._configService.getController(rd.name);
                if (ctrl !== void 0)
                {
                    this.config = new ControllerConfig(ctrl);
                }
            }

        }

        if (this.config != null)
        {
            this.apiService.apiSlug = this.config.slug;
            this.apiService.primaryKey = this.config.key;
            this.tableConfig = this.config.table;
            // this.formConfig = this.config.form;
        }
    }

    ngOnDestroy(): void
    {

    }

    onClick(e: any): void
    {
        if (this.formWidth === 0)
        {
            this.formWidth = 30;
            this.tableWidth = 70;
        }
        else
        {
            this.formWidth = 0;
            this.tableWidth = 100;
        }

        this.actions.next(
            // {action: 'reload'}
        );
    }

    onTableSignal(e: any)
    {
        if (this.lastSelectedRow == null)
        {
            this.lastSelectedRow = (e.row === void 0) ? null : e.row;
        }

        if (e.type === 'OpenForm')
        {
            this.isFormDirty = false;
            this.formConfig = (new FormConfig(this.config));
            this.oid = null;
            if (this.formWidth === 0)
            {
                this.formWidth = 30;
                this.tableWidth = 70;
            }
        }
        else if (e.type === 'CloseForm')
        {
            this.isFormDirty = false;
            if (this.formWidth !== 0)
            {
                this.formWidth = 0;
                this.tableWidth = 100;
            }
        }
        else if (e.type === 'OnEdit')
        {
            this.isFormDirty = false;
            this.formConfig = (new FormConfig(this.config));
            this.oid = e.row[this.config.key];

            if(this.formWidth === 0)
            {
                this.formWidth = 30;
                this.tableWidth = 70;
            }
        }
        else if (e.type === 'ValueChange')
        {
            this.isFormDirty = true;
        }
        else if (e.type === 'RowClick')
        {
            if (this.tableConfig.allowSwitchEditing && this.formWidth > 0)
            {
                if (this.isFormDirty)
                {
                    RVAlertsService.confirm('Unsaved Changes', 'Are you sure to fetch selected record').subscribe((result: RVAlertAction) =>
                    {
                        if (result.positive)
                        {
                            this.isFormDirty = false;
                            this.lastSelectedRow = (e.row === void 0) ? null : e.row;
                            this.onSwitchSingle(e);
                        }
                        else
                        {
                            if (this.lastSelectedRow != null)
                            {
                                this.actions.next({action: 'set_selected_row', row: this.lastSelectedRow});
                            }
                        }
                    });
                }
                else
                {
                    this.onSwitchSingle(e);
                }
            }
        }

        this.pageSignals.emit(e);
    }

    onSwitchSingle(e: any): void
    {
        this.formConfig = (new FormConfig(this.config));
        this.oid = e.row[this.config.key];
    }
}
