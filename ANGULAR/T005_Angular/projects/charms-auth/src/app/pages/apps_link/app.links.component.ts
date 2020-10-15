import { Component, AfterViewInit, ChangeDetectorRef, Input, Renderer2, ViewChild, ElementRef } from '@angular/core';


@Component({
    templateUrl: './app.links.component.html',
    styleUrls    : ['./app.links.component.scss']
})
export class AppLinksComponent implements AfterViewInit
{
    @ViewChild('container') container: ElementRef;
    data: any[];

    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private renderer: Renderer2)
    {
        this.data = [
            {icon: 'android', name: 'PATIENT APP', link: '/apks/patient_app.apk'},
            {icon: 'android', name: 'DOCTOR APP', link: '/apks/doctor_app.apk'},
            {icon: 'android', name: 'GUARDIAN APP', link: '/apks/guardian_app.apk'}

        ];
    }

    ngAfterViewInit(): void
    {
        this._changeDetectorRef.detectChanges();
    }

    onDownloadApp(app: any)
    {
        const fileName = app.name.toLowerCase().replace(' ', '_')
        const link = document.createElement('a');
        link.download = fileName + '.apk';
        link.href = app.link;
        link.click();
    }

    onCopyURL(app: any)
    {
        const input: HTMLInputElement = this.renderer.createElement('input');
        input.value = app.link;
        this.renderer.setStyle(input, 'height', 0);

        this.renderer.appendChild(this.container.nativeElement, input);

        input.select();
        document.execCommand('copy');
        input.setSelectionRange(0, 0);

        this.renderer.removeChild(this.container.nativeElement, input);
    }
}
