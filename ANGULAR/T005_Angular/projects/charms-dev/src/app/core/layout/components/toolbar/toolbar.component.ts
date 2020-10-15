import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as _ from 'lodash';

import {
    FuseConfig, FuseConfigService, FuseSidebarService,
    RVAlertsService, RVAlertAction
 } from 'charms-lib';

import { navigation } from '../../../navigation';



@Component({
    selector     : 'toolbar',
    templateUrl  : './toolbar.component.html',
    styleUrls    : ['./toolbar.component.scss'],
    encapsulation: ViewEncapsulation.None
})

export class ToolbarComponent implements OnInit, OnDestroy
{
    horizontalNavbar: boolean;
    rightNavbar: boolean;
    hiddenNavbar: boolean;
    navigation: any;
    userStatusOptions: any[];
    fuseConfig: FuseConfig;
    currentTheme: string;

    // Private
    private _unsubscribeAll: Subject<any>;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseSidebarService: FuseSidebarService
    )
    {
        // Set the defaults
        this.userStatusOptions = [
            {
                title: 'Online',
                icon : 'icon-checkbox-marked-circle',
                color: '#4CAF50'
            },
            {
                title: 'Away',
                icon : 'icon-clock',
                color: '#FFC107'
            },
            {
                title: 'Do not Disturb',
                icon : 'icon-minus-circle',
                color: '#F44336'
            },
            {
                title: 'Invisible',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#BDBDBD'
            },
            {
                title: 'Offline',
                icon : 'icon-checkbox-blank-circle-outline',
                color: '#616161'
            }
        ];

        this.navigation = navigation;

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
                this.currentTheme = this.fuseConfig.colorTheme;

                this.horizontalNavbar = config.layout.navbar.position === 'top';
                this.rightNavbar = config.layout.navbar.position === 'right';
                this.hiddenNavbar = config.layout.navbar.hidden === true;
            });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    toggleSidebarOpen(key): void
    {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    search(value): void
    {
        // Do your search here...
        console.log(value);
    }

    onLogout(ev: any): void
    {
        RVAlertsService.confirm('Logout', 'Are you sure to logout?').subscribe((result: RVAlertAction) =>
        {
            if (result.positive)
            {
                window.location.href = '/logout';
            }
        });
    }

    changeTheme(theme: string)
    {
        if(theme === this.currentTheme)
            return;

        this.fuseConfig.colorTheme = theme === 'light' ? 'theme-light' : 'theme-default';
        this._fuseConfigService.config = this.fuseConfig;
    }
}
