import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';

import { MatDialogRef } from '@angular/material/dialog';

import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
    MaterialModule,
    FuseModule, FuseProgressBarModule, FuseSharedModule, FuseSidebarModule,
    ApiService, ChiConfigService, chiConfigFactoryProvider
} from 'charms-lib';

import { fuseConfig } from './core/fuse-config';
import { LayoutModule } from './core/layout/layout.module';
import { AppRoutesGuard } from './app.routes.guard';



@NgModule({
    declarations: [
        AppComponent
  ] ,
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        AppRoutingModule,

        MaterialModule,

        // Firebase
        AngularFireMessagingModule,
        AngularFireModule.initializeApp({
            apiKey: 'AIzaSyCzccDH9YwSSDO7xla-hJwkfmLf0OkuCP4',
            projectId: 'chi-project-949d3',
            messagingSenderId: '338947069833',
            authDomain: "chi-project-949d3.firebaseapp.com",
            databaseURL: "https://chi-project-949d3.firebaseio.com",
            storageBucket: "chi-project-949d3.appspot.com",
            appId: "1:338947069833:web:275916f8b756d5941b7358"
        }),

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,

        LayoutModule
    ],
    providers: [
        ApiService,
        {
            provide: MatDialogRef,
            useValue: {}
        },
        ChiConfigService, AppRoutesGuard,
        {
            provide: APP_INITIALIZER,
            useFactory: chiConfigFactoryProvider,
            deps: [ChiConfigService],
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
