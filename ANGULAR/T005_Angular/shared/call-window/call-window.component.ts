import { Component, OnInit, OnDestroy, ViewChild, ElementRef, Input, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { trigger, transition, animate, style, state } from '@angular/animations';
import { MatDialogRef, MatDialog } from '@angular/material/dialog';

import { Subject, Observable } from 'rxjs';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { ApiService, ChiConfigService, Constants, RVAlertsService, GenericApiResponse, RVAlertAction, CallsService, FuseSidebarService, WhereData } from 'dist/charms-lib';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';

// import { InviteListComponent } from '../invite-list/invite.list.component';

declare var MyApp: any;
declare var UILayer: any;
declare var CameraToggle: any;
declare var MicToggle: any;
declare var ScreenToggle: any;
declare var MoreActions: any;
declare var CallEnd: any;
declare var PersonAdd: any;

const WND_MINIMIZED = 0;
const WND_NORMAL = 1;
const WND_MAXIMIZED = 2;
const WND_HIDDEN = 3;


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

    windowState: number = WND_HIDDEN;
    callWindowElement: any;

    selfCallsOnWaiting: any[] = [];
    ccCallsOnWaiting: any[] = [];
    totalCallsOnWaiting: any[] = [];

    error = false;
    errorMessage = '';

    windowWidth = 450;
    windowHeight = 408;

    private _unsubscribeAll: Subject<any>;

    callState: 'Idle' | 'Outgoing' | 'Connected' | 'InComing';
    activeCall: any = null;

    mRinger = null;

    mPendingCall: any = null;
    mPingId: any = null;
    mProfile: any;

    callConnected = false;
    mAppConfig: any;
    mApp: any
    mAppUI: any;

    mCallDuration = 0;
    mCallInterval = null;

    participantControl = new FormControl();
    mContacts = [];
    mFilteredContacts: Observable<any[]>;

    mCallParticipants = {};

    sidebarButtons = [
        // {
        //     id: 'summary',
        //     title: 'Patient Summary',
        //     icon: 'perm_identity',
        //     elementId: '',
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

    callButtons: any = {};

    constructor(private apiService: ApiService,
                private dialog: MatDialog,
                private _configService: ChiConfigService,
                private _callService: CallsService,
                private configService: ChiConfigService,
                private _fuseSidebarService: FuseSidebarService,
                private cdr: ChangeDetectorRef)
    {
        this.mRinger = new Audio();
        this.mRinger.muted = false;
        this._unsubscribeAll = new Subject();

        this.callState = 'Idle';
        this.subscribeNotifications();

        // this.inviteDialog = null;
        this.mProfile = this.configService.getProfile();
        // console.log('My Profile = ', this.mProfile);

        document.addEventListener('fullscreenchange', this.fullscreenChangedHandler, false);
        // document.addEventListener('mozfullscreenchange', this.fullscreenChangedHandler, false);
        // document.addEventListener('MSFullscreenChange', this.fullscreenChangedHandler, false);
        // document.addEventListener('webkitfullscreenchange', this.fullscreenChangedHandler, false);

        this.fetchDoctors();
    }

    ngOnInit(): void
    {
        // this._mainService.ContactList.subscribe((contacts) =>
        // {
        //     this.mContacts = contacts;
        //     console.log('Got Contact List = ', contacts);

            this.mFilteredContacts = this.participantControl.valueChanges.pipe(startWith(''), map(value => this.filterContacts(value)));
        // });
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
    get is_hidden(): boolean { return this.windowState === WND_HIDDEN;}
    get showJitsiDialog(): boolean
    {
        return (this.activeCall && this.callState === 'Connected' && !this.is_minimized);
    }

    filterContacts(value)
    {
        if (this.mContacts == null)
            return [];
        // const contacts = this.mContacts.filter(contact => !(contact.user_id in this.mCallParticipants));
        return this.mContacts.filter(contact => contact['employee.full_name'].toLowerCase().indexOf(value) === 0);
    }

    displayFn(value?: number)
    {
        // console.log('Value = ', value);
        const contact = this.mContacts.find(c => c['employee.user_id'] === value);
        // console.log('Contact = ', contact)

        const disp = value ? contact['employee.full_name'] : undefined;
        // console.log('Display Value = ', disp);
        return disp;
    }

    fetchDoctors(): void
    {
        const payload: any = {};
        payload.where = new WhereData({column: 'employee.user.primary_group_id', search: 9});
        payload.columns = ['employee.user_id', 'employee.full_name'];

        this.apiService.post('clinic_employees/List', payload).then((response: GenericApiResponse) =>
        {
            this.mContacts = response.data.data;
            // console.log('Got Doctors = ', response.data);
        }, (error: GenericApiResponse) =>
        {
            RVAlertsService.error('Error loading Pending Task Count', error.ErrorMessage)
        });
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

        const container = document.getElementById('bottom-bar-container');
        if(container != null)
        {
            container.style.visibility = 'visible';
        }
        setTimeout(()=>{ this.callBaseResizer();}, 200);

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

        const container = document.getElementById('bottom-bar-container');
        if(container != null)
        {
            container.style.visibility = 'hidden';
        }

        this.callBaseResizer();
    // this.showJitsiDialog = false;
    }

    maximizeWindow()
    {
        // tslint:disable-next-line: deprecation
        // event.stopPropagation();

        // this.windowState = WND_MAXIMIZED;
        // this.showJitsiDialog = true;

        this.callWindowElement.requestFullscreen();
        this.callBaseResizer();

    }

    hideWindow()
    {
        this.windowState = 3;
    }

    callBaseResizer(): void
    {
        if (this.mApp && this.mApp.mActiveCanvas != null)
        {
            this.mApp.mActiveCanvas.Resize();
            // if (this.mApp.mActiveCanvas.mFuncOnResize != null)
            // {
            //     this.mApp.mActiveCanvas.Resize();
            // }
        }
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
            return `Incoming ${this.activeCall.call_type} Call from ${this.activeCall.full_name}`;
        }
        else if (this.callState === 'Outgoing')
        {
            return `Outgoing ${this.activeCall.call_type} Call to ${this.activeCall.full_name}`;
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

            this.initializeCall();
            this.callState = 'Connected';
        }

        else if (call.event === Constants.CallExpired || call.event === Constants.CallEnded)
        {
            if (this.activeCall != null && this.activeCall.room_id === call.room_id)
            {
                this.stopRinger();
                this.onHangUp();

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

        if(this.is_hidden)
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

        if(this.is_hidden)
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

        this.hideWindow();

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

    invite(): void
    {
        this.onInvite();
    }

    initializeCall(): void
    {
        this.startApp();
    }

    onSidebarBtn(btn): void
    {
        // console.log(`Button = `, btn);
    }

    startApp(): void
    {
        if (this.mApp != null)
        {
            return;
        }
        this.callConnected = true;

        this.mAppConfig = {
            call: this.activeCall,
            roomId: this.activeCall.room_id,
            callType: this.activeCall.call_type,
            callsServer: 'https://webrtc02.cognitivehealthintl.com:4443',
            client_data: {
                full_name: this.mProfile.full_name,
                clientData: this.mProfile.full_name,
                avatar: this.mProfile.avatar
            },
            constraints: {audio: true, video: (this.activeCall.call_type as string).toLowerCase() === 'video'}
        };

        setTimeout(() =>
        {
            this.mApp = new MyApp(this.mAppConfig);

            this.mApp.start();
            this.makeActionButtons();
            this.addActionBarListener();

            this.mAppUI = new UILayer();
            this.mApp.mUI = this.mAppUI;
            this.mApp.mUI.mApp = this.mApp;
        }, 500);

        this.mCallInterval = setInterval(() =>
        {
            this.mCallDuration += 1;
        }, 1000);
    }

    onHangUp()
    {
        if(this.activeCall == null)
        {
            console.warn('Hanging up null active call');
            return;
        }

        if (this.mApp != null)
        {
            this.mApp.stop();
            this.mApp = null;

            clearInterval(this.mCallInterval);
            this.mCallDuration = 0;

            // this.stopScreenShare();
        }

        this.stopRinger();

        this.publishMessage(Constants.ACTION_CALL_END,  this.activeCall.room_id);
        this.finishActiveCall();

        setTimeout(() =>
        {
            this.callConnected = false;
        }, 100);
    }

    stopScreenShare(): void
    {
        this.mApp.mPeerHandler.screenMute();
    }

    toggleSidebar(key): void
    {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    replaceTrack(device: string)
    {
        if (this.mApp === null)
            return;

        if (device === 'mic')
        {
            const elem: any = document.getElementById('mic_options');
            const source = elem[elem.selectedIndex].id;
            this.mApp.mPeerHandler.mConnection.replaceMicTrack(source);

        }
        else if (device === 'camera'){
            const elem: any = document.getElementById('camera_options');
            const source = elem[elem.selectedIndex].id;
            this.mApp.mPeerHandler.mConnection.replaceCameraTrack(source);
        }
        else if (device === 'speaker')
        {
            const elem: any = document.getElementById('speaker_options');
            const source = elem[elem.selectedIndex].id;
            this.mApp.mPeerHandler.replaceSpeakerTrack(source);
        }
        else
        {
            console.log('ReplaceTrack Not Implemented for ', device);
            return;
        }
    }

    makeActionButtons(): void
    {
        console.log('makeActionButtons');
        this.callButtons = {};
        const container = document.getElementById('bottom-bar-container');

        let child = container.lastElementChild;
        if (child === container.firstChild)
        {
            child = null;
        }

        while (child)
        {
            container.removeChild(child);
            child = container.lastElementChild;

            if (child === container.firstChild)
            {
                break;
            }
        }

        setTimeout(() =>
        {
            document.getElementById('duration').style.display = 'flex';
        }, 500);

        const camera = new CameraToggle(this.mApp, 'camera-toggle', -1, 'btnToggleCamera');
        container.appendChild(camera.element);
        camera.element.style.borderTopLeftRadius = '4px';
        camera.element.style.borderBottomLeftRadius = '4px';
        this.callButtons.camera = camera;

        if (this.activeCall != null)
        {
            if (this.activeCall.call_type === 'Audio')
            {
                setTimeout(() =>
                {
                    camera.nextState();
                }, 10);
            }
        }

        const mic = new MicToggle(this.mApp, 'mic-toggle', -1, 'btnToggleMic');
        container.appendChild(mic.element);
        this.callButtons.mic = mic;

        const screen = new ScreenToggle(this.mApp, 'screen-toggle', -1, 'btnToggleScreen')
        container.appendChild(screen.element);
        // screen.element.style.display = 'none';
        this.callButtons.screen = screen;

        const person = new PersonAdd(this.mApp, this, 'add-person', -1, 'btnAddPerson');
        container.appendChild(person.element);
        this.callButtons.person = person;

        const more = new MoreActions(this.mApp, this, 'more-actions', -1, 'btnMore')
        container.appendChild(more.element);
        this.callButtons.more = more;

        const end = new CallEnd(this.mApp, this, 'call-end', -1, 'btnCallEnd');
        end.element.style.borderTopRightRadius = '4px';
        end.element.style.borderBottomRightRadius = '4px';
        container.appendChild(end.element);
        this.callButtons.end = end;

        setTimeout(() =>
        {
            container.style.display = 'none';
        }, 3000);
    }

    addActionBarListener(): void
    {
        const parent = document.getElementById('cv-parent');
        const bar = document.getElementById('bottom-bar-container');

        parent.addEventListener('mouseenter', (e) =>
        {
            bar.style.display = 'flex';

            setTimeout(() =>
            {
                bar.style.display = 'none';
            }, 3000);
        });

        parent.addEventListener('mousemove', (ev) =>
        {
            bar.style.display = 'flex';
        });

        parent.addEventListener('mouseleave', (e) =>
        {
            bar.style.display = 'none';
        });

        bar.addEventListener('mouseenter', (e) =>
        {
            bar.style.display = 'flex';
        });
    }

    onAddParticipant(ev: MatAutocompleteSelectedEvent): void
    {
        const userId = ev.option.value;
        console.log('UserId = ', userId);
        // const contact = this._mainService.getContactById(userId);
        const contact = {user_id: userId}

        this.toggleSidebar('participants');

        const newCall = {
            call_action: Constants.ACTION_CALL_INVITE,
            to_user_id: contact.user_id,
            call_type: this.activeCall.call_type,
            room_id: this.activeCall.room_id,
            full_name: null,
            image: null
            // full_name: contact.full_name,
            // image: contact.image
        };

        if (this.activeCall.invites === void 0)
        {
            this.activeCall.invites = [];
        }

        this.activeCall.invites.push(newCall);

        this._callService.publish('Call', newCall);

        this.participantControl.setValue(null);
    }
}
