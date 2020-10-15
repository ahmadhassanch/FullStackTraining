import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { FormGroup } from '@angular/forms';
import { FormBuilder } from '@angular/forms';
import { FormControl } from '@angular/forms';

import * as dateFns from 'date-fns';

import { FormField } from '../../../models/general-models';
import { ChiConfigService } from '../../../services';


@Component({
    selector:'chi-advance-filter',
    templateUrl:'./advance_filter.html',
    styleUrls:['./advance_filter.scss']
})
export class PatientGeneralAdvanceFilterComponent implements OnInit
{

    @Input() inDailog: boolean;
    @Input() title: string;
    @Input() flex: any;
    @Input() slug: any;
    @Input() data: any;
    @Input() columns: any;

    theForm: FormGroup;
    start_date: FormField;
    end_date: FormField;
    birth_date: FormField;

    currentDate: any;
    model: any;
    hideFiled: boolean;
    @Output() onFilterData: EventEmitter<any>;
    @Output() close: EventEmitter<any>;
    
    constructor(private _fb:FormBuilder,
            private dialogRef:MatDialogRef<PatientGeneralAdvanceFilterComponent>,
            private _configService: ChiConfigService)
    {
        this.theForm = this._fb.group({});
        this.data = null;

        this.start_date = new FormField({ name: 'from', title: 'From', type: 'date'});
        this.end_date = new FormField({ name: 'to', title: 'To',type: 'date'});
        this.birth_date = new FormField({ name: 'birth_date', title: 'DOB',type: 'date'});

        this.currentDate = new Date().getTime() / 1000;
        this.inDailog = false;
        this.title = 'Advance Search';
        this.flex = 32;
        this.slug = null;
        this.hideFiled = false;

        this.onFilterData = new EventEmitter();
        this.close = new EventEmitter();

        this.model = {
            first_name: {name: 'first_name', op: 'like'},
            last_name: {name: 'last_name', op: 'like'},
            extra_name: {name: 'extra_name', op: 'like'},
            email: {name: 'user.email', op: 'like'},
            username: {name: 'user.username', op: 'like'},
            hospital_no: {name: 'hospital_no', op: 'like'},
            mobile_phone: {name: 'mobile_phone', op: 'like'},
            birth_date: {name: 'birth_date', op: 'gt'},
            nic: {name: 'nic', op: 'like'},
            age: {name: 'age', op: 'eq'},
            episode_status: {name: 'episode_status', op: 'eq'},
            start_date: {name: 'start_date', op: 'gt'},
            end_date: {name: 'end_date', op: 'lt'},
            operator: {name: 'operator', op: 'lt'}
        };

        this.columns = {
            first_name: true,
            last_name: true,
            extra_name: true,
            email: true,
            username: true,
            hospital_no: true,
            mobile_phone: true,
            birth_date: true,
            nic: true,
            age: true,
            episode_status: true,
            start_date: true,
            end_date: true,
            operator: true
        };
    }

    ngOnInit()
    {
        this.theForm.addControl('first_name', new FormControl(null, []));
        this.theForm.addControl('last_name', new FormControl(null, []));
        this.theForm.addControl('extra_name', new FormControl(null, []));
        this.theForm.addControl('email', new FormControl(null, []));
        this.theForm.addControl('username', new FormControl(null, []));
        this.theForm.addControl('hospital_no', new FormControl(null, []));
        this.theForm.addControl('mobile_phone', new FormControl(null, []));
        this.theForm.addControl('birth_date', this.birth_date.formControl);
        this.theForm.addControl('nic', new FormControl(null, []));

        this.theForm.addControl('age', new FormControl(null, []));
        this.theForm.addControl('operator', new FormControl('lt', []));
        this.theForm.addControl('episode_status', new FormControl(null, []));
        this.theForm.addControl('start_date',this.start_date.formControl);
        this.theForm.addControl('end_date',this.end_date.formControl);

        if (this.data != null && this.data != void 0) 
        {
            this.theForm.patchValue(this.data);
        }

        if (this.slug) 
        {
            for(var key in this.model) {
                this.model[key]['name'] = this.slug+"."+this.model[key]['name'];
            }
        }

        this.theForm.valueChanges.subscribe(formValue=> {
            this.data = formValue;
        });

        if (this._configService.getIsSecurityEnabled() || this._configService.isAnonymousUser())
        {
            this.hideFiled = true;
        }
        else
        {
            this.hideFiled = false;
        }
    }

