import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Routes } from '@angular/router';
import { RouterModule } from '@angular/router';

// Main components


import { AlertsModule, MaterialModule } from 'dist/charms-lib';
import { HeaderComponent } from './header/header.component';
import { SelfSignUpComponent } from './self_signup/self_signup.component';
import { VerifyEmailComponent } from './verify_email/verify_email.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot/forgot-password.component';
import { ResetPasswordComponent } from './reset/reset-password.component';
import { VerificationStatusComponent } from './verification_status/verification_status.component';
import { AppLinksComponent } from './apps_link/app.links.component';
import { ReCaptchaComponent } from '../core/captcha/captcha.component';

export const routes: Routes = [
    { path: 'signup', component: SelfSignUpComponent },

    { path: '', component: LoginComponent },

    { path: 'verify_email', component: VerifyEmailComponent },
    { path: 'verified', component: VerificationStatusComponent },

    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },

    { path: '**', redirectTo: '', pathMatch: 'full' },

];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,

        HttpClientModule,
        FlexLayoutModule,

        MaterialModule,
        AlertsModule,

        RouterModule.forChild(routes),
    ],
    declarations: [

        HeaderComponent,
        SelfSignUpComponent,
        VerifyEmailComponent,

        ReCaptchaComponent,

        LoginComponent,
        ForgotPasswordComponent,
        ResetPasswordComponent,

        VerificationStatusComponent,
        AppLinksComponent
    ],
    entryComponents: [
        AppLinksComponent
    ]
})
export class AuthModule { }

