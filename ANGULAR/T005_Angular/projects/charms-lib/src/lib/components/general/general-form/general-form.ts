import { Component } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Input } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { Output } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { OnChanges } from '@angular/core';
import { SimpleChanges } from '@angular/core';

import { FormGroup, Validators } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormControl } from '@angular/forms';

import { Platform } from '@angular/cdk/platform';

import { Subject } from 'rxjs';

import { ApiService } from '../../../services';
import { RVAlertsService } from '../../alerts/alerts.service';
import { GenericApiResponse } from '../../../models';
import { FormConfig, FormField, ScrollOptions, FormSection } from '../../../models/general-models';



@Component({
    selector: 'chi-general-form',
    templateUrl: './general-form.html',
    styleUrls: ['./general-form.scss'],
    providers: [ApiService]
})
export class GeneralFormComponent implements OnInit, OnChanges, OnDestroy, AfterViewInit
{
    @Input() config: FormConfig;
    @Input() theForm: FormGroup;
    @Input() actions: Subject<any>;
    @Input() oid: any;

    @Input() foreignKey: string;
    @Input() foreignKeyVal: any;

    @Output() signals = new EventEmitter<any>();

    formFields: FormField[];
    formFieldsDict: any;
    formSections: FormGroup;

    psOptions: ScrollOptions;

    disableSaveBtn = false;
    isMobile: boolean;

    data: any;

    constructor(
        private apiService: ApiService,
        private _fb: FormBuilder,
        private cdr: ChangeDetectorRef,
        private _platform: Platform)
    {
        this.config = null;
        this.actions = null;
        this.oid = null;
        this.isMobile = false;

        this.psOptions = new ScrollOptions();

        this.theForm = this._fb.group({});
        this.formFields = [];
        this.formFieldsDict = {};
        this.formSections = null;
        this.data = null;

        this.theForm.valueChanges.subscribe((value: any) =>
        {
            if (this.theForm.dirty)
            {
                this.signals.emit({type: 'ValueChange', data: value});
            }
        });
    }

    ngOnInit(): void
    {
        this.apiService.apiSlug = this.config.slug;
        this.apiService.primaryKey = this.config.key;

        this.psOptions.suppressScrollX = this.config.suppressScrollX === true ? true : false;
        this.psOptions.suppressScrollY = this.config.suppressScrollY === true ? true : false;

        if ( this._platform.ANDROID || this._platform.IOS )
        {
            this.isMobile = true;
        }

        this.config.columns.forEach((dc: FormField) =>
        {
            if (!dc.exclude)
            {
                let field: FormField;
                // const field: FormField = dc.formControl === void 0 ? new FormField(dc) : dc;

                if (dc.formControl === void 0)
                {
                    field = new FormField(dc);

                    if (dc.minLength != null)
                    {
                        field.formControl.setValidators(field.formControl.validator ? [field.formControl.validator, Validators.minLength(dc.minLength)] : [Validators.minLength(dc.minLength)]);
                    }

                    if (dc.maxLength != null)
                    {
                        field.formControl.setValidators(field.formControl.validator ? [field.formControl.validator, Validators.maxLength(dc.maxLength)] : [Validators.maxLength(dc.maxLength)]);
                    }
                }
                else
                {
                    field = dc;
                }

                this.theForm.addControl(field.name, field.formControl);
                this.formFields.push(field);
                this.formFieldsDict[field.name] = field;
            }
        });

        if (this.config.sections.length > 0)
        {
            this.formSections = this._fb.group({});
            this.theForm.addControl('sections', this.formSections);
        }

        this.config.sections.forEach((sec: FormSection) =>
        {
            if (sec.conditional)
            {
                const nameKey = sec.key + '_cond';
                const field: FormField = new FormField({ name: nameKey, type: 'switch', title: sec.cond_title, default: true});
                this.theForm.addControl(field.name, field.formControl);

                this.formFields.push(field);

                this.theForm.get(nameKey).valueChanges.subscribe(r =>
                {
                    if (r)
                    {
                        this.formSections.addControl(sec.key, this._fb.group(sec.section_model));
                        sec.enable();
                    }
                    else
                    {
                        this.formSections.removeControl(sec.key);
                        sec.disable();
                    }

                    // this.cdr.detectChanges();
                });
            }

            sec.columns.forEach((dc: FormField) =>
            {
                if (!dc.exclude)
                {
                    const field: FormField = new FormField(dc);

                    this.theForm.addControl(field.name, field.formControl);
                    this.formFields.push(field);
                    this.formFieldsDict[field.name] = field;

                    sec.controls.push(field.formControl);
                }
            });

            this.formSections.addControl(sec.key, this._fb.group(sec.section_model));

        });

        if (this.foreignKey != null)
        {
            const fc: FormControl = this.formFieldsDict[this.foreignKey].formControl;
            fc.setValue(this.foreignKeyVal);

            if (this.oid == null)
                fc.markAsDirty();
        }

        if(this.oid != null)
            this.loadFormData();
    }

