import { FormControl, Validators } from '@angular/forms';
import { SortDirection } from '@angular/material/sort';
import { MatDialogConfig } from '@angular/material/dialog';

export class WhereData
{
    column?: string;
    search?: any;
    op?: string;

    group?: string;
    children?: WhereData[];

    public constructor(params?: any)
    {
        if (params === void 0)
        {
            throw new Error('WhereData not defined');
        }

        if (params.group === void 0 || params.group === 'none')
        {
            this.column = params.column;
            this.search = params.search;
            this.op = params.op;
        }
        else
        {
            this.group = params.group;
            this.children = [];

            if (params.children !== void 0)
            {
                params.children.forEach((w: any) =>
                {
                    this.children.push(new WhereData(w));
                });
            }
        }
    }
}

export class TableSearchOption
{
    column: string;
    title: string;
    // tslint:disable-next-line:variable-name
    title_large: string;
    hint?: string;
    search?: string;
    op?: string;

    constructor(params?: any, title?: string)
    {
        this.column = params.name;
        this.title = params.title;
        this.title_large = title + ' ' + params.title;
        this.hint = params.hint;

        this.op = 'like';
    }
}

export class AdvanceSearch
{
    title: string;
    icon?: string;
    showAdvanceSearch: boolean;

    constructor(params?: any)
    {
        if (params === void 0)
            params = {};

        this.title = (params.title === void 0) ? 'Advance Search' : params.title;
        this.icon = (params.icon === void 0) ? 'search' : params.icon;
        this.showAdvanceSearch = (params.showAdvanceSearch === void 0) ? false : params.showAdvanceSearch;
    }
}

export class RowAction
{
    icon?: string;
    toolTip?: string;
    action: string;
    class?: string;
    // tslint:disable-next-line:variable-name
    permission_action?: any;
    condition?: (row: any, action: string) => boolean;
    // tslint:disable-next-line:variable-name
    visible_in_row?: boolean;
    visible?: boolean;

    constructor(params?: any)
    {
        if (params === void 0)
            params = {};

        this.icon = params.icon;
        this.toolTip = params.toolTip;
        this.action = params.action;
        this.class = params.class;
        this.permission_action = params.permission_action;
        this.visible_in_row = (params.visible_in_row === void 0) ? false : params.visible_in_row;
        this.visible = (params.visible === void 0) ? true : params.visible;
        this.condition = params.condition;
    }
}

type cellFormats = 'image' | 'date' | 'datetime' | 'bool' | 'location' | 'number' | 'decimal' | 'decimal1' | 'percent' | 'combine' | 'serial' | 'patient_name';

export class TableColumn
{
    name: string;
    title?: string;
    format?: cellFormats;

    visible?: boolean;
    sortable?: boolean;
    showFilter?: boolean;
    showAdvanceFilter?: boolean;
    advanceFilterSlug?: string;
    showInDialog?: boolean;
    filterType?: string;

    showInSearch?: boolean;

    sticky?: boolean;
    url?: string;
    width?: string;
    align?: string;
    wrap?: boolean;
    class?: string;

    exclude?: boolean;

    classes?: any;
    combine?: string[];
    prefix?: string;
    cellClicked?: boolean;

    colHeaderType?: 'none' | 'sort' | 'filter' | 'sort-filter' | 'advance-filter';

    cellClickAction?: string;
    encrypted?: boolean;


    constructor(params?: any)
    {
        if (params === void 0)
        {
            params = {};
        }

        this.name = params.name;
        this.title = params.title || params.name;
        this.format = params.format;
        this.combine = params.combine;
        this.prefix = params.prefix;

        this.sticky = (params.sticky === void 0) ? false : params.sticky;
        this.visible = (params.visible === void 0) ? true : params.visible;
        this.wrap = (params.wrap === void 0) ? true : params.wrap;
        this.exclude = (params.exclude === void 0) ? false : params.exclude;
        this.sortable = (params.sortable === void 0) ? false : params.sortable;
        this.filterType = (params.filterType === void 0) ? 'Standard' : params.filterType;
        this.showInSearch = (params.showInSearch === void 0) ? false : params.showInSearch;
        this.showFilter = (params.showFilter === void 0) ? false: params.showFilter;
        this.showAdvanceFilter = (params.showAdvanceFilter === void 0) ? false: params.showAdvanceFilter;
        this.cellClicked = (params.cellClicked === void 0) ? false: params.cellClicked;
        this.encrypted = (params.encrypted === void 0) ? false: params.encrypted;

        this.width = params.width || 'auto';
        this.align = params.align || 'left';
        this.class = params.class || null;

        if (this.sortable)
        {
            this.colHeaderType = this.showFilter ? 'sort-filter' : 'sort';
        }
        else
        {
            this.colHeaderType = this.showFilter ? 'filter' : 'none';
        }

        if (this.showAdvanceFilter)
        {
            this.colHeaderType = this.showAdvanceFilter ? 'advance-filter' : 'none';
        }

        this.advanceFilterSlug = (params.advanceFilterSlug === void 0) ? 'patients': params.advanceFilterSlug;
        this.showInDialog = (params.showInDialog === void 0) ? true: params.showInDialog;
        this.cellClickAction = params.cellClickAction || null;

        if (this.format !== void 0)
        {
            switch(this.format)
            {
                case 'image':
                    this.align = 'center image';
                    this.width = '80px';
                    break;

                case 'bool': this.align = 'center'; break;

                case 'percent':
                case 'decimal1':
                case 'decimal': this.align = 'right'; break;
            }
        }

        this.url = params.url || null;
    }
}

