import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../../material.module';
import { CGCalendarComponent } from './calendar.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    
    MaterialModule
  ],
  declarations: [
    CGCalendarComponent
  ],
  exports: [
    CGCalendarComponent
],
})
export class CGCalendarModule { }
