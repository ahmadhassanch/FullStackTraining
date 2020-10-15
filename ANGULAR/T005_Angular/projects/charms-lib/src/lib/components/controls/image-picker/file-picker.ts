import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { OnChanges } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { MatDialogRef } from '@angular/material/dialog';
import { ApiService } from '../../../services';
import { RVAlertsService } from '../../../components/alerts/alerts.service'


@Component({
    selector   : 'file-picker',
    templateUrl: './file-picker.html',
    styleUrls  : ['./file-picker.scss'],
})
export class FilePickerComponent implements OnChanges, OnInit
{
    pageSize: number;
    pageSizeOptions: number[];

    title: any;
    inDialog: boolean;
    user_files: any[];

    // config: TableConfig;
    total_records = 0;
    limit = 10;
    offset = 0;
    controlType: string;
    allowedTypes: any[];
    fileTag: string;
    maxFiles: number;
    selectedFile: any;
    fileType: string;

    constructor(private dialogRef: MatDialogRef<FilePickerComponent>, protected apiService: ApiService)
    {
        this.apiService.apiSlug = "user_files";
        this.apiService.primaryKey = "file_id";

        this.title = 'Image Picker';
        this.controlType = 'image',
         this.allowedTypes = ['*'];
         this.maxFiles = 1;
         this.selectedFile = null;
         this.fileType = 'File';

         this.pageSize = 25;
         this.pageSizeOptions = [10, 25, 50, 100];
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

        this.user_files = [];
        this.getUserFiles();
    }

    ngOnChanges(): void
    {
    }

    getUserFiles()
    {
        const postData = {
            columns: ['file_id', 'file_name', 'file_url'],
            limit: this.limit,
            offset: this.offset
        };

        this.apiService.getList(postData).then(resp =>
        {
            this.user_files = resp.data.data;
            this.total_records = resp.data.total_records;
        }, (error: any) =>
        {
            RVAlertsService.error('Error Loading Data', error.toString());
        });
    }

    onRemove(oid: any)
    {
        this.apiService.doDelete({oid: oid}).then(resp =>
            {
               this.selectedFile = null;
               this.getUserFiles();
            }, (error: any) =>
            {
                RVAlertsService.error('Error Loading Data', error.toString());
            });

    }

    onCancel(): void
    {
        this.dialogRef.close();
    }

    onPageChange(e: PageEvent)
    {
        this.limit = e.pageSize;
        this.offset = (e.pageSize * e.pageIndex);
        this.getUserFiles();
    }

    onFileSelected(file) {
        this.selectedFile = file;
    }

    onFileUpload(event: any): void
    {
        // this.getUserFiles();
        // this.selectedFile = event.data.file_url;
    }

    onUpdateFiles(files: any[])
    {
        console.log('onUpdateFiles', files);
        this.getUserFiles();
    }

    onFileUploaded(e: any)
    {
        console.log('Uploaded File Response =>', e);
    }

    // onDeleteFile(file: any)
    // {
    //     this.onRemove(file[0].file_id);
    // }

    onSelect()
    {
        // console.log('onSelect', this.selectedFile);
        this.dialogRef.close(this.selectedFile);
    }
}
