import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Observable } from 'rxjs';
import { Constants, FuseSidebarService, ApiService, GenericApiResponse, RVAlertsService, WhereData } from 'dist/charms-lib';
import { takeUntil, startWith, map } from 'rxjs/operators';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormControl } from '@angular/forms';


declare var MyApp: any;
declare var UILayer: any;


@Component({
    selector: 'star-call-view',
    templateUrl: 'component.html',
    styleUrls: ['component.scss']
})
export class StarCallViewComponent implements OnInit
{
    @Input() AppConfig = null;
    @Input() isMinimized = true;
    @Input() actions: Subject<any>;
    // @Inp
    @Output() signals = new EventEmitter<any>();


    participantControl: FormControl;
    private _unsubscribeAll: Subject<any>;

    bottomBarButtons: any[];
    mApp: any;
    mAppUI: any;

    mCallDuration = 0;
    mCallInterval = null;

    mContacts = [];
    mFilteredContacts: Observable<any[]>;

    mCallParticipants = {};

    constructor(private dialog: MatDialog,
        private _fuseSidebarService: FuseSidebarService,
        private apiService: ApiService
    )
    {
        this.participantControl = new FormControl();
        this.AppConfig = { roomId: null, callType: 'Video', callsServer: null, constraints: {audio: true, video: false}, client_data:
            { clientData: null, avatar: 'https://openvidu.io/img/logos/openvidu_globe_bg_transp_cropped.png' }
        };

        this._unsubscribeAll = new Subject();

        this.bottomBarButtons = [
            {
                id: 'camera',
                title: 'Camera',
                elementId: 'btnToggleCamera',
                icon: 'videocam',
                class: 'toggle-camera',
                disable: false
            },
            {
                id: 'mute',
                title: 'Mute',
                elementId: 'btnToggleMic',
                icon: 'mic',
                class: 'toggle-mic',
                disable: false
            },
            {
                id: 'screen_share',
                title: 'Share Screen',
                elementId: 'btnToggleScreen',
                icon: 'screen_share',
                class: 'toggle-screen',
                disable: false
            },
            // {
            //     id: 'discussion',
            //     title: 'Discussion',
            //     elementId: 'btnDiscussion',
            //     icon: 'near_me',
            //     class: 'toggle-discussion',
            //     disable: false
            // },
            {
                id: 'more',
                title: 'More',
                elementId: 'btnMore',
                icon: 'more_horiz',
                class: 'btn-more',
                disable: false
            },
            {
                id: 'participants',
                title: 'Show Participants',
                elementId: 'btnParticipants',
                icon: 'group',
                class: 'btn-participants',
                disable: false
            },
            {
                id: 'end_call',
                title: 'End Call',
                color: 'red',
                icon: 'call_end',
                class: 'toggle-call',
                elementId: '',
                disable: false
            }
        ];

        this.fetchDoctors();
    }

    ngOnInit(): void
    {
        this.startApp();

        // const userId = this.AppConfig.call.caller_id;
        // this.mCallParticipants[userId] = this.AppConfig.call;
        this.mContacts = this.mContacts.filter(contact => !(contact.user_id in this.mCallParticipants));

        if(this.actions != null)
        {
            this.actions.pipe(takeUntil(this._unsubscribeAll)).subscribe((e: any) =>
            {
                // console.log('Got an action in Star Component = ', e);

                if (e.type === Constants.CallExpired)
                {
                    this.stopCall();
                }
                else if (e.type === 'USER_ADDED')
                {
                    // this.mCallParticipants[e.user.to_user_id] = e.user;
                    // this.mContacts = this.mContacts.filter(contact => !(contact.user_id in this.mCallParticipants));

                    // console.log('this.mCallParticipants = ', this.mCallParticipants);
                }
            });
        }

        // this._mainService.ContactList.subscribe((contacts) =>
        // {
        //     this.mContacts = contacts;
        // });

        this.mFilteredContacts = this.participantControl.valueChanges.pipe(startWith(''), map(value => this.filterContacts(value)));
    }

    filterContacts(value)
    {
        // const contacts = this.mContacts.filter(contact => !(contact.user_id in this.mCallParticipants));
        return this.mContacts.filter(contact => contact['employee.full_name'].toLowerCase().indexOf(value) === 0);
    }

