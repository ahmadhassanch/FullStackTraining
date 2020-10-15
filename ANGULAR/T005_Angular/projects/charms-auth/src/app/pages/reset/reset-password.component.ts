import {Component, ViewChild, TemplateRef, AfterViewInit, ElementRef} from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


import { RECAPTCHA_SERVICE_PROVIDER } from '../../core/captcha/captcha.service';
import { ReCaptchaComponent } from '../../core/captcha/captcha.component';
import { GOOGLE_SITE_KEY } from '../../site_key';
import { AuthApiService } from '../../service/auth.service';
import { RVAlertsService } from 'dist/charms-lib';


@Component({
    templateUrl: './reset-password.component.html',
    styleUrls    : ['./reset-password.component.scss'],
    providers: [RECAPTCHA_SERVICE_PROVIDER, AuthApiService]

})
export class ResetPasswordComponent implements AfterViewInit
{
    resetForm: FormGroup;
    btnDisable: boolean;
    baseUrl: string;
    emailError: any;
    codeError: any;
    @ViewChild('authTabs') authTabs: TemplateRef<any>;
    @ViewChild('inputEmail') inputEmail: ElementRef;
    @ViewChild('inputPassword') inputPassword: ElementRef;
    @ViewChild('inputCode') inputCode: ElementRef;
    @ViewChild(ReCaptchaComponent) captcha: ReCaptchaComponent;

    protected options: any;
    authError: string = null;
    googleSiteKey: any;
    hidePassword: boolean;

    constructor(private formBuilder: FormBuilder,
            public http: HttpClient,
            private authService: AuthApiService)
    {
        this.baseUrl = '/auth';
        this.googleSiteKey = GOOGLE_SITE_KEY;
        this.resetForm = this.formBuilder.group({
            username: ['', [Validators.required]],
            code: ['', [Validators.required, Validators.minLength(6)]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            captcha: ['', [Validators.required]],
            // confirmPassword: ['', [Validators.required]]
        });

        this.emailError = null;
        this.codeError = null;

        this.resetForm.get('username').valueChanges.subscribe(response => {
            this.emailError = null;
        });
        this.resetForm.get('code').valueChanges.subscribe(response => {
            this.codeError = null;
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

        this.resetForm.valueChanges.subscribe(response => {
            this.authError = null;
        });

        this.hidePassword = true;
    }

    ngAfterViewInit(): void{
        setTimeout(() => {
            this.inputEmail.nativeElement.focus();
        }, 500);
    }

    captchaResponse(ev: any): void {
        this.resetForm.controls.captcha.setValue(ev);
    }

    verifyCode(): void
    {
        const token = this.captcha.getResponse();
        if (this.resetForm.controls.captcha.value !== token) {
            RVAlertsService.error('Forgot Password', 'Please prove that you are human.');
            this.captcha.reset();
            this.resetForm.controls.captcha.setValue(null);
            return;
        }

        this.btnDisable = true;
        this.doVerifyCode(this.resetForm.value).then(response =>
        {
            this.btnDisable = false;
            if (response.Status === 'Ok')
            {
                this.onReset();
                this.captcha.reset();
            }
            else
            {
                this.captcha.reset();
                const error = response.ErrorMessage;
                if (response.ErrorCode === -1)
                {
                    this.resetForm.get('username').setErrors({
                        error: true
                    });
                    this.emailError = error;
                    setTimeout(() => {
                        this.inputEmail.nativeElement.focus();
                    }, 300);
                }
                else if (response.ErrorCode === 104 || response.ErrorCode === 105)
                {
                    this.resetForm.get('code').setErrors({
                        error: true
                    });
                    this.codeError = error;
                    setTimeout(() => {
                        this.inputCode.nativeElement.focus();
                    }, 300);
                }
            }

        }).catch(this.handleApiError);


        // this.authService.post('/VerifyCode', this.resetForm.value).then( (resp: any) => {

        //     this.btnDisable = false;
        //     this.onReset();
        //     this.captcha.reset();

        //     console.log('Status ok-> ', resp)

        // },(error: any) => {
        //     console.log('Status error-> ', error)
        //     this.captcha.reset();

        //     if (error.ErrorCode === -1)
        //     {
        //         this.resetForm.get('username').setErrors({
        //             error: true
        //         });
        //         this.emailError = error;
        //         setTimeout(() => {
        //             this.inputEmail.nativeElement.focus();
        //         }, 300);
        //     }
        //     else if (error.ErrorCode === 104 || error.ErrorCode === 105)
        //     {
        //         this.resetForm.get('code').setErrors({
        //             error: true
        //         });
        //         this.codeError = error;
        //         setTimeout(() => {
        //             this.inputCode.nativeElement.focus();
        //         }, 300);
        //     }
        // })
    }

    doVerifyCode(postData: any): Promise<any>
    {
        return this.http.post<any>(this.baseUrl + '/VerifyCode', postData, this.options)
        .toPromise().then((response: HttpResponse<any>) =>
        {
            const result: any = response.body;
            return result;
        }).catch(this.handleError);
    }

    onReset(): void
    {
        this.btnDisable = true;
        this.doReset(this.resetForm.value).then(response =>
        {
            this.btnDisable = false;
            if (response.Status === 'Ok')
            {
                // RVAlertsService.success('Reset Password', 'Successfull');
                this.onGoLocation('login');
            }
            else
            {
                // RVAlertsService.error('Error Reset Password', response.ErrorMessage);
                this.resetForm.get('username').setErrors({error: true});
                const error = response.ErrorMessage;
                this.authError = error;
                this.captcha.reset();
            }

        }).catch(this.handleApiError);

        // this.authService.post('/ResetPassword', this.resetForm.value).then( (resp: any) => {

        //     this.btnDisable = false;
        //     this.onGoLocation('login');

        //     console.log('Status ok-> ', resp)

        // },(error: any) => {
        //     console.log('Status error-> ', error)
        //     this.resetForm.get('username').setErrors({error: true});
        //     this.authError = error.ErrorMessage;
        // })
    }

    doReset(postData: any): Promise<any>
    {
        return this.http.post<any>(this.baseUrl + '/ResetPassword', postData, this.options)
        .toPromise().then((response: HttpResponse<any>) =>
        {
            const result: any = response.body;
            return result;
        }).catch(this.handleError);
    }

    onGoLocation(path: string): void{
        window.location.href = '/' + path;
    }

    private handleError(error: any): Promise<any>
    {
        this.captcha.reset();
        return Promise.reject(error);
    }

    public handleApiError(error: any)
    {
        this.captcha.reset();
        // RVAlertsService.error('Error', error.toString());
    }
}
