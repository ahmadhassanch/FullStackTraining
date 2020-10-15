import { Component, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse, HttpHeaders } from '@angular/common/http';

import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { AuthApiService } from '../../service/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { AppLinksComponent } from '../apps_link/app.links.component';
import { RVAlertsService } from 'dist/charms-lib';


@Component({
    templateUrl: './login.component.html',
    styleUrls    : ['./login.component.scss']
})
export class LoginComponent implements AfterViewInit
{
    protected options: any;

    loginForm: FormGroup;
    btnDisable = false;
    baseUrl: string;
    client: any;

    authError: string;
    multipleCompanies = false;
    hidePassword: boolean;
    userCompanies = [];

    constructor(private authService: AuthApiService,
        private formBuilder: FormBuilder,
        private http: HttpClient,
        private _changeDetectorRef: ChangeDetectorRef,
        private dialog: MatDialog)
    {
        this.baseUrl = '/auth';
        this.client = new ClientJS();

        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            password: ['', [Validators.required]],
        });

        const r = document.cookie.match('\\b'+name+'=([^;]*)\\b');
        if (r)
        {
            const headers = new HttpHeaders({'X-XSRFToken': r[1]});
            this.options = {observe: 'response', headers};
        }
        else
        {
            this.options = {observe: 'response'};
        }

        this.authError = null;

        this.loginForm.valueChanges.subscribe(response => {
            this.authError = null;
        });

        this.hidePassword = true;
    }

    ngAfterViewInit(): void
    {
        this._changeDetectorRef.detectChanges();
    }

    onLogin(): void
    {
        this.btnDisable = true;
        const authdata = this.loginForm.value;

        authdata.device_id = this.client.getFingerprint();
        authdata.device_name = this.client.getBrowser();
        authdata.device_model = this.client.getBrowserVersion();
        authdata.os_name = this.client.getOS();
        authdata.os_version = this.client.getOSVersion();
        authdata.pn_type = 'Web';
        authdata.pn_token = '';
        authdata.app_version = '2.1.1';

        console.log('headers-> ', this.options)

        this.http.post<any>(this.baseUrl + '/Login', authdata, this.options).subscribe((response: HttpResponse<any>) =>
        {
            if (localStorage.getItem(window.origin+'_masterTab'))
            {
                localStorage.removeItem(window.origin+'_masterTab');
            }

            const result = response.body as any;

            if (result.Status === 'Ok')
            {
                this.authError = null;
                window.location.href = result.data.redirect_url;
            }
            else
            {
                this.btnDisable = false;
                this.loginForm.get('password').setErrors({error: true});
                const error = result.ErrorMessage;
                this.authError = error;
            }

        }, (err: HttpErrorResponse) =>
        {
            this.loginForm.get('password').setErrors({error: true});
            this.btnDisable = false;
            this.authError = err.message;
        });

        // this.authService.post('/Login', authdata).then( (resp: any) => {

        //     this.btnDisable = false;
        //     this.authError = null;
        //     window.location.href = resp.data.redirect_url;

        //     console.log('Status ok-> ', resp)

        // },(error: any) => {
        //     console.log('Status error-> ', error)
        //     this.loginForm.get('password').setErrors({error: true});
        //     this.btnDisable = false;
        //     this.authError = error.ErrorMessage;
        // })
    }

    private handleError(error: any): Promise<any>
    {
        return Promise.reject(error);
    }

    public handleApiError(error: any)
    {
        this.btnDisable = false;
        RVAlertsService.error('Error', error.toString());
    }

    onDownloadApps()
    {
        const dialoRef = this.dialog.open(AppLinksComponent, {
            width: '80vw',
            maxWidth: '80vw',
            panelClass: 'full-dialog-container-auth',
            position: {
                left: '15vw'
            }
        });
    }

    getValidity()
    {
        return (this.loginForm.controls.username.value !== '' && this.loginForm.controls.password.value !== '');
    }
}
