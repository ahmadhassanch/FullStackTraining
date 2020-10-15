import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService, ChiConfigService, Constants, RVAlertsService, GenericApiResponse, RVAlertAction, CallsService } from 'dist/charms-lib';

// import { InviteListComponent } from '../invite-list/invite.list.component';


const WND_MINIMIZED = 0;
const WND_NORMAL = 1;
const WND_MAXIMIZED = 2;


@Component({
    selector     : 'call-window',
    templateUrl  : './call-window.component.html',
    styleUrls    : ['./call-window.component.scss'],
    providers: [ApiService],
    animations: [
        trigger('toolsBack', [
            state('inview', style({height: '120px', opacity: 1})),
            state('outview', style({height: 0, opacity: 0})),

            transition('inview => outview', animate('600ms ease-out')),
            transition('outview => inview', animate('400ms ease-in'))
        ])
    ]
})
export class CallWindowComponent implements OnInit, AfterViewInit, OnDestroy // , CallAppListener
{
    @ViewChild('chicall') chicall: ElementRef;
    @Input() isTabVisible: boolean;

    windowState: number = WND_MINIMIZED;
    callWindowElement: any;

    selfCallsOnWaiting: any[] = [];
    ccCallsOnWaiting: any[] = [];
    totalCallsOnWaiting: any[] = [];

    // showJitsiDialog: boolean = false;
    error = false;
    errorMessage = '';

    windowWidth = 450;
    windowHeight = 408;

    // mApp: any;

    private _unsubscribeAll: Subject<any>;

    callState: 'Idle' | 'Outgoing' | 'Connected' | 'InComing';
    activeCall: any = null;

    mRinger = new Audio();

    mPendingCall: any = null;
    mPingId: any = null;
    mProfile: any;

    // inviteDialog: MatDialogRef<InviteListComponent>;

    callConnected = false;
    mAppConfig: any;
    actions: Subject<any>;
    useMesh = false;

    sidebarButtons = [
        // {
        //     id: 'summary',
        //     title: 'Patient Summary',
        //     icon: 'perm_identity',
        //     elementId: '',
        // },
        // {
        //     id: 'chats',
        //     title: 'Chats',
        //     icon: 'chat'
        // },
        // {
        //     id: 'participants',
        //     title: 'Participants',
        //     icon: 'group'
        // },
        // {
        //     id: 'slides',
        //     title: 'Slides',
        //     icon: 'insert_drive_file'
        // }
    ];

    isEnabled = true;

    sidebarDrawings = [
        {
            title: 'Eraser',
            icon: 'lens',
            elementId: 'btnErase',
        },
        {
            title: 'Clear All',
            icon: 'clear',
            elementId: 'btnClear',
        },
    ];



    constructor(private apiService: ApiService,
                private dialog: MatDialog,
                private _configService: ChiConfigService,
                private _callService: CallsService,
                private configService: ChiConfigService,
                private cdr: ChangeDetectorRef)
    {
        this._unsubscribeAll = new Subject();
        this.actions = new Subject();

        this.callState = 'Idle';
        this.subscribeNotifications();

        // this.inviteDialog = null;
        this.mProfile = this.configService.getProfile();
        // console.log('My Profile = ', this.mProfile);

        document.addEventListener('fullscreenchange', this.fullscreenChangedHandler, false);
        // document.addEventListener('mozfullscreenchange', this.fullscreenChangedHandler, false);
        // document.addEventListener('MSFullscreenChange', this.fullscreenChangedHandler, false);
        // document.addEventListener('webkitfullscreenchange', this.fullscreenChangedHandler, false);
    }

    ngOnInit()
    {
        // this.subscribeNotifications();
    }

    ngAfterViewInit(): void
    {
        this.callWindowElement = document.getElementById('call');
    }

