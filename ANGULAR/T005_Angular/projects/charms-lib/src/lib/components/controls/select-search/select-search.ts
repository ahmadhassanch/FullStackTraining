import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewChild } from '@angular/core';
import { forwardRef } from '@angular/core';
import { Optional } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Inject } from '@angular/core';
import { QueryList } from '@angular/core';


import { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/core';

import { A, Z, ZERO, NINE, SPACE } from '@angular/cdk/keycodes';
import { Subject } from 'rxjs';
import { delay, take, takeUntil, debounceTime } from 'rxjs/operators';
import { FormField } from '../../../models/general-models';


@Component({
    selector: 'chi-select-search',
    templateUrl: './select-search.html',
    styleUrls: ['./select-search.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => SelectSearchComponent),
        multi: true
    }],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SelectSearchComponent implements OnInit, OnDestroy, AfterViewInit, ControlValueAccessor
{

    /** Current search value */
    get value(): string {
        return this._value;
    }


    constructor(@Inject(MatSelect) public matSelect: MatSelect,
        private changeDetectorRef: ChangeDetectorRef,
        @Optional() @Inject(MatOption) public matOption: MatOption = null)
    {
    }
    @Input() field: FormField;
    @Input() placeholderLabel = 'Search';

    /** Label to be shown when no entries are found. Set to null if no message should be shown. */
    @Input() noEntriesFoundLabel = 'No result found!';

    /**
      * Whether or not the search field should be cleared after the dropdown menu is closed.
      * Useful for server-side filtering. See [#3](https://github.com/bithost-gmbh/ngx-chi-select-search/issues/3)
      */
    @Input() clearSearchInput = true;

    /** Disables initial focusing of the input field */
    @Input() disableInitialFocus = false;

    @Output() search = new EventEmitter<any>();
    @Output() advanceSearch = new EventEmitter<any>();

    /** Reference to the search input field */
    @ViewChild('searchSelectInput', { read: ElementRef }) searchSelectInput: ElementRef;

    /** Reference to the search input field */
    @ViewChild('innerSelectSearch', { read: ElementRef }) innerSelectSearch: ElementRef;
    private _value: string;

    /** Reference to the MatSelect options */
    public _options: QueryList<MatOption>;

    /** Previously selected values when using <mat-select [multiple]="true">*/
    private previousSelectedValues: any[];

    /** Whether the backdrop class has been set */
    private overlayClassSet = false;

    /** Event that emits when the current value changes */
    private change = new EventEmitter<string>();

    /** Subject that emits when the component has been destroyed. */
    // tslint:disable-next-line: member-ordering
    private _onDestroy = new Subject<void>();
    private _onSearchChange= new Subject<void>();

    onChange: Function = (_: any) => { };
    onTouched: Function = (_: any) => { };

    ngOnInit()
    {
        // set custom panel class
        const panelClass = 'chi-select-search-panel';
        if (this.matSelect.panelClass)
        {
            if (Array.isArray(this.matSelect.panelClass))
            {
                this.matSelect.panelClass.push(panelClass);
            }
            else if (typeof this.matSelect.panelClass === 'string')
            {
                this.matSelect.panelClass = [this.matSelect.panelClass, panelClass];
            }
            else if (typeof this.matSelect.panelClass === 'object')
            {
                this.matSelect.panelClass[panelClass] = true;
            }
        }
        else
        {
            this.matSelect.panelClass = panelClass;
        }

        // set custom mat-option class if the component was placed inside a mat-option
        if (this.matOption)
        {
            this.matOption.disabled = true;
            this.matOption._getHostElement().classList.add('contains-chi-select-search');
        }

        // when the select dropdown panel is opened or closed
        this.matSelect.openedChange.pipe(delay(1), takeUntil(this._onDestroy)).subscribe((opened) =>
        {
            if (opened)
            {
                // focus the search field when opening
                this.getWidth();
                if (!this.disableInitialFocus)
                {
                    this._focus();
                }
            }
            else
            {
                // clear it when closing
                if (this.clearSearchInput)
                {
                    this._reset();
                }
            }
        });

        // set the first item active after the options changed
        this.matSelect.openedChange.pipe(take(1)).pipe(takeUntil(this._onDestroy)).subscribe(() =>
        {
            this._options = this.matSelect.options;
            this._options.changes.pipe(takeUntil(this._onDestroy)).subscribe(() =>
            {
                const keyManager = this.matSelect._keyManager;
                if (keyManager && this.matSelect.panelOpen)
                {
                    // avoid "expression has been changed" error
                    setTimeout(() =>
                    {
                        keyManager.setFirstItemActive();
                        this.getWidth();
                    }, 1);
                }
            });
        });

        // detect changes when the input changes
        this.change.pipe(takeUntil(this._onDestroy)).subscribe(() =>
        {
            this.changeDetectorRef.detectChanges();
        });

        this.initMultipleHandling();


        this._onSearchChange.pipe(takeUntil(this._onDestroy), debounceTime(300)).subscribe(value =>
        {
            this.search.emit(value);
        });
    }

    ngOnDestroy()
    {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    ngAfterViewInit()
    {
        this.setOverlayClass();


        // update view when available options change
        this.matSelect.openedChange.pipe(take(1), takeUntil(this._onDestroy)).subscribe(() =>
        {
            this.matSelect.options.changes.pipe(takeUntil(this._onDestroy)).subscribe(() =>
            {
                this.changeDetectorRef.markForCheck();
            });
        });
    }

    /**
     * Handles the key down event with MatSelect.
     * Allows e.g. selecting with enter key, navigation with arrow keys, etc.
     * @param event
     */
    _handleKeydown(event: KeyboardEvent):boolean
    {
        // Prevent propagation for all alphanumeric characters in order to avoid selection issues
        if ((event.key && event.key.length === 1) ||
            (event.keyCode >= A && event.keyCode <= Z) ||
            (event.keyCode >= ZERO && event.keyCode <= NINE) ||
            (event.keyCode === SPACE))
        {
            event.stopPropagation();
        }
        if(this.field.searchType ==='alpha'){
            const key = event.keyCode;
            return ((key >= 65 && key <= 90) || key == 8 || key === 9);
        }
        return true;
    }


    writeValue(value: string)
    {
        const valueChanged = value !== this._value;

        if (valueChanged)
        {
            this._value = value;
            this.change.emit(value);
        }
    }

    onInputChange(value: any)
    {
        const valueChanged = value !== this._value;
        if (valueChanged)
        {
            this.initMultiSelectedValues();
            this._value = value;
            this.onChange(value);
            this.change.emit(value);

            this._onSearchChange.next(value);
        }
    }

    onBlur(value: string)
    {
        this.writeValue(value);
        this.onTouched();
    }

    registerOnChange(fn: Function)
    {
        this.onChange = fn;
    }

    registerOnTouched(fn: Function)
    {
        this.onTouched = fn;
    }

    /**
     * Focuses the search input field
     */
    public _focus()
    {
        if (!this.searchSelectInput || !this.matSelect.panel)
        {
            return;
        }

        // save and restore scrollTop of panel, since it will be reset by focus()
        // note: this is hacky
        const panel = this.matSelect.panel.nativeElement;
        const scrollTop = panel.scrollTop;

        // focus
        this.searchSelectInput.nativeElement.focus();

        panel.scrollTop = scrollTop;
    }

    /**
     * Resets the current search value
     * @param focus whether to focus after resetting
     */
    public _reset(focus?: boolean)
    {
        if (!this.searchSelectInput)
        {
            return;
        }

        this.searchSelectInput.nativeElement.value = '';
        this.onInputChange('');

        if (focus)
        {
            this._focus();
        }
    }

    /**
     * Sets the overlay class  to correct offsetY
     * so that the selected option is at the position of the select box when opening
     */
    private setOverlayClass()
    {
        if (this.overlayClassSet)
        {
            return;
        }

        const overlayClasses: string[] = ['cdk-overlay-pane-select-search'];

        if (!this.matOption)
        {
            // add offset to panel if component is not placed inside mat-option
            overlayClasses.push('cdk-overlay-pane-select-search-with-offset');
        }

        // tslint:disable-next-line: deprecation
        this.matSelect.overlayDir.attach.pipe(takeUntil(this._onDestroy)).subscribe(() =>
        {
            // note: this is hacky, but currently there is no better way to do this
            let element: HTMLElement = this.searchSelectInput.nativeElement;
            let overlayElement: HTMLElement;
            // tslint:disable-next-line: no-conditional-assignment
            while (element = element.parentElement)
            {
                if (element.classList.contains('cdk-overlay-pane'))
                {
                    overlayElement = element;
                    break;
                }
            }

            if (overlayElement)
            {
                overlayClasses.forEach(overlayClass =>
                {
                    overlayElement.classList.add(overlayClass);
                });
            }
        });

        this.overlayClassSet = true;
    }


    /**
     * Initializes handling <mat-select [multiple]="true">
     * Note: to improve this code, mat-select should be extended to allow disabling resetting the selection while filtering.
     */
    private initMultipleHandling()
    {
        // if <mat-select [multiple]="true">
        // store previously selected values and restore them when they are deselected
        // because the option is not available while we are currently filtering
        this.matSelect.valueChange
            .pipe(takeUntil(this._onDestroy))
            .subscribe((values) => {
                if (this.matSelect.multiple) {
                    let restoreSelectedValues = false;
                    if (this._value && this._value.length
                        && this.previousSelectedValues && Array.isArray(this.previousSelectedValues)) {
                        if (!values || !Array.isArray(values)) {
                            values = [];
                        }
                        const optionValues = this.matSelect.options.map(option => option.value);
                        this.previousSelectedValues.forEach(previousValue => {
                            if (values.indexOf(previousValue) === -1 && optionValues.indexOf(previousValue) === -1) {
                                // if a value that was selected before is deselected and not found in the options, it was deselected
                                // due to the filtering, so we restore it.
                                values.push(previousValue);
                                restoreSelectedValues = true;
                            }
                        });
                    }

                    if (restoreSelectedValues) {
                        this.matSelect._onChange(values);
                    }

                    this.previousSelectedValues = values;
                }
            });
    }

    /**
     *  Set the width of the innerSelectSearch to fit even custom scrollbars
     *  And support all Operation Systems
     */
    private getWidth()
    {
        if (!this.innerSelectSearch || !this.innerSelectSearch.nativeElement)
        {
            return;
        }

        let element: HTMLElement = this.innerSelectSearch.nativeElement;
        let panelElement: HTMLElement;
        // tslint:disable-next-line: no-conditional-assignment
        while (element = element.parentElement)
        {
            if (element.classList.contains('mat-select-panel'))
            {
                panelElement = element;
                break;
            }
        }

        if (panelElement)
        {
            this.innerSelectSearch.nativeElement.style.width = panelElement.clientWidth + 'px';
        }
    }

    /**
     *  Initialize this.previousSelectedValues once the first filtering occurs.
     */
    initMultiSelectedValues(): void
    {
        if (this.matSelect.multiple && !this._value)
        {
            this.previousSelectedValues = this.matSelect.options
                .filter(option => option.selected)
                .map(option => option.value);
        }
    }

    onAdvanceSearch(): void
    {
        this.advanceSearch.emit({ advanceSearch: true });
    }
}