export class ForeignModel
{
    mode?: 'single' | 'double' | 'triple';
    // tslint:disable-next-line:variable-name
    foreign_table: string;
    // tslint:disable-next-line:variable-name
    foreign_column: string;
    columns: string[];
    where?: WhereData;
    setOnSelect?: string[];
    limit?: number;
    // tslint:disable-next-line:variable-name
    query_params?: any;
    // tslint:disable-next-line:variable-name
    advance_search: AdvanceSearch;

    loadDefault?: boolean;
    allowAdd?: boolean;

    component?: any;
    configName?: string;
    dialogConfig: MatDialogConfig;

    constructor(params?: any)
    {
        if (params === void 0)
        {
            params = {};
        }

        this.mode = params.mode || 'single';
        this.foreign_table = params.foreign_table;
        this.foreign_column = params.foreign_column;
        this.columns = params.columns;
        this.setOnSelect = params.setOnSelect;
        this.limit = params.limit;
        this.query_params = params.query_params;
        this.advance_search = new AdvanceSearch(params.advance_search);
        this.loadDefault = params.loadDefault === void 0 ? false : params.loadDefault;
        this.allowAdd = params.allowAdd === void 0 ? false : params.allowAdd;

        this.configName = params.configName ?? null;
        this.component = params.component ?? null;
        this.dialogConfig = params.dialogConfig ?? null;

        if (params.where !== void 0)
        {
            this.where = new WhereData(params.where);
        }
    }
}

export class FormField
{
    name: string;

    // hidden, text, textarea, number, email, password, checkbox, radio, dropdown, switch
    // file: image, audio, video, application, pdf
    // date, time, datetime, location, foreign
    type: string;
    title: string;
    placeholder?: string;

    required?: boolean;
    disable?: boolean;
    // tslint:disable-next-line:variable-name
    min_date?: number;
    validators?: string[];
    width?: number;
    hint?: string;
    exclude?: boolean;

    foreign?: ForeignModel;
    searchType?:string; // Search Field Validation
    options?: string[]; // Foreign, Dropdown or Radio

    // tslint:disable-next-line:variable-name
    allowed_types?: string[];   // For File field

    formControl?: FormControl;
    loading: boolean;
    // tslint:disable-next-line:variable-name
    allow_translation?: boolean;
    default?: any;
    api: string;

    minLength?: number;
    maxLength?: number;

    constructor(params?: any)
    {
        if (params === void 0)
        {
            params = {};
        }

        this.loading = false;
        this.name = params.name;
        this.type = params.type || 'text';
        this.title = params.title;
        this.hint = (params.hint === void 0) ? null :  params.hint;
        this.width = params.width || 100;

        this.placeholder = params.placeholder || params.title;
        this.searchType = params.searchType || 'text';
        this.required = (params.required === void 0) ? false: params.required;
        this.disable = (params.disable === void 0) ? false: params.disable;
        this.min_date = (params.min_date === void 0) ? null: params.min_date;
        this.default = (params.default === void 0) ? null: params.default;

        this.exclude = (params.required === void 0) ? false: params.exclude;

        this.minLength = (params.minLength === void 0) ? null: params.minLength;
        this.maxLength = (params.maxLength === void 0) ? null: params.maxLength;

        if (this.type === 'foreign')
        {
            this.foreign = new ForeignModel(params.foreign);
            this.options = params.options || [];
        }
        else if (this.type === 'dropdown' || this.type === 'radio')
        {
            this.options = params.options || [];
        }

        this.validators = params.validators || [];
        this.allowed_types = params.allowed_types || [];
        this.api = params.api || null;
        this.formControl = new FormControl(this.default);

        if (this.minLength != null)
        {
            this.formControl.setValidators(this.formControl.validator ? [this.formControl.validator, Validators.minLength(this.minLength)] : [Validators.minLength(this.minLength)]);
        }

        if (this.maxLength != null)
        {
            this.formControl.setValidators(this.formControl.validator ? [this.formControl.validator, Validators.maxLength(this.maxLength)] : [Validators.maxLength(this.maxLength)]);
        }

        this.allow_translation = (params.allow_translation === void 0) ? false: params.allow_translation;
    }

