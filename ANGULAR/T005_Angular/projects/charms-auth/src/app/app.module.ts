import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';

// Main components
import { AppRoutingModule } from './app.routes';
import { AppComponent } from './app.component';
import { AuthModule } from './pages/auth.module';
import { AuthApiService } from './service/auth.service';


@NgModule({
    bootstrap: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,

        FormsModule,
        ReactiveFormsModule,

        HttpClientModule,
        FlexLayoutModule,

        AppRoutingModule,

        AuthModule
    ],
    declarations: [
        AppComponent,

    ],
    providers: [
        AuthApiService
    ]
})
export class AppModule { }

