import { Component } from '@angular/core';
import { forwardRef } from '@angular/core';
import { OnInit } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { AfterViewInit } from '@angular/core';


import { ControlValueAccessor } from '@angular/forms';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

import { MatDialog } from '@angular/material/dialog';
import { FilePickerComponent } from '../file-picker';

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => ImagePickerElComponent),
    multi: true
};

const noop = () => {};

@Component({
    selector: 'chi-image-picker-el',
    templateUrl: 'form.component.html',
    styleUrls: ['form.component.scss'],
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class ImagePickerElComponent implements OnInit, ControlValueAccessor, AfterViewInit
{

    @Input() formControlName: any;
    @Input() width: any;
    @Input() height: number;
    @Input() placeholder: string = '';
    @Input() placeHolderImage: boolean = false;

    @Output() onSelectionChange = new EventEmitter<any>();

    previewSrc: string;

    // The internal data model
    private innerValue: any = '';

    // placeholders for the callbacks which are later providesd
    // by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: any) => void = noop;

    private column: any;

    constructor(private elmement: ElementRef, private dialog: MatDialog)
    {
        this.column = elmement.nativeElement.getAttribute('formControlName');

        this.placeholder = "Select picture";
        this.width = "100%";
        this.height = 64;
    }

    ngOnInit(): void
    {
    }

    ngAfterViewInit(): void
    {
    }

    previewImage(): string
    {
        let src = this.value;
        if (src === void 0 || src === null || src == '')
        {
            if (this.placeHolderImage === true)
                src = '/assets/images/no_image.png';
            else
                src = '/assets/images/avatar.jpg';
        }

        return src;
    }

    onPickerClick(): void
    {
        let dialogRef = this.dialog.open(FilePickerComponent);
        dialogRef.afterClosed().subscribe(result =>
        {
            console.log('image picker el result-> ', result)
        });
    }

    // get accessor
    get value(): any {
        return this.innerValue;
    };

    // set accessor including call the onchange callback
    set value(v: any)
    {
        if (v !== this.innerValue)
        {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    // From ControlValueAccessor interface
    writeValue(v: any)
    {
        if (v !== this.innerValue)
        {
            this.value = v;
        }
    }

    // From ControlValueAccessor interface
    registerOnChange(fn: any) 
    {
        this.onChangeCallback = fn;
    }

    // From ControlValueAccessor interface
    registerOnTouched(fn: any) 
    {
        this.onTouchedCallback = fn;
    }
}