    ngOnDestroy(): void
    {
        this.stopRinger();

        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    get is_minimized(): boolean { return this.windowState === WND_MINIMIZED;}
    get is_normal(): boolean { return this.windowState === WND_NORMAL;}
    get is_maximized(): boolean { return this.windowState === WND_MAXIMIZED;}
    get showJitsiDialog(): boolean
    {
        return (this.activeCall && this.callState === 'Connected' && !this.is_minimized);
    }

    restoreWindow(): void
    {
        // tslint:disable-next-line: deprecation
        // event.stopPropagation();

        // if (this.activeCall)
        // {
        //     document.getElementById('app-call-dialog').style.display = 'block';
        // }
        if(this.is_maximized)
        {
            document.exitFullscreen();
        }
        else
        {
            this.windowState = WND_NORMAL;
            // this.showJitsiDialog = true;
        }
    }

    minimizeWindow()
    {
        // tslint:disable-next-line: deprecation
        // event.stopPropagation();

        // if (!this.activeCall)
        // {
        //     document.getElementById('app-call-dialog').style.display = 'none';
        // }
        if(this.is_maximized)
        {
            document.exitFullscreen();
            // this.callWindowElement.exitFullscreen();
        }
        else
        {
            this.windowState = WND_MINIMIZED;
        }

        // this.showJitsiDialog = false;
    }

    maximizeWindow()
    {
        // tslint:disable-next-line: deprecation
        // event.stopPropagation();

        // this.windowState = WND_MAXIMIZED;
        // this.showJitsiDialog = true;

        this.callWindowElement.requestFullscreen();
    }


    fullscreenChangedHandler = () =>
    {
        if(this.is_maximized)
        {
            this.windowState = WND_NORMAL;
            // this.showJitsiDialog = true;
        }
        else
        {
            this.windowState = WND_MAXIMIZED;
            // this.showJitsiDialog = true;
        }
    }

    getTitle(): string
    {
        if (this.callState === 'InComing')
        {
            return 'Incoming Call from ' + this.activeCall.full_name;
        }
        else if (this.callState === 'Outgoing')
        {
            return 'Outgoing Call to ' + this.activeCall.full_name;
        }

        return '';
    }

    subscribeNotifications()
    {
        const subj = this._callService.getCallsSubject();

        if (subj == null)
        {
            setTimeout(() =>
            {
                this.subscribeNotifications();
            }, 500);

            return;
        }

        this._callService.getCallsSubject().pipe(takeUntil(this._unsubscribeAll)).subscribe(call =>
        {
            console.log('call ', call);

            this.handleCallNotification(call);
        });
    }

    handleCallNotification(call: any)
    {
        if (!this.isTabVisible && (call.event === Constants.IncomingCall || call.event === Constants.CCIncomingCall || call.event === Constants.CallWaiting))
        {
            const notif = {
                icon: '/assets/images/logo2x.png',
                body: call.call_type + ' Call'
            }
            const notification = new Notification(call.full_name, notif);

            notification.onclick = () => {
                window.focus();
            }

            this.cdr.detectChanges();
        }

        if (call.event === Constants.IncomingCall || call.event === Constants.CCIncomingCall || call.event === Constants.CallWaiting)
        {
            this.handleIncomingCall(call);
            return;
        }

        else if (call.event === Constants.StartOutGoing)
        {
            if (this.activeCall != null)
            {
                RVAlertsService.error('Start Call', 'You are already in a call, you cannot start new call, please end first');
                return;
            }

            this.activeCall = {
                to_user_id: call.to_user_id,
                call_type: call.call_type,
                room_id: this.uuidv4(),
                full_name: call.full_name,
                image: call.image
            };

            this.callState = 'Outgoing';

            this.startOutgoingCall();
        }

        else if (call.event === Constants.UserBusy)
        {
            // console.log('Event -> ', call);
            const errorMessage = 'User is busy.';

            this.checkInviteResponse(errorMessage);
        }

        else if (call.event === Constants.CallRejected)
        {
            this.stopRinger();
            const errorMessage = call.full_name + ' rejected the call.';

            this.checkInviteResponse(errorMessage);

            // if (this.is_normal)
            // {
            //     this.minimizeWindow();
            // }
        }

        else if (call.event === Constants.CallAnswered || call.event === Constants.CallConnected)
        {
            if (this.activeCall == null)
            {
                console.warn('Active call --> ', this.activeCall);

                this.callState = 'Idle';
                return;
            }

            this.stopRinger();

            // this.showJitsiDialog = true;
            this.initializeCall();
            setTimeout(() =>
            {
                this.actions.next({type: 'USER_ADDED', user: this.activeCall});
            }, 1000);
            this.callState = 'Connected';
        }

        else if (call.event === Constants.CallExpired || call.event === Constants.CallEnded)
        {
            if (this.activeCall != null && this.activeCall.room_id === call.room_id)
            {
                this.stopRinger();

                this.actions.next({type: Constants.CallExpired});

                this.finishActiveCall();
            }
            else
            {
                this.updateCCQueue();
                this.updateSelfQueue();
            }
        }

        else if (call.event === Constants.CallNoResponse)
        {
            if (this.activeCall != null && this.activeCall.room_id === call.room_id)
            {
                this.stopRinger();

                if (this.callState === 'Outgoing')
                {
                    this.finishActiveCall('No Response');
                }
                else
                {
                    this.checkInviteResponse();
                }
            }
            else
            {
                this.updateCCQueue();
                this.updateSelfQueue();
            }
        }

        else if (call.event === Constants.NoOneAvailable)
        {
            console.warn('How come event = ', Constants.NoOneAvailable);
        }

        else if (call.event === Constants.NotOnline)
        {
            this.stopRinger();

            const errorMessage = 'User is not available.';
            this.checkInviteResponse(errorMessage);
        }
    }

    handleIncomingCall(call: any)
    {
        if(this.activeCall == null)
        {
            this.callState = 'InComing';
            this.activeCall = call;

            this.startRinger('/assets/audio/incoming.mp3', true);
            // this.startJitsi();
        }
        else if (call.event === Constants.CCIncomingCall)
        {
            this.updateCCQueue();
        }
        else
        {
            this.updateSelfQueue();
        }

        if(this.is_minimized)
            this.restoreWindow();
    }

    initTotalCallsOnWaiting()
    {
        this.totalCallsOnWaiting = [];

        for (const selfCall of this.selfCallsOnWaiting)
        {
            this.totalCallsOnWaiting.push(selfCall);
        }

        for (const ccCall of this.ccCallsOnWaiting)
        {
            this.totalCallsOnWaiting.push(ccCall);
        }

        // console.log('Update queue-> ', this.totalCallsOnWaiting)

        // Remove active call from queue
        if (this.activeCall)
        {
            for (const call of this.totalCallsOnWaiting)
            {
                if (call.room_id === this.activeCall.room_id)
                {
                    const index = this.totalCallsOnWaiting.indexOf(call);
                    this.totalCallsOnWaiting.splice(index, 1);

                    // console.log('Update queue loop-> ', this.totalCallsOnWaiting)
                }
            }
        }

    }

    startOutgoingCall()
    {
        this.startRinger('/assets/audio/ring.mp3', true);

        if(this.is_minimized)
            this.restoreWindow();

        const data = {
            call_action: Constants.ACTION_CALL_USER,
            to_user_id: this.activeCall.to_user_id,
            room_id: this.activeCall.room_id,
            call_type: this.activeCall.call_type,
            full_name: this.activeCall.full_name,
            image: this.activeCall.image,
        };

        this._callService.publish('Call', data);
    }

    uuidv4()
    {
        // tslint:disable-next-line: only-arrow-functions
        return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            // tslint:disable-next-line: one-variable-per-declaration no-bitwise
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    finishActiveCall(errorMessage?: string)
    {
        if(this.activeCall == null)
        {
            return;
        }

        if(errorMessage)
        {
            this.error = true;
            this.errorMessage = errorMessage;

            this.startRinger('/assets/audio/rejected.mp3', false);

            // console.log('Ringer ->', this.mRinger.loop);
            this.mRinger.addEventListener('ended', (t)=> {

                this._doFiniActiveCall();
                this.stopRinger();
            });
        }
        else
        {
            this._doFiniActiveCall();
        }
    }

    _doFiniActiveCall()
    {
        // this.showJitsiDialog = false;
        // if(this.mApp != null)
        // {
        //     this.mApp.stop();
        //     this.mApp = null;
        // }

        this.callState = 'Idle';
        this.activeCall = null;

        if (this.mPendingCall != null)
        {
            this.activeCall = this.mPendingCall;
            this.mPendingCall = null;

            this.activeCall.full_name = this.activeCall.call_from_name;
            this.callState = 'InComing';

            this.onAcceptCall();
        }
        else if (this.totalCallsOnWaiting.length > 0)
        {
            this.activeCall = this.totalCallsOnWaiting.shift();
            this.activeCall.full_name = this.activeCall.call_from_name;
            this.callState = 'InComing';
        }

        if (this.activeCall != null)
        {
            this.updateSelfQueue();
            this.updateCCQueue();
        }

        // if (this.inviteDialog != null)
        // {
        //     this.inviteDialog.close();
        //     this.inviteDialog = null;
        // }
    }

    updateSelfQueue()
    {
        return;
        const payload = {
            limit: 100,
            offset: 0,
            columns: ['room_id', 'call_type', 'call_from_name']
        }

        this.apiService.post('call_recipients/List', payload).then( resp => {
            this.selfCallsOnWaiting = resp.data.data;

            for (const call of this.selfCallsOnWaiting)
            {
                call.queue = 'Self';
            }

            this.initTotalCallsOnWaiting();
        }, (error: GenericApiResponse) => {
            RVAlertsService.error('Error loading Recipients Queue Calls ', error.ErrorMessage);
        });
    }

    updateCCQueue()
    {
        return;
        const payload = {
            limit: 100,
            offset: 0,
            columns: ['room_id', 'call_type', 'call_from_name']
        }
        this.apiService.post('cc_calls/List', payload).then( resp => {
            this.ccCallsOnWaiting = resp.data.data;

            for (const call of this.ccCallsOnWaiting)
            {
                call.queue = 'CC';
            }

            this.initTotalCallsOnWaiting();
        }, (error: GenericApiResponse) => {
            RVAlertsService.error('Error loading Recipients Queue Calls ', error.ErrorMessage);
        })
    }

    getLogo()
    {
        const avatar = this.configService.getProfile().avatar;

        if (avatar && (avatar.substr(0,7) !== '/assets' && avatar.substr(0,7) !== 'assets/'))
        {
            return this.configService.getProfile().avatar;
        }

        // if (this.configService.getUrl() === 'http://chi.jemware.local:4040')
        // {
        //     return 'https://test.cognitivehealthintl.com/assets/images/avatar.jpg';
        // }

        return this.configService.getUrl() + '/assets/images/avatar.jpg';
    }

    onInvite()
    {
        // if (!this.activeCall.hasOwnProperty('invites'))
        // {
        //     this.activeCall.invites = [];
        // }

        // this.inviteDialog = this.dialog.open(InviteListComponent,
        // {
        //     width: '50vw',
        //     maxWidth: '50vw',
        //     panelClass: 'chi-dialog-container',
        //     autoFocus: false
        // });

        // this.inviteDialog.afterClosed().subscribe(toUserId => {
        //     console.log('on Invite clos-> ', toUserId);
        //     if (toUserId !== void 0 && toUserId)
        //     {
        //         this.activeCall.invites.push(toUserId);

        //         const data = {
        //             call_action: Constants.ACTION_CALL_INVITE,
        //             to_user_id: toUserId,
        //             room_id: this.activeCall.room_id,
        //             device_id: this.mProfile.device_id,
        //             call_type: this.activeCall.call_type,
        //             user_id: this.mProfile.user_id,
        //             event: Constants.ACTION_CALL_INVITE,
        //             full_name: this.mProfile.full_name,
        //             image: this.mProfile.avatar,
        //         };

        //         console.log('invite-> ', data)

        //         this._callService.publish('Call', data);
        //     }

        //     this.inviteDialog = null;
        // });
    }


    publishMessage(action: string, roomId: string)
    {
        const data = {
            call_action: action,
            room_id: roomId,
            full_name: this.mProfile.full_name
        };
        this._callService.publish('Call', data);
    }

    onAcceptCall()
    {
        if(this.activeCall == null)
        {
            return;
        }

        this.stopRinger();

        this.callState = 'Connected';

        this.publishMessage(Constants.ACTION_CALL_ACCEPT, this.activeCall.room_id);

        // this.showJitsiDialog = true;
    }


    onAcceptQueueCall(call: any)
    {
        if (this.activeCall == null)
        {
            this.activeCall = call;
            this.onAcceptCall();
        }
        else
        {
            RVAlertsService.confirm('Are you sure?', 'Do you want to switch the Call?').subscribe( (action: RVAlertAction) =>
            {
                if (!action.positive)
                {
                    return;
                }

                if (this.callState === 'Connected' || this.callState === 'Outgoing')
                {
                    this.mPendingCall = call;
                    this.onHangUp();
                }
                else
                {
                    // Remove call from queue
                    const index = this.totalCallsOnWaiting.indexOf(call);
                    this.totalCallsOnWaiting.splice(index, 1);

                    // Push current call to queue if call_state is not Outgoing
                    // this.activeCall['call_from_name'] = this.activeCall['full_name'];
                    // this.totalCallsOnWaiting.push(this.activeCall);

                    this.updateCCQueue();
                    this.updateSelfQueue();

                    // Start the call
                    this.activeCall = call;
                    // this.startJitsi();
                    this.onAcceptCall();
                }
            });
        }
    }

    onRejectQueueCall(call: any)
    {
        this.publishMessage(Constants.ACTION_CALL_REJECT, call.room_id);

        if(call.queue === 'Self')
        {
            const idx = this.selfCallsOnWaiting.indexOf(call);
            this.selfCallsOnWaiting.splice(idx, 1);

            this.initTotalCallsOnWaiting();
        }
        else
        {
            const idx = this.ccCallsOnWaiting.indexOf(call);
            this.ccCallsOnWaiting.splice(idx, 1);

            this.initTotalCallsOnWaiting();
        }
    }

    onHangUp()
    {
        if(this.activeCall == null)
        {
            console.warn('Hanging up null active call');
            return;
        }

        this.stopRinger();

        this.publishMessage(Constants.ACTION_CALL_END,  this.activeCall.room_id);
        this.finishActiveCall();
    }

    onRejectCall()
    {
        if (this.activeCall == null)
        {
            return;
        }

        this.stopRinger();

        this.publishMessage(Constants.ACTION_CALL_REJECT, this.activeCall.room_id);
        this.finishActiveCall();
    }

    startRinger(url: string, loop: boolean)
    {
        this.mRinger = new Audio();
        this.mRinger.src = url;
        this.mRinger.loop = loop;
        this.mRinger.muted = false;

        this.mRinger.play();
    }

    stopRinger()
    {
        if(this.mRinger != null)
        {
            this.mRinger.src = null;
            this.mRinger = null;

            this.error = false;
        }
    }

    checkInviteResponse(error?: string)
    {
        if (this.activeCall !== null && this.activeCall.hasOwnProperty('invites') && this.activeCall.invites.length > 0)
        {
            this.activeCall.invites.splice(0, 1);
        }
        else
        {
            this.finishActiveCall(error);
        }
    }

    stop(): void
    {
        this.onHangUp();
    }

    invite(): void
    {
        this.onInvite();
    }

    initializeCall(): void
    {
        // if (this.useMesh)
        // {
        //     this.startCallWithMesh();
        //     return;
        // }

        this.startCallWithStar();
    }

    startCallWithStar(): void
    {
        this.callConnected = true;

        this.mAppConfig = {
            call: this.activeCall,
            roomId: this.activeCall.room_id,
            callType: this.activeCall.call_type,
            callsServer: 'https://webrtc02.cognitivehealthintl.com:4443',
            client_data: {
                clientData: this.mProfile.full_name,
                avatar: this.mProfile.avatar
                // avatar: 'https://openvidu.io/img/logos/openvidu_globe_bg_transp_cropped.png'
            },
            constraints: {audio: true, video: (this.activeCall.call_type as string).toLowerCase() === 'video'}
        };
    }

    startCallWithMesh(): void
    {
        this.callConnected = true;

        this.mAppConfig = {
            ws_url: 'wss://webrtc-test.cognitivehealthintl.com/ws/signals/',
            room_id: this.activeCall.room_id,
            client_id: this.mProfile.full_name,
            full_name: this.mProfile.full_name,
            app_type: (this.activeCall.call_type as string).toLowerCase(),
            constraints: {
                audio: true,
                video: true,
            },
            pc_config: {
                iceServers: [
                    {
                        url: 'turn:turn01.cognitivehealthintl.com:3478',
                        username: 'chi',
                        credential: 'chi123'
                    }
                ],
                peerIdentity: null
            }
        };

    }

    handleCallViewSignals(ev: any): void
    {
        if (ev.type === 'END_CALL')
        {
            this.minimizeWindow();
            this.onHangUp();
            this.callConnected = false;
        }
        else if (ev.type === 'ADD_USER')
        {
            const newCall = {
                call_action: Constants.ACTION_CALL_INVITE,
                to_user_id: ev.contact.user_id,
                call_type: this.activeCall.call_type,
                room_id: this.activeCall.room_id,
                full_name: ev.contact.full_name,
                image: ev.contact.image
            };

            // this.startRinger('/assets/audio/ring.mp3', true);

            // if(this.is_minimized)
            //     this.restoreWindow();

            // const data = {
            //     call_action: Constants.ACTION_CALL_USER,
            //     to_user_id: this.activeCall.to_user_id,
            //     room_id: this.activeCall.room_id,
            //     call_type: this.activeCall.call_type,
            //     full_name: this.activeCall.full_name,
            //     image: this.activeCall.image,
            // };
            this._callService.publish('Call', newCall);
            console.log('New Call published = ', newCall);
        }
        // else if (ev.type === 'SCREEN_SHARE')
        // {
        //     if (!this.is_maximized)
        //     {
        //         this.maximizeWindow();
        //     }
        // }
        // else if (ev.type === 'STOP_SHARE')
        // {
        // }
    }

    onSidebarBtn(btn): void
    {
        // console.log(`Button = `, btn);
    }
}
