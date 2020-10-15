import { Directive } from '@angular/core';
import { AfterContentInit } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { Input } from '@angular/core';
import { ElementRef } from '@angular/core';
import { ViewContainerRef } from '@angular/core';
import { Inject } from '@angular/core';
import { Optional } from '@angular/core';

import { Overlay } from '@angular/cdk/overlay';
import { OverlayRef } from '@angular/cdk/overlay';
import { FlexibleConnectedPositionStrategy } from '@angular/cdk/overlay';
import { OverlayConfig } from '@angular/cdk/overlay';
import { ScrollStrategy } from '@angular/cdk/overlay';
import { HorizontalConnectionPos } from '@angular/cdk/overlay';
import { VerticalConnectionPos } from '@angular/cdk/overlay';

import { MAT_MENU_SCROLL_STRATEGY, MenuPositionX, MenuPositionY } from '@angular/material/menu';
import { Directionality } from '@angular/cdk/bidi';
import { TemplatePortal } from '@angular/cdk/portal';
import { merge, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ESCAPE, UP_ARROW } from '@angular/cdk/keycodes';

import { ChiPanelComponent } from './panel.component';

@Directive({
    selector: `[chiPanelFor]`,
    host: {
        'aria-haspopup': 'true',
        '(click)': '_handleClick($event)',
    },
})
export class ChiPanelTrigger implements AfterContentInit, OnDestroy
{
    _panelOpen = false;

    private _portal: TemplatePortal;
    private _overlayRef: OverlayRef | null = null;
    private _scrollStrategy: () => ScrollStrategy;
    private _closeSubscription = Subscription.EMPTY;

    _panelComponent: ChiPanelComponent;
    @Input()
    set chiPanelFor(value: ChiPanelComponent)
    {
        if (!value)
        {
            return;
        }

        this._panelComponent = value;
        this._panelComponent._trigger = this;
    }

    constructor(private _overlay: Overlay,
        private _element: ElementRef<HTMLElement>,
        private _viewContainerRef: ViewContainerRef,
        @Inject(MAT_MENU_SCROLL_STRATEGY) scrollStrategy: any,
        @Optional() private _dir: Directionality)
    {
        this._scrollStrategy = scrollStrategy;
    }

    ngAfterContentInit()
    {
    }

    ngOnDestroy()
    {
        if (this._overlayRef)
        {
            this._overlayRef.dispose();
            this._overlayRef = null;
        }

        this._closeSubscription.unsubscribe();
    }

    toggleFilter(): void
    {
        return this._panelOpen ? this.closeFilter() : this.openFilter();
    }

    openFilter()
    {
        if (this._panelOpen)
        {
            return;
        }

        const overlayRef = this._createOverlay();
        const overlayConfig = overlayRef.getConfig();

        this._setPosition(overlayConfig.positionStrategy as FlexibleConnectedPositionStrategy);
        overlayConfig.hasBackdrop = true;

        overlayRef.attach(this._getPortal());
        this._panelOpen = true;
        if (this._panelComponent.events)
            this._panelComponent.events.next('opened');

        this._closeSubscription = this._menuClosingActions().subscribe((e) =>
        {
            this.closeFilter();
        });

        // this._initMenu();
    }

    closeFilter()
    {
        if (!this._overlayRef || !this._panelOpen)
        {
            return;
        }

        this._panelOpen = false;
        if (this._panelComponent.events)
            this._panelComponent.events.next('closed');
        this._closeSubscription.unsubscribe();
        this._overlayRef.detach();
    }

    private _menuClosingActions()
    {
        const backdrop = this._overlayRef.backdropClick();
        const detachments = this._overlayRef.detachments();
        const keyEvents = this._overlayRef.keydownEvents().pipe(filter(event =>
        {
            return event.keyCode === ESCAPE || (event.altKey && event.keyCode === UP_ARROW);
        }));

        this._panelComponent.closeTriggers.forEach((e) =>
        {
            e.setClose(() => this.closeFilter());
        });

        return merge(backdrop, keyEvents, detachments);
    }

    private _getPortal(): TemplatePortal
    {
        if (!this._portal || this._portal.templateRef !== this._panelComponent.templateRef)
        {
            this._portal = new TemplatePortal(this._panelComponent.templateRef, this._viewContainerRef);
        }

        return this._portal;
    }

    private _createOverlay(): OverlayRef
    {
        if (!this._overlayRef)
        {
          const config = this._getOverlayConfig();
          this._subscribeToPositions(config.positionStrategy as FlexibleConnectedPositionStrategy);
          this._overlayRef = this._overlay.create(config);

          // Consume the `keydownEvents` in order to prevent them from going to another overlay.
          // Ideally we'd also have our keyboard event logic in here, however doing so will
          // break anybody that may have implemented the `MatMenuPanel` themselves.
          this._overlayRef.keydownEvents().subscribe();
        }

        return this._overlayRef;
    }

    private _getOverlayConfig(): OverlayConfig
    {
        return new OverlayConfig({
          positionStrategy: this._overlay.position()
              .flexibleConnectedTo(this._element)
              .withLockedPosition()
              .withTransformOriginOn('.rv-dd-panel'),
          backdropClass: 'cdk-overlay-transparent-backdrop',    //'cdk-overlay-dark-backdrop',
          scrollStrategy: this._scrollStrategy(),
          direction: this._dir
        });
    }

    private _subscribeToPositions(position: FlexibleConnectedPositionStrategy): void
    {
        if (this._panelComponent.setPositionClasses)
        {
            position.positionChanges.subscribe(change =>
            {
                const posX: MenuPositionX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                const posY: MenuPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';

                this._panelComponent.setPositionClasses!(posX, posY);
            });
        }
    }

    private _setPosition(positionStrategy: FlexibleConnectedPositionStrategy)
    {
        let [originX, originFallbackX]: HorizontalConnectionPos[] =
            this._panelComponent.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

        let [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
            this._panelComponent.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

        let [originY, originFallbackY] = [overlayY, overlayFallbackY];
        let [overlayX, overlayFallbackX] = [originX, originFallbackX];
        let offsetY = 0;

        positionStrategy.withPositions([
            {originX, originY, overlayX, overlayY, offsetY},
            {originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY},
            {
                originX,
                originY: originFallbackY,
                overlayX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY
            },
            {
                originX: originFallbackX,
                originY: originFallbackY,
                overlayX: overlayFallbackX,
                overlayY: overlayFallbackY,
                offsetY: -offsetY
            }
        ]);
    }

    _handleClick(event: MouseEvent): void
    {
        this.toggleFilter();
    }

}