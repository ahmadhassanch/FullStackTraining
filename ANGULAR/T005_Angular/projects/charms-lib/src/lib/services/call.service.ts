import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { NotificationService } from './notificaction.service';
import { ChiConfigService } from './app.config.service';
import { RVAlertsService } from '../components/alerts';
import { Constants } from '../components/general/constants';


@Injectable({ providedIn: 'root' })
export class CallsService
{
    mWebSocket: WebSocket;
    mCallsSubject: Subject<any>;
    mProfile: any;
    mIsMaster: boolean;
    mPendingPayload: any = null;
    mTitle: string = null;

    constructor( private _configService: ChiConfigService, private _notifService: NotificationService)
    {
        this.mCallsSubject = null;
        this.mProfile = this._configService.getProfile();

        setTimeout(() => {
            this.checkMaster()
        }, 2000);
    }

    checkMaster()
    {
        const m = this.checkTabStatus();

        if(this.mTitle == null || m !== this.mIsMaster)
        {
            this.mTitle = 'CHI | ' + this._configService.getDeployment().client_name;
            if (m)
            {
                this.mTitle = this.mTitle + ' | (Master)';
            }

            document.title = this.mTitle;
        }

        this.mIsMaster = m;

        if (this.mIsMaster)
        {
            this.ConnectBroker();
        }
        else
        {
            setTimeout(() => {
                this.checkMaster()
            }, 1000);
        }
    }

    getCallsSubject(): Subject<any>
    {
        return this.mCallsSubject;
    }

    displayNotification(topic: string, payload: any)
    {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notification');
            return;
        }

        if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(function (permission) {
                if (permission !== 'granted') {
                    return;
                }
            });
        }

        if (Notification.permission === 'granted') {
            const notification = new Notification(payload.toString());
        }
    }

    UnsubscribeTopic(topic: string)
    {
    }

    publish(type: string, data: any)
    {
        const payload = {type, data};
        if(this.mWebSocket.readyState === WebSocket.OPEN)
        {
            this.mWebSocket.send(JSON.stringify(payload));
        }
        else if (this.mIsMaster)
        {
            this.mPendingPayload = payload;
            this.ConnectBroker();
        }
        else
        {
            RVAlertsService.error('Error Starting Call', 'You can start/respose calls only from master Tab.');
        }
    }

    disconnect()
    {
    }

    public callUser(users_id: any, call_type: string, full_name: any, user_image: string)
    {
        const e = {
            type: 'Call',
            data: {
                image: user_image,
                to_user_id: users_id,
                call_type,
                full_name,
                event: Constants.StartOutGoing
            }
        };

        this.handleMessage(e);
    }

    private getBrokerUrl()
    {
        let base_url = this._configService.getUrl();
        // let base_url = 'http://localhost:6020';

        const url =  base_url + '/broker?token=' + this._configService.getConfig().token;
        let socket_url = '';
        if (url.indexOf('https') != -1)
        {
            socket_url = url.replace('https', 'wss');
        }
        else
        {
            socket_url = url.replace('http', 'ws');
        }

        console.log('Broker URL = ', socket_url);
        return socket_url;
    }

    private ConnectBroker()
    {
        this.mWebSocket = new WebSocket(this.getBrokerUrl());

        this.mWebSocket.onopen = (ev: Event) =>
        {
            console.log('Broker Connected -> ', ev);
            if(this.mCallsSubject == null)
            {
                this.mCallsSubject = new Subject();
            }

            if(this.mPendingPayload != null)
            {
                const pl = this.mPendingPayload;
                this.mPendingPayload = null;

                this.publish(pl.type, pl.data);
            }
        };

        this.mWebSocket.onmessage = (ev: MessageEvent) =>
        {
            try
            {
                const message = JSON.parse(ev.data);
                this.handleMessage(message);
            }
            catch(err)
            {
                console.error('error in message -->', err);
            }

        }

        this.mWebSocket.onclose = (ev: CloseEvent) =>
        {
            console.log('Broker connection closed -> ', ev);

            setTimeout(()=> {
                this.checkMaster()
            }, 3000);
        }
    }

    private handleMessage(message: any)
    {
        if(message.type === 'Call' && this.mCallsSubject)
        {
            this.mCallsSubject.next(message.data);
        }
        else
        {
            if (!this._configService.gcmEnabled())
            {
                message.data = message;
                console.log('Socket enable Message =>', message);
                this._notifService.handleNotifications(message);
            }
        }
    }

    private checkTabStatus(): boolean
    {
        let isMasterTab = false;

        // get/set session tab Index
        if (sessionStorage.getItem(window.origin+'_tabIndex'))
        {}
        else
        {
            const rand: number =  Math.floor(1000 + Math.random() * 9999);
            sessionStorage.setItem(window.origin+'_tabIndex', window.origin+'_'+rand);
        }

        // get/set localstorage tab index
        if (localStorage.getItem(window.origin+'_masterTab'))
        {
            const val = localStorage.getItem(window.origin+'_masterTab');
        }
        else
        {
            localStorage.setItem(window.origin+'_masterTab', sessionStorage.getItem(window.origin+'_tabIndex'));
        }

        // get Master tab
        if (localStorage.getItem(window.origin+'_masterTab') == sessionStorage.getItem(window.origin+'_tabIndex'))
        {
            isMasterTab = true;
        }
        else
        {
            isMasterTab = false;
        }

        return isMasterTab;
    }
}
