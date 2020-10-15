import { Component } from '@angular/core';
import { Input } from '@angular/core';
import { HostListener } from '@angular/core';
import { OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms'
import { RVAlert, RVAlertAction } from './alerts.common';


@Component({
    selector: 'rv-alerts',
    templateUrl: './alerts.component.html',
    styleUrls: ['./alerts.component.scss'],

})
export class AlertComponent implements OnInit
{
    @Input() alert: RVAlert;

    theForm: FormGroup;
    isConfirm = false;
    showInput = false;

    constructor(private dialogRef: MatDialogRef<AlertComponent>, private _fb: FormBuilder)
    {
        this.theForm = _fb.group({
            input: new FormControl(),
        });
    }

    ngOnInit(): void
    {
        if (this.alert.required)
            this.theForm.controls.input.setValidators([Validators.required, Validators.minLength(3)]);
        else
            this.theForm.controls.input.setValidators(null);

        this.isConfirm = this.alert.type === 'confirm' || this.alert.type === 'confirmWithInput';
        this.showInput = this.alert.type === 'confirmWithInput';
    }

    @HostListener('window:keyup.esc') onKeyUp(): void
    {
        this.onNegative();
    }

    @HostListener('window:keyup.enter') onKeyUp2(): void
    {
        if (this.theForm.invalid) return;
        this.onPositive();
    }

    onPositive(): void
    {
        let r = new RVAlertAction(this.alert, true);

        if (this.alert.type === 'confirmWithInput')
            r = new RVAlertAction(this.alert, true, this.theForm.controls.input.value);

        this.dialogRef.close(r);
    }

    onNegative(): void
    {
        const r = new RVAlertAction(this.alert, false);

        this.dialogRef.close(r);
    }

    close(): void
    {
        this.dialogRef.close();
    }
}