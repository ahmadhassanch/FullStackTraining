import {Component, ViewChild, AfterViewInit, ElementRef} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';



import { RECAPTCHA_SERVICE_PROVIDER } from '../../core/captcha/captcha.service';
import { ReCaptchaComponent } from '../../core/captcha/captcha.component';
import { GOOGLE_SITE_KEY } from '../../site_key';
import { AuthApiService } from '../../service/auth.service';
import { RVAlertsService } from 'dist/charms-lib';


@Component({
    templateUrl: './forgot-password.component.html',
    providers: [RECAPTCHA_SERVICE_PROVIDER, AuthApiService],
    styleUrls    : ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements AfterViewInit
{
    @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;
    forgotForm: FormGroup;
    btnDisable: boolean;
    baseUrl: string;
    googleSiteKey: string;
    @ViewChild('inputUsername') inputUsername: ElementRef;
    protected options: any;

    authError: any = null;

    constructor(
        private authService: AuthApiService,
        private formBuilder: FormBuilder,
        public http: HttpClient)
    {
        this.baseUrl = '/auth';
        this.forgotForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            captcha: ['', [Validators.required]],
        });

        this.googleSiteKey = GOOGLE_SITE_KEY;

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

        this.forgotForm.valueChanges.subscribe(response => {
            this.authError = null;
        });
    }

    captchaResponse(ev: any): void
    {
        this.forgotForm.controls.captcha.setValue(ev);
    }

    ngAfterViewInit(): void
    {
        setTimeout(() => {
            this.inputUsername.nativeElement.focus();
        }, 500);
    }

    onForgot(): void
    {
        this.btnDisable = true;
        const token = this.captcha.getResponse();
        if (this.forgotForm.controls.captcha.value !== token)
        {
            RVAlertsService.error('Forgot Password', 'Please prove that you are human.');
            this.captcha.reset();
            this.forgotForm.controls.captcha.setValue(null);
            this.btnDisable = false;
            return;
        }

        console.log('Forgot-> ', this.forgotForm.value)
        this.doForgot(this.forgotForm.value).then(response =>
        {
            this.btnDisable = false;
            if (response.Status === 'Ok')
            {
                // RVAlertsService.success('Forgot Password', 'You will receive an email with a password reset code shortly.');
                this.onGoLocation('reset-password');
                this.captcha.reset();
            }
            else
            {
                this.forgotForm.get('username').setErrors({error: true});
                const error = response.ErrorMessage;
                this.authError = error;
                // RVAlertsService.error('Error Forgot Password', response.ErrorMessage);
                this.captcha.reset();
            }

        }).catch(this.handleApiError);
    }

    doForgot(postData: any): Promise<any>
    {
        const forgotdata =
        {
            username: postData.username,
            captcha: postData.captcha
        };

        return this.http.post<any>(this.baseUrl + '/ForgotPassword', forgotdata, this.options)
            .toPromise().then((response: HttpResponse<any>) =>
            {
                console.log('Forgot response-> ', response);

                const result: any = response.body;
                return result;
            }).catch(this.handleError);
    }

    onGoLocation(path: string): void
    {
        window.location.href = '/' + path;
    }

    private handleError(error: any): Promise<any>
    {
        // RVAlertsService.error('Error', error.toString());
        return Promise.reject(error);
    }

    public handleApiError(error: any)
    {
        // RVAlertsService.error('Error', error.toString());
    }
}
