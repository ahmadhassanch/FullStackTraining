import { Component, Input } from '@angular/core';
import { OnInit } from '@angular/core';
import { Output } from '@angular/core';
import { EventEmitter } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';


import { MatDialog } from '@angular/material/dialog';

import { RVAlertsService } from '../../alerts/alerts.service';
import { HttpClient } from '@angular/common/http';
import { HttpHeaders } from '@angular/common/http';


declare const recorder: any;

@Component({
    selector: 'audio-recorder',
    templateUrl: 'audio-recorder.component.html',
})
export class AudioRecorderComponent implements OnInit
{
    @Input() isPrimaryIcon: boolean;

    @Output() onUpload: EventEmitter<any>;
    @Output() onStatusChange: EventEmitter<any>;
    @Output() recordingStatus: EventEmitter<any>;

    isRecording: boolean;
    timer: any;
    duaration: any;

    constructor(protected cdRef: ChangeDetectorRef, protected http: HttpClient, protected dialog: MatDialog)
    {
        this.isRecording = false;
        this.isPrimaryIcon = false;
        this.timer = null;
        this.duaration = 0;
        this.onUpload = new EventEmitter();
        this.onStatusChange = new EventEmitter();
        this.recordingStatus = new EventEmitter();
    }

    ngOnInit(): void
    {

    }

    get isRecorderAvailable() {
        if (recorder != null) {
            return true;
        }

        return false;
    }

    _dataURLtoFile (dataurl, filename?)
    {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    }

    startRecording(ev:  any) {
        recorder.start().then(() => {
            // something else
            this.onStatusChange.emit('Recording ...');
            this.isRecording = true;
            this.getDuration();
            this.recordingStatus.emit(this.isRecording);
    
        }).catch((e) => {
            console.error(e);
        });
    }

    stopRecording(ev: any) {

        recorder.stop().getMp3().then(([buffer, blob]) => {
            // do what ever you want with buffer and blob
            // Example: Create a mp3 file and play    
            this.isRecording = false;
            this.clearTimer();
            this.recordingStatus.emit(this.isRecording);

            const file = new File(buffer, 'audio.mp3', {
                type: blob.type,
                lastModified: Date.now()
            });

            this.uploadFile(file);
        });
    }

    uploadFile(file: File) {
        this.onStatusChange.emit('Uploading ...');
        this.cdRef.detectChanges();

        let content = new FormData();
        content.append('UserFile', file, 'audio.mp3');
        let url: string = '/api/user_files/Upload';

        const headers = new HttpHeaders()
        headers.set('Accept', '*/*');

        const r = document.cookie.match("\\b"+name+"=([^;]*)\\b");
        if (r) {
            headers.set('X-XSRFToken', r[1]);
        }

        const options = {
            headers: headers
        }

        this.http.post(url, content, options)
        .toPromise()
        .then((response: any) => {
            this.onStatusChange.emit('');

            this.cdRef.detectChanges();

            if (response.Status == 'Ok') {
                this.onUpload.emit(response.data);
            }
            else {
                RVAlertsService.error('Error', response['ErrorMessage']);
            }
        })
        .catch();
    }

    getDuration() {
      
      this.timer = setInterval(() => {
          this.duaration += 1
          this.getTime();
      }, 1000);
    }

    getTime() 
    {
        let min: any = Math.floor(this.duaration/60)
        let sec: any = this.duaration - (min * 60)

        if (min < 10)
            min = "0"+min;
        if (sec < 10)
            sec = "0"+sec;

        this.onStatusChange.emit(min + " : " + sec);
    }

    clearTimer() 
    {
        this.duaration = 0;
        clearTimeout(this.timer); 
    }

}