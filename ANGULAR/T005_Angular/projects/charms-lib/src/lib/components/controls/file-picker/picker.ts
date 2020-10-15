import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ViewChild } from '@angular/core';
import { Self } from '@angular/core';
import { Optional } from '@angular/core';
import { HostBinding } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';

import { NgControl } from '@angular/forms'
import {coerceBooleanProperty} from '@angular/cdk/coercion';

import { MatInput } from '@angular/material/input';
import { MatFormFieldControl } from '@angular/material/form-field';
import { MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { FileDropzoneDialogComponent } from '../image-picker/file-dropzone';
import { FormField } from '../../../models/general-models';



@Component({
    selector: 'chi-file-picker',
    templateUrl: './picker.html',
    styleUrls: ['./picker.scss'],
    providers: [
        {provide: MatFormFieldControl, useExisting: ChiFilePickerComponent}
    ]
})
export class ChiFilePickerComponent implements OnInit, OnDestroy, OnChanges, MatFormFieldControl<string>
{

    constructor(private _cd: ChangeDetectorRef, @Optional() @Self() public ngControl: NgControl, private dialog: MatDialog)
    {
    }

    get value(): string | null
    {
        return this.myInput.value;
    }

    set value(val: string | null)
    {
        console.log('Set Value = ', val);
        this.myInput.value = '' + val;
        this.stateChanges.next();
    }

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
        return false;
        // return this.focused || !this.empty;
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


    get errorState()
    {
        return this.myInput.errorState;
    }
    static nextId = 0;

    _previousValue: any;

    @HostBinding()
    id = `chi-date-picker-${ChiFilePickerComponent.nextId++}`;

    @Input() type: string;
    @Input() field: FormField = null;

    @Output() selected: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild(MatInput) myInput: MatInput;


    stateChanges = new Subject<void>();
    selectedOption: any;

    url: any = null;
    private _disabled = false;

    @HostBinding('attr.aria-describedby') describedBy = '';

    ngOnInit()
    {
        this._cd.detectChanges();

        this.field.formControl.statusChanges.subscribe(s =>
        {
            this.stateChanges.next();
        });
    }


    ngOnChanges(changes: SimpleChanges)
    {
        if (changes.disabled)
        {
            this.stateChanges.next();
        }

        // this.myInput.updateErrorState();

        // const newValue = this.field.formControl.value;
        // if (this._previousValue !== newValue)
        // {
        //     this._previousValue = newValue;
        //     this.stateChanges.next();
        // }
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
        // console.log('-- Container Clicked --');
    }

    updateErrorState()
    {
        this.myInput.updateErrorState();
        this.stateChanges.next();
    }

    openDropzone(): void
    {
        const dialogRef = this.dialog.open(FileDropzoneDialogComponent, {width: '60vw', maxHeight: '60vh'});
        dialogRef.componentInstance.maxFiles = 1;
        dialogRef.componentInstance.allowedFileTypes = ['png', 'jpeg', 'pdf', 'docx', 'odt'];

        dialogRef.afterClosed().subscribe((resp) =>
        {
            if (resp)
            {
                this.url = resp;
                this.selected.emit(resp.data.file_url);
            }
        });

    }

    onClear(): void
    {
        this.url = null;
        this.selected.emit(null);
    }
}