    get error(): string
    {
        if (this.formControl.hasError('required'))
            return `${this.title} is required`;

        if (this.formControl.hasError('email'))
            return 'Invalid email';

        if (this.formControl.hasError('minlength'))
            return `Minimum length is ${this.minLength}`;

        if (this.formControl.hasError('maxlength'))
            return `Maximum length is ${this.maxLength}`;
    }

    get valid(): boolean
    {
        return this.formControl ? this.formControl.valid : false;
    }

    get invalid(): boolean
    {
        return this.valid;
    }

    set value(val: any) {
        this.formControl.setValue(val);
    }

    get value() {
        return this.formControl.value;
    }
}

export class FilterAction
{
    title: string;
    action: string;
    where: WhereData;

    active: boolean;

    constructor(params?: any)
    {
        this.title = params.title;
        this.action = params.action || null;

        if (params.where !== void 0)
            this.where = new WhereData(params.where);

        this.active = false;
    }
}

export class FilterSection
{
    actions: FilterAction[];

    constructor(params?: any)
    {
        this.actions = [];

        if(params.actions !== void 0)
        {
            params.actions.forEach((a: FilterAction) =>
            {
                this.actions.push(new FilterAction(a));
            });
        }
    }
}

export class CustomFilters
{
    column: string;
    title: string;
    options: string[];
}

export class TableFilters
{
    icon: string;
    title: string;

    sections: FilterSection[];

    // tslint:disable-next-line:variable-name
    custom_filters: CustomFilters[];

    constructor(params?: any)
    {
        this.icon = params.icon;
        this.title = params.title;

        this.sections = [];
        if (params.sections !== void 0)
        {
            params.sections.forEach((s: FilterSection) =>
            {
                this.sections.push(new FilterSection(s));
            });
        }

        this.custom_filters = [];
    }
}

export class TableHeaderOptions
{
    visible: boolean;
    showSearch: boolean;
    showAdd: boolean;
    showImport: boolean;

    // Toggle Button
    showToggle: boolean;
    toggleDefault: boolean;
    toggleTitle: string;

    constructor(params?: any)
    {
        this.visible = params.showHeader === void 0 ? true : params.showHeader;
        this.showSearch = params.showSearch === void 0 ? true : params.showSearch;
        this.showAdd = params.showAdd === void 0 ? true : params.showAdd;
        this.showImport = params.showImport === void 0 ? true : params.showImport;
        this.showToggle = params.showToggle === void 0 ? false : params.showToggle;
        this.toggleDefault = params.toggleDefault === void 0 ? true : params.toggleDefault;
        this.toggleTitle = params.toggleTitle === void 0 ? 'Slide' : params.toggleTitle;
    }
}

export class TableConfig
{
    title: string;
    key: string;
    slug: string;

    searchType:string;

    columns: TableColumn[];

    paging: boolean;
    pageSize?: number;
    pageSizeOptions?: number[];

    searchOptions?: TableSearchOption[];
    filters: TableFilters;
    suppressScrollX: boolean;
    suppressScrollY: boolean;

    header: TableHeaderOptions;

    defaultRowActions: boolean;
    rowActions: RowAction[];
    showRowActions: boolean;

    // In-route tables examples (Observation, Patient etc)
    inRoute: boolean;
    selectionEnabled: boolean;
    selectionTitle: string;

    where: WhereData;
    order: ListOrder[];
    // tslint:disable-next-line:variable-name
    query_params?: any;
    search?: any;

    isSmallTable:  boolean;
    showPagination?: boolean;

    allowSwitchEditing: boolean;