    ngOnChanges(changes: SimpleChanges): void
    {
        if (changes.oid && changes.oid.firstChange)
            return;

        if(this.oid != null)
            this.loadFormData();
        else
            this.theForm.reset();
    }

    ngOnDestroy(): void
    {
    }

    ngAfterViewInit()
    {
        this.cdr.detectChanges();
    }

    get formTitle(): string
    {
        return (this.oid == null ? 'Add ' : 'Edit ') + this.config.title;
    }

    loadFormData()
    {
        this.theForm.reset();
        this.theForm.disable();

        const cols = [];
        this.formFields.forEach((f: FormField) =>
        {
            if (!f.name.endsWith('_cond'))
                cols.push(f.name);
        });

        const postData = {oid: this.oid, columns: cols};


        this.apiService.getSingle(postData).then(response =>
        {
            this.data = response.data;
            this.theForm.patchValue(response.data);
            this.theForm.enable();

        }, (error: any) =>
        {
            this.disableSaveBtn = false;
            this.theForm.enable();

            RVAlertsService.apiError('Error Loading Form Data', error);
        });

    }

    onForeignSelected(e: any, field: FormField)
    {
        if (field.foreign.setOnSelect === void 0)
            return;

        field.foreign.setOnSelect.forEach(c =>
        {
            if (this.formFieldsDict[c])
            {
                const f:FormField = this.formFieldsDict[c];
                f.formControl.setValue(e[c]);
            }
        });
    }

    onDateSelected(e: any, field: FormField): void
    {
        field.formControl.markAsDirty();
        field.formControl.setValue(e);
    }

    onSave()
    {
        this.submitForm(true);
    }

    onSaveAndNew()
    {
        this.submitForm(false);
    }

    onCancel()
    {
        const d = { type: 'CloseForm' };
        this.signals.emit(d);
    }

    getDirtyValues(form: any)
    {
        const dirtyValues = {};

        Object.keys(form.controls).forEach(key =>
        {
            const currentControl = form.controls[key];

            if (currentControl.dirty || key === 'sections')
            {
                if (currentControl.controls)
                {
                    // dirtyValues[key] = this.getDirtyValues(currentControl);
                    dirtyValues[key] = this.getSectionValues(currentControl);
                }
                else
                    dirtyValues[key] = currentControl.value;
            }
        });

        return dirtyValues;
    }

    getSectionValues(form: any)
    {
        const dirtyValues = {};

        Object.keys(form.controls).forEach(key =>
        {
            const currentControl = form.controls[key];

            dirtyValues[key] = currentControl.value;

            if (key === 'sections')
            {
                dirtyValues[key] = this.getSectionValues(currentControl);
            }
            else
            {
                dirtyValues[key] = currentControl.value;
            }
        });

        return dirtyValues;
    }

    submitForm(close: boolean)
    {
        this.disableSaveBtn = true;
        this.theForm.disable();

        // const formData = this.getDirtyValues(this.theForm);
        const formData = this.theForm.value;

        if (this.config.query_params != null)
        {
            formData.query_params = this.config.query_params;
        }

        let endPoint = this.apiService.apiSlug + '/Create';
        if (this.oid != null)
        {
            endPoint = this.apiService.apiSlug + '/Update';
            formData[this.apiService.primaryKey] = this.oid;
        }

        this.apiService.post(endPoint, formData).then((r) =>
        {
            this.disableSaveBtn = false;
            this.theForm.enable();

            this.actions.next({ action: 'reload' });
            this.theForm.reset();

            if (close)
            {
                const d = { type: 'CloseForm' };
                this.signals.emit(d);
            }
            else
            {
                this.oid = null;
            }

            // this.onApiResponse(r, close)

        }, (error: GenericApiResponse) =>
        {
            RVAlertsService.apiError('Error Saving Data', error).subscribe(res => {
                this.disableSaveBtn = false;
                this.theForm.enable();
            });
        });
    }

    doTranslation(colName: any, value: any)
    {
        // if (this.oid !== null)
        // {
        //     let val = this.apiService.apiSlug+"."+colName+"."+this.data[this.apiService.primaryKey];
        //     this._commonService.doTranslation(val, value);
        // }

        // else
        // {
        //     RVAlertsService.info('Transaltion', 'You cannot add translation until you have saved the record');
        // }
    }
}