    displayFn(value?)
    {
        console.log('Value = ', value);
        const contact = this.mContacts.find(c => c['employee.user_id'] === value);
        console.log('Contact = ', contact)

        const disp = value ? contact['employee.full_name'] : undefined;
        console.log('Display Value = ', disp);
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
            console.log('Got Doctors = ', response.data);
        }, (error: GenericApiResponse) =>
        {
            RVAlertsService.error('Error loading Pending Task Count', error.ErrorMessage)
        });
    }

    startApp(): void
    {
        this.mApp = new MyApp(this.AppConfig);
        this.mApp.start();

        setTimeout(() =>
        {
            this.mAppUI = new UILayer();
            this.mApp.mUI = this.mAppUI;
            this.mApp.mUI.mApp = this.mApp;

            // this.mAppUI.mSignals.subscribe((message: any) =>
            // {
            //     this.handleJSSignals(message);
            // });
        }, 500);

        this.mCallInterval = setInterval(() =>
        {
            this.mCallDuration += 1;
        }, 1000);
    }

    stopCall(): void
    {
        if (this.mApp !== null)
        {
            this.mApp.stop();

            clearInterval(this.mCallInterval);
            this.mCallDuration = 0;

            this.stopScreenShare();
            this.signals.emit({type: 'END_CALL'});
        }
    }

    stopScreenShare(): void
    {
        this.mApp.mPeerHandler.screenMute();
        this.signals.emit({type: 'STOP_SHARE'});
    }

    sendMessage(): void
    {
        this.mApp.sendMessage();
    }

    onBottomAction(ev: any, btn: any): void
    {
        // console.log('Button Pressed = ', btn);
        // console.log('Event = ', ev);

        switch(btn.id)
        {
            case 'end_call':
                // btn.icon = 'call';
                // btn.color = 'green';
                // btn.title = 'Call';

                this.stopCall();
                break;
            case 'mute':
                btn.id = 'unmute';
                btn.title = 'Unmute';
                btn.icon = 'mic_off';

                this.mApp.mPeerHandler.micMute();
                break;
            case 'unmute':
                btn.id = 'mute'
                btn.title = 'Mute';
                btn.icon = 'mic';

                this.mApp.mPeerHandler.micUnMute();
                break;

            case 'camera':
                btn.id = 'camera_off';
                btn.title = 'Camera Off';
                btn.icon = 'videocam_off';

                this.mApp.mPeerHandler.cameraMute();
                break;
            case 'camera_off':
                btn.id = 'camera';
                btn.title = 'Camera';
                btn.icon = 'videocam';

                this.mApp.mPeerHandler.cameraUnMute();
                break;
            case 'screen_share':
                btn.id = 'stop_share';
                btn.title = 'Stop Screen Sharing';
                btn.icon = 'stop_screen_share';

                this.mApp.mPeerHandler.screenUnMute();
                const c: any = document.getElementById('btnToggleCamera');
                c.disabled = true;

                this.signals.emit({type: 'SCREEN_SHARE'});
                break;
            case 'stop_share':
                btn.id = 'screen_share';
                btn.title = 'Share Screen';
                btn.icon = 'screen_share';

                this.stopScreenShare();
                break;
            case 'more':
                this.toggleMoreOptions();
                break;
            case 'participants':
                this.toggleParticipants();
                break;
            case 'stop_discussion':
                btn.id = 'discussion';
                btn.title = 'Discussion';
                btn.icon = 'near_me';

                this.mApp.stopDiscussion();
                break;
        }
    }

    toggleMoreOptions(): void
    {
        this._fuseSidebarService.getSidebar('more_options').toggleOpen();
    }

    toggleParticipants(): void
    {
        this._fuseSidebarService.getSidebar('participants').toggleOpen();
    }

    replaceTrack(device: string)
    {
        // console.log('Replacing Track for = ', device);
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

    handleJSSignals(message): void
    {
        // console.log('Signal Message = ', message);
        // if (message.type === 'fullscreen')
        // {
        //     this.signals.emit({type: 'SCREEN_SHARE'});
        // }
        // else if (message.type === 'exit-fullscreen')
        // {
        //     this.signals.emit({type: 'STOP_SHARE'});
        // }
    }

    onAddParticipant(ev: MatAutocompleteSelectedEvent): void
    {
        const userId = ev.option.value;
        console.log('UserId = ', userId);

        // const contact = this._mainService.getContactById(userId);
        const contact = {user_id: userId}

        this.signals.next({type: 'ADD_USER', contact});

        this.toggleParticipants();
        this.participantControl.setValue(null);
    }
}