    constructor(params?: any)
    {
        this.key = params.key;
        this.slug = params.slug;
        this.title = params.title_p;
        this.searchType = params.searchType === void 0 ? 'text' : params.searchType;

        this.paging = params.paging === void 0 ? true : params.paging;
        this.pageSize = params.pageSize;
        this.pageSizeOptions = params.pageSizeOptions;

        this.suppressScrollX = params.suppressScrollX || false;
        this.suppressScrollY = params.suppressScrollY || false;

        this.header = new TableHeaderOptions(params);

        this.searchOptions = [];
        this.columns = [];
        this.isSmallTable = params.isSmallTable ? true : false;
        this.query_params = params.query_params === void 0 ? null : params.query_params;
        if (params.table !== void 0 && params.table.columns !== void 0)
        {
            params.table.columns.forEach((col: any) =>
            {
                const c = new TableColumn(col);
                this.columns.push(c);

                if (c.showInSearch)
                    this.searchOptions.push(new TableSearchOption(c, params.title_s));
            });
        }

        this.rowActions = [];
        this.inRoute = params.inRoute === void 0 ? false : params.inRoute;
        this.allowSwitchEditing = params.allowSwitchEditing === void 0 ? false : params.allowSwitchEditing;

        this.defaultRowActions = params.defaultRowActions === void 0 ? true : params.defaultRowActions;
        this.showRowActions = params.showRowActions === void 0 ? true : params.showRowActions;
        this.selectionEnabled = params.selectionEnabled === void 0 ? false : params.selectionEnabled;
        this.selectionTitle = params.selectionTitle === void 0 ? 'Delete All' : params.selectionTitle;
        this.showPagination = params.showPagination === void 0 ? true : params.showPagination;
        this.search = params.search === void 0 ? null : params.search;
        if (params.rowActions !== void 0)
        {
            params.rowActions.forEach(e => {
                this.rowActions.push(new RowAction(e));
            });
        }

        this.filters = null;
        if (params.table.filters !== void 0)
        {
            this.filters = new TableFilters(params.table.filters);
        }

        this.where = null;
        if (params.table.where !== void 0 && params.table.where != null)
        {
            this.where = new WhereData(params.table.where);
        }
        this.order = null;
        if (params.table.order !== void 0)
        {
            this.order = [];
            params.table.order.forEach((order: ListOrder) =>
            {
                this.order.push({column: order.column, dir: order.dir});
            });
        }
    }
}

export class FormSectionModel
{
    table: string;
    columns: any[];
    // data: any;

    constructor(table: string)
    {
        this.table = table;
        this.columns = [];
        // this.data = {};
    }
}

export class FormSection
{
    key: string;
    conditional?: boolean;
    // tslint:disable-next-line:variable-name
    cond_title: string;

    table: string;
    columns: FormField[];

    // tslint:disable-next-line:variable-name
    section_model: FormSectionModel; // Only internal use
    controls: FormControl[];

    constructor(params?: any)
    {
        this.key = params.key;
        this.conditional = params.conditional || false;
        this.cond_title = params.cond_title;
        this.table = params.table;

        this.columns = [];
        this.section_model = new FormSectionModel(this.table);
        this.controls = [];

        // tslint:disable-next-line:variable-name
        const model_cols = [];
        if (params.columns !== void 0)
        {
            params.columns.forEach((col: any) =>
            {
                model_cols.push(col.name);
                this.columns.push(new FormField(col));
            });
        }

        this.section_model.columns.push(model_cols);
    }

    disable()
    {
        this.controls.forEach(c =>
        {
            c.disable();
        });
    }

    enable()
    {
        this.controls.forEach(c =>
        {
            c.enable();
        });
    }

}

export class FormConfig
{
    title: string;
    key: string;
    slug: string;

    columns: FormField[];
    sections: FormSection[];

    suppressScrollX: boolean;
    suppressScrollY: boolean;

    // tslint:disable-next-line:variable-name
    query_params?: any;

    constructor(params?: any)
    {
        this.key = params.key;
        this.slug = params.slug;
        this.title = params.title_s;

        this.suppressScrollX = params.suppressScrollX || false;
        this.suppressScrollY = params.suppressScrollY || false;

        this.columns = [];

        this.query_params = params.form.query_params === void 0 ? null : params.form.query_params;

        if (params.form !== void 0 && params.form.columns !== void 0)
        {
            params.form.columns.forEach((col: any) =>
            {
                this.columns.push(new FormField(col));
            });
        }

        this.sections = [];
        if (params.form.sections !== void 0)
        {
            params.form.sections.forEach((sec: any) =>
            {
                this.sections.push(new FormSection(sec));
            });
        }
    }
}

export class ControllerConfig
{
    key: string;
    slug: string;
    // tslint:disable-next-line:variable-name
    title_s: string;
    // tslint:disable-next-line:variable-name
    title_p: string;

    table: TableConfig;
    form: FormConfig;

