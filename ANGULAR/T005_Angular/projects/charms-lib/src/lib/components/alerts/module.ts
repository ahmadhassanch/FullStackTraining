import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../material.module';

import { AlertComponent } from './alerts.component';


@NgModule({
    declarations: [
      AlertComponent
    ],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MaterialModule,
        CommonModule
    ],
    exports: [
        AlertComponent
    ],
    entryComponents: [
        AlertComponent
    ]
})
export class AlertsModule { }
