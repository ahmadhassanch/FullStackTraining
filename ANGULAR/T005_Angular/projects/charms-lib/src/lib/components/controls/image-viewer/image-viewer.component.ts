import { Component } from '@angular/core';
import { OnInit } from '@angular/core';

import { MatDialogRef } from '@angular/material/dialog';


@Component({
    selector: 'image-viewer',
    templateUrl: './image-viewer.component.html',
    styleUrls: ['./image-viewer.component.scss']
})
export class ImageViewerComponent implements OnInit
{
    isPersonImage: boolean = false;
    FileUrl: any;
    isZoomed: boolean;
    isMultiple: boolean;
    currentImage: string;

    idx: number;

    constructor(private dialogRef: MatDialogRef<ImageViewerComponent>)
    {
        this.FileUrl = '';
        this.isZoomed = false;
        this.isMultiple = false;

        this.idx = 0;
    }

    ngOnInit(): void
    {
        if (this.FileUrl == null)
        {
            this.FileUrl = '/assets/images/no_image.png';

            if (this.isPersonImage)
            {
                this.FileUrl = '/assets/images/avatar.jpg';
            }
        }

        if (this.isMultiple)
        {
            console.log(this.FileUrl);
            this.currentImage = this.FileUrl[this.idx];
        }
    }

    zoomImage()
    {
        this.isZoomed = !this.isZoomed;
    }

    closeDialog(): void
    {
        this.dialogRef.close();
    }

    onPrevious()
    {
        this.idx--;
        this.currentImage = this.FileUrl[this.idx];
    }

    onNext()
    {
        this.idx++;
        this.currentImage = this.FileUrl[this.idx];
    }

}
