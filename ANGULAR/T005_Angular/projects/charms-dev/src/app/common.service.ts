import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GenericApiResponse, RVAlertsService, ApiService } from 'charms-lib';


@Injectable({ providedIn: 'root' })
export class CommonService {

    public updateCount: Subject<any>;
    public callDialogSub: BehaviorSubject<any>;
    public episodetaskCount: number;
    public pendingtaskCount: number;
    public onlineUsersCount: number;
    public orderVerificationCount: number;
    public unhandledObservationsCount: number;
    public stethscopeResultableData: Subject<any>;

    constructor(private apiService: ApiService, private dialog: MatDialog) 
    {
        this.updateCount = new Subject();
        this.callDialogSub = new BehaviorSubject(null);
        this.stethscopeResultableData = new Subject();
        this.episodetaskCount = 0;
        this.pendingtaskCount = 0;
        this.onlineUsersCount = 0;
        this.orderVerificationCount = 0;
        this.unhandledObservationsCount = 0;
    }

    updateEpisodeTasksCount() {
        this.apiService.post('episode_tasks/GetEpisodeTasksCount', {}).then(response=> {
            this.episodetaskCount = response.data;
        }, (error: GenericApiResponse)=> {
            console.error('Error loading Episode Task', error.ErrorMessage)
        });
    }

    updatePendingTaskCount() {
        this.apiService.post('todo_tasks/GetPendingTaskCount', {}).then(response=> {
            this.pendingtaskCount = response.data;
        }, (error: GenericApiResponse)=> {
            RVAlertsService.error('Error loading Pending Task Count', error.ErrorMessage)
        });
    }

    updateOnlineUserCount() {
        this.apiService.post('user_list/GetOnlineUsersCount', {}).then(response=> {
            this.onlineUsersCount = response.data['count'];
        }, (error: GenericApiResponse)=> {
            console.error('Error loading Online User Count', error.ErrorMessage)
        });
    }

    updateOrderVerificationCount() {
        this.apiService.post('episode_vitals/GetUnverifiedOrderedCount', {}).then(response => {
            this.orderVerificationCount = response.data.total_records;
        }, (error: GenericApiResponse)=> {
            console.error('Error loading Unverified Ordered', error.ErrorMessage)
        });
    }

    unpdateObservationsCount() {
        this.apiService.post('observations/GetUnhandledObservationsCount', {}).then(response => {
            this.unhandledObservationsCount = response.data;
        }, (error: GenericApiResponse)=> {
            console.error('Error loading Unhandled Observations', error.ErrorMessage)
        });
    }

    get _episodetaskCount() 
    {
        return this.episodetaskCount;
    }

    get _orderVerificationCount() 
    {
        return this.orderVerificationCount;
    }

    get _unhandledObservationsCount() 
    {
        return this.unhandledObservationsCount;
    }

    get _pendingtaskCount() 
    {
        return this.pendingtaskCount;
    }

    get _onlineUserCount() 
    {
        return this.onlineUsersCount;
    }

    set _pendingtaskCount(value: any) 
    {
        this.pendingtaskCount = value;
    }

    set _onlineUserCount(value: any) 
    {
        this.onlineUsersCount = value;
    }

    public doTranslation(key: any, val: any, isHtmlEditor?: boolean) 
    {
        // const dialogRef = this.dialog.open(SsTransaltionsPageComponent, 
        //     {
        //         width: '80vw',
        //         maxWidth: '80vw',
        //         panelClass: 'chi-dialog-container',
        //         autoFocus: false
        //     }
        // );

        // dialogRef.componentInstance.transaltion_key = key;
        // dialogRef.componentInstance.transaltionFor = val;
        // dialogRef.componentInstance.isHtmlEditor = isHtmlEditor;
    }

}
