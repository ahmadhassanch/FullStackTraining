import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { OnInit } from '@angular/core';
import { ElementRef } from '@angular/core';
import { AfterViewInit } from '@angular/core';

import { MatDialog, MatDialogRef } from '@angular/material/dialog';


@Component({
    templateUrl: './file-dropzone.dialog.html',
    styleUrls: ['./file-dropzone.scss'],
    encapsulation: ViewEncapsulation.None
})
// tslint:disable-next-line:component-class-suffix
export class FileDropzoneDialog implements OnInit, AfterViewInit {

    fromMessage: boolean;
    selectedFiles: any[];

    controlType: 'image' | 'audio' | 'video' | 'application' | '';
    allowedFileTypes: any[];
    fileTag: string = 'Other';

    fileType: string;
    inDialog: boolean;
    maxFileSize: number;
    maxFileHeight: number;
    maxFileWidth: number;

    constructor( private elRef: ElementRef, public dialogRef: MatDialogRef<FileDropzoneDialog>, protected dialog: MatDialog)
    {
        this.controlType = '';
        this.allowedFileTypes = ['jpg', 'png', 'jpeg'];

        this.fileType = 'File';
        this.selectedFiles = [];
        this.inDialog = false;
        this.fromMessage = false;
        this.maxFileSize = 50;
        this.maxFileHeight = null;
        this.maxFileWidth = null;
    }

    ngAfterViewInit(): void
    {
        this.elRef.nativeElement.parentElement.classList.add('custom-dialog-container');
    }

    ngOnInit(): void
    {
        switch (this.controlType) {
            case 'image': this.fileType = 'Image'; break;
            case 'application': this.fileType = 'Document'; break;
            case 'audio': this.fileType = 'Audio'; break;
            case 'video': this.fileType = 'Video'; break;

            default: this.fileType = 'File'; break;
        }
    }

    onUpdateFiles(files: any[]) {
        this.selectedFiles = files;
    }

    onClose(): void
    {
        this.dialogRef.close(null);
    }

    onSelect(): void
    {
        this.dialogRef.close(this.selectedFiles);
    }

}