    constructor(params?: any)
    {
        this.key = params.key;
        this.slug = params.slug;
        this.title_s = params.title_s;
        this.title_p = params.title_p;

        if (params.table !== void 0)
            this.table = new TableConfig(params);

        if (params.form !== void 0)
            this.form = new FormConfig(params);
    }

}

export class ListOrder
{
    column: string;
    dir: SortDirection;
}

export class ListPayload
{
    columns: string[];

    limit?: number;
    offset?: number;
    order?: ListOrder[];

    where?: WhereData;
    params?: any;
    search?: any;

    constructor(columns: string[])
    {
        this.columns = columns;
        this.search = null;
    }

    SetOrder(column: string, dir: SortDirection)
    {
        // if (this.order === void 0)
        this.order = [];

        const o: ListOrder = {
            column,
            dir
        };

        this.order.push(o);
    }

    AddOrder(column: string, dir: SortDirection)
    {
        if (this.order === void 0)
            this.order = [];

        const o: ListOrder = {
            column,
            dir
        };

        this.order.push(o);
    }

    ResetLimit()
    {
        this.limit = void 0;
        this.offset = void 0;
    }

    ResetConditions()
    {
        this.where = void 0;
    }

    addTopWhere(where: WhereData)
    {
        if (this.where === void 0)
            this.where = new WhereData({group: 'and'});
        else if(this.where.group !== 'and')
        {
            const w = new WhereData({group: 'and'});
            w.children.push(this.where);

            this.where = w;
        }

        this.where.children.push(where);
    }

    addTopWhereDict(where)
    {
        if (this.where === void 0 || this.where === null) {
            this.where = where;
        } else {
            const wh2 = {group: 'and', children: [where]};
            wh2.children.push(this.where);
            this.where = wh2;
        }
        this.where = this.where;
    }

}

export class TableAction
{
    action: 'reload' | 'set_filter' | 'add_filter' | 'set_selected_row';
    where?: WhereData;
    row?: any;
}

export class ScrollOptions
{
    scrollYMarginOffset: number;
    scrollXMarginOffset: number;
    suppressScrollX: boolean;
    suppressScrollY: boolean;

    constructor(params?: any)
    {
        if (params === void 0)
        {
            params = {};
        }

        this.scrollXMarginOffset = params.scrollXMarginOffset || 10;
        this.scrollYMarginOffset = params.scrollYMarginOffset || 10;

        this.suppressScrollX = params.suppressScrollX || false;
        this.suppressScrollY = params.suppressScrollY || false;
    }
}

export class FilterDropDownModel
{
    value: string;
    viewValue: string;
    selected: boolean;

    constructor()
    {
        this.selected = false;
    }
}

export class ClinicalQuestion
{
    // tslint:disable-next-line:variable-name
    question_id: number;
    // tslint:disable-next-line:variable-name
    event_question_id: number;
    title: string;
    // tslint:disable-next-line:variable-name
    comments_required: boolean;
    // tslint:disable-next-line:variable-name
    on_set_time: boolean;
    type: string;
    // tslint:disable-next-line:variable-name
    is_required: boolean;
    units?: QuestionUnit[];
    options?: QuestionOption[];
    // tslint:disable-next-line:variable-name
    min_value?: any;
    // tslint:disable-next-line:variable-name
    max_value?: any;

    constructor(params: any)
    {
        this.title = params.title;
        this.comments_required = params.comments_required;
        this.on_set_time = params.on_set_time;
        this.type = params.type;
        this.is_required = params.is_required;
        this.options = params.options || [];
        this.units = params.units || [];
        this.min_value = params.min_value || null;
        this.max_value = params.max_value || null;
    }
}
export class QuestionUnit
{
    // tslint:disable-next-line:variable-name
    unit_id: number;
    // tslint:disable-next-line:variable-name
    unit_name: string;
    // tslint:disable-next-line:variable-name
    min_value?: any;
    // tslint:disable-next-line:variable-name
    max_value?: any;
    // tslint:disable-next-line:variable-name
    is_deleted: boolean;

    constructor(params: any)
    {
        this.unit_id = params.unit_id;
        this.unit_name = params.unit_name;
        this.min_value = params.min_value || null;
        this.max_value = params.max_value || null;
        this.is_deleted = params.is_deleted || false;
    }
}

export class QuestionOption
{
    // tslint:disable-next-line:variable-name
    option_id: number;
    // tslint:disable-next-line:variable-name
    option_name: string;
    // tslint:disable-next-line:variable-name
    is_deleted: boolean;

    constructor(params: any)
    {
        this.option_id = params.option_id;
        this.option_name = params.option_name;
        this.is_deleted = params.is_deleted || false;
    }
}
