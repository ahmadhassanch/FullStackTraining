import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { AudioRecorderComponent } from './audio-recorder.component';
import { MaterialModule } from '../../../material.module';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        
        MaterialModule,
        HttpClientModule
    ],
    declarations: [
        AudioRecorderComponent
    ],
    exports: [
        AudioRecorderComponent
    ],
    entryComponents: [AudioRecorderComponent]
})
export class AudioRecorderModule { }
