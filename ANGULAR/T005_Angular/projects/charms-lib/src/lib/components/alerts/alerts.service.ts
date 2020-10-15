import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Observable, Subject } from 'rxjs';

import { RVAlert, RVAlertAction } from './alerts.common';
import { AlertComponent } from './alerts.component';

import { GenericApiResponse } from '../../models/api.models';


@Injectable({
    providedIn: 'root'
})
export class RVAlertsService
{
    private static _instance: RVAlertsService = null;
    // public static shared(): RVAlertsService
    // {
    //     return RVAlertsService._instance;
    // }

    private alerts: Subject<RVAlert>;
    private queue: RVAlert[];
    private presented: boolean;

    constructor(protected dialog: MatDialog)
    {
        if (RVAlertsService._instance == null)
        {
            RVAlertsService._instance = this;
        }

        this.alerts = new Subject<RVAlert>();
        this.queue = [];
        this.presented = false;

        this.alerts.subscribe((a: RVAlert) =>
        {
            this.present(a);
        });
    }

    private present(alert: RVAlert): void
    {
        this.presented = true;
        const dialogRef = this.dialog.open(AlertComponent, {
            disableClose: true,
            backdropClass: 'alert-backdrop'
        });
        dialogRef.componentInstance.alert = alert;

        dialogRef.afterClosed().subscribe((result: RVAlertAction) =>
        {
            this.presented = false;
            this.checkQueue();
            result.alert.subject.next(result);
            result.alert.subject.complete();
        });
    }

    private checkQueue(): void
    {
        if (this.queue.length === 0 || this.presented)
            return;
        // if (this.dialog.openDialogs.length > 0)
        //     return;

        this.alerts.next(this.queue.pop());
    }

    private addAlert(alert: RVAlert): void
    {
        this.queue.push(alert);
        this.checkQueue();
    }

    // tslint:disable-next-line: member-ordering
    public static success(title: string, message: string): Observable<RVAlertAction>
    {
        const alert = new RVAlert('success', title, message);
        RVAlertsService._instance.addAlert(alert);

        return alert.subject.asObservable();
    }

    // tslint:disable-next-line: member-ordering
    public static error(title: string, message: string): Observable<RVAlertAction>
    {
        const alert = new RVAlert('error', title, message);
        RVAlertsService._instance.addAlert(alert);

        return alert.subject.asObservable();
    }

    // tslint:disable-next-line: member-ordering
    public static apiError(title: string, error: GenericApiResponse): Observable<RVAlertAction>
    {
        let message = error.ErrorMessage;

        if (message.includes('_'))
        {
            const st = message.split('\'');
            const part = st[1].toUpperCase().replace('_', '-');

            st[1] = `'${part}'`;
            message = st.join('');
        }

        const alert = new RVAlert('error', title, message);
        RVAlertsService._instance.addAlert(alert);

        return alert.subject.asObservable();
    }

    // tslint:disable-next-line: member-ordering
    public static info(title: string, message: string): Observable<RVAlertAction>
    {
        const alert = new RVAlert('info', title, message);
        RVAlertsService._instance.addAlert(alert);

        return alert.subject.asObservable();
    }

    // tslint:disable-next-line: member-ordering
    public static warn(title: string, message: string): Observable<RVAlertAction>
    {
        const alert = new RVAlert('warning', title, message);
        RVAlertsService._instance.addAlert(alert);

        return alert.subject.asObservable();
    }

    // tslint:disable-next-line: member-ordering
    public static confirm(title: string, message: string): Observable<RVAlertAction>
    {
        const alert = new RVAlert('confirm', title, message);
        RVAlertsService._instance.addAlert(alert);

        return alert.subject.asObservable();
    }

    // tslint:disable-next-line: member-ordering
    public static confirmWithInput(title: string, label?: string, required?: boolean): Observable<RVAlertAction>
    {
        const alert = new RVAlert('confirmWithInput', title, '', required);
        alert.placeholder = label || title;
        RVAlertsService._instance.addAlert(alert);

        return alert.subject.asObservable();
    }
}
