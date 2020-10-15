import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { DropzoneModule } from '../dropzone/dropzone.module';

import { FileDropzoneComponent } from './file-dropzone';
import { FileDropzoneDialog } from './file-dropzone.dialog';
import { MaterialModule } from '../../../../material.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule, ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
    DropzoneModule
  ],
  declarations: [
    FileDropzoneComponent,
    FileDropzoneDialog
  ],
  exports: [
    FileDropzoneComponent,
    FileDropzoneDialog
  ],
  entryComponents: [
    FileDropzoneDialog
]
})
export class FileDropzoneModule {}