    onApplyFilters()
    {
        let formData: any = this.theForm.value;

        if (this.inDailog) 
        {
            let wh: any = null;
            if (this.checkFormData())
                wh = this.getWhere();

            this.dialogRef.close({where: wh, data: this.data, haveData: this.checkFormData()});
        }

        else
        {
            let form: any = Object.assign({}, formData);
            if (formData['birth_date'] != null && formData['birth_date'] != '')
            {
                form['dob_from'] = this._getTime(dateFns.startOfYear(new Date(formData['birth_date'] * 1000)));
                form['dob_to'] = this._getTime(dateFns.endOfYear(new Date(formData['birth_date'] * 1000)));
            }

            let data: any = null;
            if (this.checkFormData())
                data = form;

            this.onFilterData.emit({data: data, haveData: this.checkFormData()});
        }
    }

    onClearFilter()
    {
        this.theForm.reset();
        this.data = this.theForm.value;  
    }

    onCancel() 
    {
        if (this.inDailog) 
        {
            this.dialogRef.close(null);
        }

        else 
        {
            this.close.emit(true);
        }
    }

    private _getTime(date: Date)
    {
        let timestamp = date.getTime()/1000;
        timestamp = Math.floor(timestamp);
        return timestamp;
    }

    getWhere() 
    {
        let formData: any = this.theForm.value;
        this.data = Object.assign({}, formData);
        let children: any[] = [];

        for(var key in formData) 
        {
            if (formData[key]  !== null && formData[key] != '') 
            {
                let colName: string = this.model[key]['name'];
                let op: string = this.model[key]['op'];
                
                if (key === 'birth_date') {
                    this.theForm.controls.operator.setValue('eq');
                    children.push(this.getDateOfBirthWhere(formData['birth_date'], colName))
                }

                else if (key === 'age') {
                    
                    const currentDate = dateFns.startOfDay(new Date());
                    let dob = dateFns.addYears(currentDate, -formData[key]);

                    children.push(this.getDateOfBirthWhere(this._getTime(dob), this.model['birth_date']['name']));
                }

                else if (key !== 'operator') {
                    children.push({column: colName, search: [formData[key]], op: op})
                }
            }
        }

        let where: any = {'group': 'or', 'children' : children}

        return where;
    }

    getDateOfBirthWhere(val: number, colName: string) 
    {
        let where: any = null;
        let opt: any = this.theForm.controls.operator.value;
        let op: string = 'eq';

        if (opt == 'lt') 
            op = 'gt';
        else if (opt == 'le')
            op = 'ge';
        else if (opt == 'gt')
            op = 'lt';
        else if (opt == 'ge')
            op = 'le';
        
        if (opt !== 'eq' && opt !== 'ne') 
        {
            where = {column: colName, search: val, op: op};
        }

        else {

            if (opt === 'eq') 
            {
                where = {
                    'group': 'and', 
                    'children': [
                        {column: colName, search: this._getTime(dateFns.startOfYear(new Date(val * 1000))), op: 'ge'},
                        {column: colName, search: this._getTime(dateFns.endOfYear(new Date(val * 1000))), op: 'le'}
                    ]
                };
            }

            else if (opt === 'ne') 
            {
                where = {
                    'group': 'or', 
                    'children': [
                        {column: colName, search: this._getTime(dateFns.startOfYear(new Date(val * 1000))), op: 'le'},
                        {column: colName, search: this._getTime(dateFns.endOfYear(new Date(val * 1000))), op: 'ge'}
                    ]
                };
            }
        }
        
        
        return where;
    }

    checkFormData(): boolean
    {
        let haveData: boolean = false;
        let formData: any = this.theForm.value;

        for (let key in formData) 
        {
            if (key !== 'operator') 
            {
                if ((formData[key] !== null && formData[key] != '')) 
                {
                    haveData = true;
                }
            }
        }

        return haveData;
    }

    isVisible(key: string)
    {
        return this.columns[key];
    }
}