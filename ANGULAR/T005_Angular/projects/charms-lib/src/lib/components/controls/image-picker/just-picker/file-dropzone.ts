import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { Output } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { Input } from '@angular/core';


import { HttpResponse } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { DropzoneConfigInterface } from 'ngx-dropzone-wrapper';
import { GenericApiResponse } from '../../../../models';
import { RVAlertsService } from '../../../../components/alerts/alerts.service'

declare var window: any;


@Component({
    selector: 'cg-file-dropzone',
    templateUrl: './file-dropzone.html',
    styleUrls: ['./file-dropzone.scss'],
    encapsulation: ViewEncapsulation.None
})
export class FileDropzoneComponent implements OnInit
{
    @Input() controlType: 'image' | 'audio' | 'video' | 'application' | '';
    @Input() allowedFileTypes: any[];
    @Input() fileTag: string = null;

    @Input() maxFiles: number;

    @Input() resetOnUpload: boolean;
    @Input() maxFileSize: number;
    @Input() maxFileWidth: number;
    @Input() maxFileHeight: number;

    @Output() uploaded: EventEmitter<any>;
    @Output() updatedFiles: EventEmitter<any>;

    options: any;
    headers: any;
    config: DropzoneConfigInterface;

    selectedFile: any;
    selectedFileId: any;

    private files: File[];

    constructor(public http: HttpClient)
    {
        this.uploaded = new EventEmitter();
        this.updatedFiles = new EventEmitter();

        this.selectedFile = null;
        this.config = {addRemoveLinks: true, dictRemoveFile: 'Remove'};

        this.controlType = '';
        this.allowedFileTypes = ['jpeg', 'png'];
        this.maxFiles = 1;
        this.maxFileSize = 50;

        this.resetOnUpload = false;
        this.files = [];

        this.headers = null;
        this.options = {headers: this.headers, observe: 'response'};
    }

    ngOnInit(): void
    {
        this.config.url = this.fileUrl + '/Upload';
        this.config.maxFilesize = this.maxFileSize;

        this.config.accept = (file, done) => 
        {
            setTimeout(() => {
                let newFile = JSON.parse(JSON.stringify(file));

                if (this.maxFileWidth != null && this.maxFileHeight != null)
                {
                    if (newFile['width'] > this.maxFileWidth || newFile['height'] > this.maxFileHeight) 
                    {
                        console.error('Invalid File Dimensions.');
                        done("Invalid dimensions!");
                    }
                    else {
                        done();
                    }
                }
                else
                {
                    done();
                }
            }, 100);
        }


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
    }

    get fileUrl(): string {
        return window.app_config.file_url;
    }

    emitFiles(files: any[]) {
        const _files = [];
        for (const file of files) {
            const fileData = file.xhr.response;
            const _file = JSON.parse(fileData).data;
            _files.push(_file);
        }
        this.updatedFiles.emit(_files);
    }

    onUploadSuccess(event): void
    {
        // console.log('onUploadSuccess', event.data);
        const file = event.data[0];
        const response = event.data[1];

        this.uploaded.emit(response);

        if (this.maxFiles === 1) {
            this.selectedFileId = response.data.file_id;
            this.selectedFile = file;
            // console.log('onUploadSuccess: ', this.selectedFile);
        }

        if (this.resetOnUpload) {
            event.dropzone.removeFile(event.data[0]);
        }
        else {

            file.file_id = response.data.file_id;
            this.files.push(file);

            this.emitFiles(this.files);
        }
    }

    onUploadError(event): void {
        console.log('onUploadError', event.data);
        // this.uploaded.emit(event.data[1].data);
    }

    onSending(event): void
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
            this.files = this._without(this.files, event.data);

            let response;
            if (event.data.xhr)
            {
                response = event.data.xhr.response;
            }

            if (response)
            {
                const file_id = JSON.parse(response).data.file_id;

                this.doDelete({oid: file_id}).then(result =>
                {
                    if (result.Status === 'Ok')
                    {
                        this.emitFiles(this.files);
                    }
                    else
                    {
                        let msg = 'Error occurred deleting image(s)<br/>Error Message: <b>' + result.ErrorMessage + '</b>';
                        RVAlertsService.error('Error Deleting Image(s)', msg);
                    }
                });
            }
        }

        if (this.maxFiles === 1 && this.selectedFile === event.data) {
            this.selectedFile = null;
            this.selectedFileId = null;
            // console.log('onRemoveFile: ', this.selectedFile);
        }
    }

    onAddFile(event): void
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
}
