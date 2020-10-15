import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Input } from '@angular/core';

import { HttpResponse } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { MatDialogRef } from '@angular/material/dialog';

import { RVAlertsService } from '../../../components/alerts/alerts.service'
import { GenericApiResponse } from '../../../models';


declare var window: any;


@Component({
    selector: 'file-dropzone',
    templateUrl: './file-dropzone.html',
    styleUrls: ['./file-dropzone.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FileDropzoneDialogComponent implements OnInit
{
    options: any;
    headers: any;
    config: DropzoneConfigInterface;

    selectedFile: any;
    selectedFileId: any;

    @Input() controlType: 'image' | 'audio' | 'video' | 'application' | '';
    @Input() allowedFileTypes: any[];
    @Input() fileTag: string = null;

    @Input() maxFiles: number;

    @Input() resetOnUpload: boolean;

    @Output() uploaded: EventEmitter<any>;
    @Output() updatedFiles: EventEmitter<any>;

    private files: File[];
    url: any;

    constructor(public http: HttpClient, private dialogRef: MatDialogRef<FileDropzoneDialogComponent>)
    {
        this.uploaded = new EventEmitter();
        this.updatedFiles = new EventEmitter();

        this.selectedFile = null;
        this.config = {addRemoveLinks: true, dictRemoveFile: 'Remove'};

        this.controlType = '';
        this.allowedFileTypes = ['*'];
        this.maxFiles = 1;

        this.resetOnUpload = false;
        this.files = [];

        this.headers = null;

        const r = document.cookie.match("\\b"+name+"=([^;]*)\\b");
        if (r)
        {
            const headers = new HttpHeaders({'X-XSRFToken': r[1]});
            this.options = {observe: 'response', headers: headers};
        }
        else
        {
            this.options = {observe: 'response'};
        }
    }

    ngOnInit(): void
    {
        this.config.url = this.fileUrl + '/Upload';
        this.config.maxFilesize = 50;

        let str = '';
        if (this.controlType !== '')
        {
            for (const type of this.allowedFileTypes)
            {
                str += this.controlType + '/' + type + ',';
            }
        }
        else
        {
            for (const type of this.allowedFileTypes)
            {
                str += '.' + type + ',';
            }
        }

        this.config.acceptedFiles = str;
        this.config.params = {'UserFile': ''};
        this.config.maxFiles = this.maxFiles;
        // this.config.thumbnailWidth = 250;
        // this.config.thumbnailHeight = 250;
    }

    get fileUrl(): string {
        return window.app_config.file_url;
    }

    onUploadSuccess(event): void
    {
        // console.log('onUploadSuccess', event.data);
        const file = event.data[0];
        console.log("File picker file response",file)
        const response = event.data[1];
        console.log("File picker onUpload response",response)

        this.uploaded.emit(response);

        if (this.maxFiles === 1) {
            this.selectedFileId = response.data.file_id;
            this.selectedFile = file;
            // console.log('onUploadSuccess: ', this.selectedFile);
        }

        if (this.resetOnUpload) {
            event.dropzone.removeFile(event.data[0]);
        }
        else
        {
            console.log('File Resp = ', response);

            file.file_id = response.data.file_id;
            this.files.push(file);
            // this.updatedFiles.emit(this.files);
            this.closeDropzone(response);
            // this.url = response.data.file_url;
        }
    }

    onUploadError(event: any): void {
        console.log('onUploadError', event.data);
        // this.uploaded.emit(event.data[1].data);
    }

    onSending(event: any): void
    {
        // console.log('onSending', event.data);
        const file = event.data[0];
        event.data[2].append('UserFile', file);
        event.data[2].append('FileTag', this.fileTag);

        if (this.maxFiles === 1) {
            this.selectedFile = file;
        }
    }

    onRemoveFile(event: any): void
    {
        if (!this.resetOnUpload) {
            // console.log('onRemoveFile', event.data);

            this.files = this._without(this.files, event.data);

            const response = event.data.xhr.response;
            const file_id = JSON.parse(response).data.file_id;

            this.doDelete({oid: file_id}).then(result =>
            {
                if (result.Status === 'Ok')
                {
                    this.updatedFiles.emit(this.files);
                }
                else
                {
                    let msg = 'Error occurred deleting image(s)<br/>Error Message: <b>' + result.ErrorMessage + '</b>';
                    RVAlertsService.error('Error Deleting Image(s)', msg);
                }
            });
        }

        if (this.maxFiles === 1 && this.selectedFile === event.data) {
            this.selectedFile = null;
            this.selectedFileId = null;
            // console.log('onRemoveFile: ', this.selectedFile);
        }
    }

    onAddFile(event: any): void
    {
        // console.log('onAddFile', event.data);
        if (this.selectedFile != null) {
            event.dropzone.removeFile(this.selectedFile);
        }
    }

    private _without(list, rejectedItem) {
        return list.filter(function (item) {
            return item !== rejectedItem;
        }).map(function (item) {
            return item;
        });
    }

    // onSelectFile(event): void
    // {
    //     this.dialogRef.close(this.selectedFile);
    // }

    onDeleteFile(file_id: any): void
    {
        this.doDelete({oid: file_id}).then(result =>
        {
            if (result.Status === 'Ok')
            {

                // console.log('Deleted');
                // SweetAlerts.success("Delete Image", "Selected image(s) have been deleted").catch();
            }
            // else
            // {
                // let msg = 'Error occurred deleting image(s)<br/>Error Message: <b>' + result.ErrorMessage + '</b>';
                // SweetAlerts.error('Error Deleting Image(s)', msg).catch();
            // }
        });
    }

    public doDelete(postData: any): Promise<GenericApiResponse>
    {
        return this.http.post<GenericApiResponse>(this.fileUrl + '/Delete', postData, this.options)
        .toPromise().then((response: HttpResponse<GenericApiResponse>) =>
        {
            const result: GenericApiResponse = response.body;
            return result;
        }).catch();
    }

    closeDropzone(url: any): void
    {
        this.dialogRef.close(url);
    }


    // logData(): void
    // {
    //    console.log('Uploader => ', this.uploader);
    //    console.log('filesArray => ', this.filesArray);
    // }

    // getImageSource(resp): string
    // {
    //    if(resp == '' || resp == void 0 || resp == null)
    //    {
    //        return '';
    //    }
    //    else
    //    {
    //         console.log('getImageSource => ', JSON.parse(resp));
    //         let data = JSON.parse(resp);
    //         return data.data.file_url;
    //    }
    // }
}
