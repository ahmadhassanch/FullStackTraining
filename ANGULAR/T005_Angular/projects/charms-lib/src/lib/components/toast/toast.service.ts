import { Injectable, Injector, Inject } from '@angular/core';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { Overlay } from '@angular/cdk/overlay';

import { ToastComponent } from './toast.component';
import { ToastRef } from './overlay.ref';
import { ToastConfig, TOAST_CONFIG_TOKEN, ToastData } from './toast.config';


@Injectable({
  providedIn: 'root'
})
export class ToastService {

    private static _instance: ToastService = null;
    private lastToast: ToastRef;

    constructor(private overlay: Overlay,
        private parentInjector: Injector,
        @Inject(TOAST_CONFIG_TOKEN) readonly toastConfig: ToastConfig)
    {
        if (ToastService._instance == null)
        {
            ToastService._instance = this;
        }
    }

    public static showToast(data: ToastData)
    {
        const positionStrategy = this._instance.getPositionStrategy();
        const overlayRef = this._instance.overlay.create({ positionStrategy });

        const toastRef = new ToastRef(overlayRef);
        this._instance.lastToast = toastRef;

        const injector = this._instance.getInjector(data, toastRef, this._instance.parentInjector);
        const toastPortal = new ComponentPortal(ToastComponent, null, injector);

        overlayRef.attach(toastPortal);

        return toastRef;
    }

    getInjector(data: ToastData, toastRef: ToastRef, parentInjector: Injector)
    {
        const tokens = new WeakMap();

        tokens.set(ToastData, data);
        tokens.set(ToastRef, toastRef);

        return new PortalInjector(parentInjector, tokens)
    }

    getPositionStrategy()
    {
        return this.overlay.position()
          .global()
          .top(this.getPosition())
          .right(this.toastConfig.position.right + 'px');
    }

    getPosition()
    {
        const lastToastIsVisible = this.lastToast && this.lastToast.isVisible();
        const position = lastToastIsVisible
          ? this.lastToast.getPosition().bottom
          : this.toastConfig.position.top;

        return position + 'px';
    }
}