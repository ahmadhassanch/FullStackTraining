import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { ApiService } from './app.api.service';
import { AngularFireMessaging } from '@angular/fire/messaging';


@Injectable({ providedIn: 'root' })
export class NotificationService
{
    public notifications: Subject<any>;
    public observations: Subject<any>;
    public messages: Subject<any>;
    public pendingTask: Subject<any>;

    public call: Subject<any>;

    public monitoring: Subject<any>;

    public cMonitoring: Subject<any>;
    public questionAnswers: Subject<any>;
    public escalationResponded: Subject<any>;
    public enableNotification: BehaviorSubject<any>;

    constructor(
        private angularFireMessaging: AngularFireMessaging,
        private apiService: ApiService
    ) {
        this.notifications = new Subject();
        this.observations = new Subject();
        this.messages = new Subject();
        this.call = new Subject();
        this.monitoring = new Subject();
        this.pendingTask = new Subject();

        this.cMonitoring = new Subject();
        this.questionAnswers = new Subject();
        this.escalationResponded = new Subject();
        this.enableNotification = new BehaviorSubject(null);

        // this.angularFireMessaging.messages.
        this.angularFireMessaging.messages.subscribe(
            (_messaging: any) => {
                _messaging.onMessage = _messaging.onMessage.bind(_messaging);
                _messaging.onTokenRefresh = _messaging.onTokenRefresh.bind(_messaging);
                // _messaging.setBackgroundMessageHandler(this.backgroundMessageHandler);
            });

        this.angularFireMessaging.messages.subscribe(this.foregroundMessageHandler);
    }

    foregroundMessageHandler = (payload: any) => {

        console.log('[Notification] Received foreground message ', payload);

            this.handleNotifications(payload);

            // Customize notification here

            // const notification = new Notification(payload.notification.title, {
            //     icon: payload.notification.icon,
            //     body: payload.notification.body,
            // });

            // notification.onclick = () => {
            //     // window.open(payload.notification.click_action, '_self');
            //     notification.close();
            // };

    }

    backgroundMessageHandler = (payload: any) => {

        console.log('[Notification] Received background message ', payload);

        this.handleNotifications(payload);

        // Customize notification here

        // var notificationTitle = payload.title;
        // var notificationOptions = {
        //     body: payload.body,
        //     icon: payload.icon
        // };
        // return self.registration.showNotification(notificationTitle, notificationOptions);
    }

    handleNotifications(payload: any) {

        const data = payload.data;
        this.notifications.next(data);

        if (data.type === 'Observation') {
            this.observations.next(data);
        }
        else if (data.type === 'Continuous Monitoring') {
            this.cMonitoring.next(data);
        }
        else if (data.type === 'Message') {
            this.messages.next(data);
        }

        else if (data.type === 'Call') {
            this.call.next(data);
        }
        else if (data.type === 'Monitoring') {
            this.monitoring.next(data);
        }
        else if (data.type === 'Pending Task') {
            this.pendingTask.next(data);
        }
        else if (data.type === 'QuestionAnswer')
        {
            this.questionAnswers.next(data);
        }
        else if (data.type === 'Responded')
        {
            this.escalationResponded.next(data);
        }
    }

    /**
     * request permission for notification from firebase cloud messaging
     *
     */
    requestPermission()
    {
        try
        {
            this.angularFireMessaging.requestToken.subscribe((token) =>
            {
                console.log('token -> ', token);
                this.updateFCMToken(token);
            },
            (err) =>
            {
                this.enableNotification.next(err)
                console.error('Unable to get permission to notify.', err);
            });
        }
        catch(e)
        {

        }
    }

    // public callUser(users_ids: any[], call_type: string, names: any)
    // {
    //     const e = {
    //         to_user_ids: users_ids,
    //         call_type: call_type,
    //         names: names,
    //         event: Constants.StartOutGoing
    //     };

    //     this.call.next(e);
    // }

    public updateFCMToken(token: string)
    {
        const payload = {pn_type: 'Firebase', pn_token: token};
        this.apiService.post('app_main/UpdateToken', payload).then(resp =>
        {
            console.log('fcm token updated: ', token);
        });
    }
}
