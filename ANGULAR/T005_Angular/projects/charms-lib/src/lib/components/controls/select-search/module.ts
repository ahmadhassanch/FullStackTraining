import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from '../../../material.module';
import { SelectSearchComponent } from './select-search';


@NgModule({
    imports: [
        CommonModule,
        MaterialModule
    ],
    declarations: [
        SelectSearchComponent
    ],
    exports: [
        SelectSearchComponent
    ]
})
export class SelectSearchModule { }
