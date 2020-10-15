import { Component } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { Inject } from '@angular/core';

import { AnimationEvent } from '@angular/animations';
import { ToastRef } from './overlay.ref';

import { ToastData, TOAST_CONFIG_TOKEN, ToastConfig } from './toast.config';
import { toastAnimations, ToastAnimationState } from './toast.animations';


@Component({
    selector: 'toast-notification',
    templateUrl: 'toast.component.html',
    styleUrls: ['toast.component.scss'],
    animations: [toastAnimations.fadeToast],
})
export class ToastComponent implements OnInit, OnDestroy
{

    iconType = 'done';
    intervalId: any;
    animationState: ToastAnimationState = 'default';

    constructor(readonly data: ToastData,
                readonly overlayRef: ToastRef,
                @Inject(TOAST_CONFIG_TOKEN) readonly toastConfig: ToastConfig)
    {
        if (data.type === 'warning')
        {
            this.iconType = 'error';
        }
        else if (data.type === 'info')
        {
            this.iconType = 'info';
        }
    }

    ngOnInit(): void
    {
        this.intervalId = setTimeout( () => this.animationState = 'closing', 5000);
    }

    ngOnDestroy(): void
    {
        clearTimeout(this.intervalId);
    }

    close(): void
    {
        this.overlayRef.close();
    }

    onFadeFinished(event: AnimationEvent): void
    {
        const { toState } = event;
        const isFadeOut = (toState as ToastAnimationState) === 'closing';
        const itFinished = this.animationState === 'closing';

        if (isFadeOut && itFinished) {
            this.close();
        }
    }
}