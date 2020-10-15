import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpResponse, HttpClient } from '@angular/common/http';


import { RVAlertsService } from 'dist/charms-lib';

import { ReCaptchaService } from '../../core/captcha/captcha.service';
import { ReCaptchaComponent } from '../../core/captcha/captcha.component';
import { GOOGLE_SITE_KEY } from '../../site_key';


@Component({
    templateUrl: './self_signup.component.html',
    styleUrls: ['./self_signup.component.scss'],
    providers: [ReCaptchaService]
})

export class SelfSignUpComponent implements OnInit
{
    theForm: FormGroup;
    formSubmit = false;

    _captcha: any;
    @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

    googleSiteKey: any;

    protected options: any;
    client: any;

    companyTypes = [];

    signupError = null;


    constructor(private _router: Router, public http: HttpClient)
    {
        this.theForm = new FormGroup({
            company_name: new FormControl('',Validators.required),
            company_type_id: new FormControl('', Validators.required),
            first_contact: new FormControl('', Validators.required),
            // second_contact: new FormControl('', Validators.required),
            email: new FormControl('', [Validators.required, Validators.email]),
            mobile: new FormControl('', Validators.required),
            password: new FormControl('', Validators.required),
            confirmPassword: new FormControl('', Validators.required),
            accept_terms: new FormControl(false, [(control) => { return !control.value ? { required: true } : null; }])
        });

        this._captcha = null;
        this.googleSiteKey = GOOGLE_SITE_KEY;

        this.options = {observe: 'response'};
        this.client = new ClientJS();
    }

    ngOnInit(): void
    {
        const postData = {
            columns: ['company_type_id', 'company_type_name']
        }

        this.getCompanyTypes(postData).then(response =>
        {
            if (response.Status === 'Ok')
            {
                this.companyTypes = response.data;
            }
            else
            {
                RVAlertsService.error(response.Status, response.ErrorMessage);
            }
        }).catch(this.handleApiError)
        {
            this.formSubmit = false;
        }
    }


    get first_contact() {return this.theForm.get('first_contact');}
    // get second_contact() {return this.theForm.get('second_contact');}
    get email() {return this.theForm.get('email');}
    get password() {return this.theForm.get('password');}
    get confirmPassword() {return this.theForm.get('confirmPassword');}
    get mobile() {return this.theForm.get('mobile');}
    get accept_terms() {return this.theForm.get('accept_terms');}
    get company_name() {return this.theForm.get('company_name');}
    get company_slug() {return this.theForm.get('company_slug');}
    get company_type_id() {return this.theForm.get('company_type_id');}

    onSubmit()
    {
        this.formSubmit = true;
        const token = this.captcha.getResponse();

        if (this._captcha !== token)
        {
            this.captcha.reset();
            this.formSubmit = false;
            return;
        }

        const authdata = this.theForm.value;
        const email = this.email.value.split('@');

        authdata.username = email[0];
        authdata.device_id = this.client.getFingerprint();
        authdata.device_name = this.client.getBrowser();
        authdata.device_model = this.client.getBrowserVersion();
        authdata.os_name = this.client.getOS();
        authdata.os_version = this.client.getOSVersion();
        authdata.pn_type = 'Web';
        authdata.pn_token = '';
        authdata.app_version = '2.1.1';


        this.doSignUp(authdata).then(response =>
        {
            if (response.Status === 'Ok')
            {
                this.formSubmit = false;
                this._router.navigateByUrl('/verify_email?email=' + this.email.value);
            }
            else
            {
                this.formSubmit = false;
                // RVAlertsService.error(response.Status, response.ErrorMessage);
                this.signupError = response.ErrorMessage;
            }
        }).catch(this.handleApiError)
        {
            this.formSubmit = false;
            // console.error('Come Here');
        }
    }

    captchaResponse(ev: any): void
    {
        this._captcha = ev;

    }

    doSignUp(postData: any): Promise<any>
    {
        return this.http.post<any>('/api/auth/Signup', postData, this.options)
        .toPromise().then((response: HttpResponse<any>) =>
        {
            const result: any = response.body;
            return result;
        }).catch(this.handleError);
    }

    getCompanyTypes(data: any): Promise<any>
    {
        return this.http.post<any>('/api/auth/CompanyTypes', data, this.options)
        .toPromise().then((response: HttpResponse<any>) =>
        {
            const result: any = response.body;
            return result;
        }).catch(this.handleError);
    }


    public handleApiError(error: any)
    {
        this.signupError = error.ErrorMessage;
        // RVAlertsService.error(error.Status, error.ErrorMessage);
        // SweetAlerts.error('Error', error.toString());
    }

    private handleError(error: any): Promise<any>
    {
        return Promise.reject(error);
    }

}
