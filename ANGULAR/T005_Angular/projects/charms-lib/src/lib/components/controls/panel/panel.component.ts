import { Component } from '@angular/core';
import { Inject } from '@angular/core';
import { OnInit } from '@angular/core';
import { ContentChildren } from '@angular/core';
import { Input } from '@angular/core';
import { ViewChild } from '@angular/core';
import { TemplateRef } from '@angular/core';
import { QueryList } from '@angular/core';


import { OverlayRef } from '@angular/cdk/overlay';
import { MenuPositionX, MenuPositionY, MAT_MENU_DEFAULT_OPTIONS, MatMenuDefaultOptions } from '@angular/material/menu';

import { Subject } from 'rxjs';

import { ChiPanelCloseDirective } from './panel.directive';
import { ChiPanelTrigger } from './panel-trigger';



@Component({
    selector: 'chi-panel',
    templateUrl: 'panel.component.html',
    styleUrls: ['panel.component.scss'],
    exportAs: 'chiPanel'
})
export class ChiPanelComponent implements OnInit
{
    @Input() events: Subject<any>;

    @ViewChild(TemplateRef) templateRef: TemplateRef<any>;
    @ContentChildren(ChiPanelCloseDirective, {descendants: true}) closeTriggers: QueryList<ChiPanelCloseDirective>;

    showCustom = false;

    _popupRef: OverlayRef;
    _classList: {[key: string]: boolean} = {};

    xPosition: MenuPositionX = this._defaultOptions.xPosition;
    yPosition: MenuPositionY = this._defaultOptions.yPosition;

    _trigger: ChiPanelTrigger;

    constructor(@Inject(MAT_MENU_DEFAULT_OPTIONS) private _defaultOptions: MatMenuDefaultOptions)
    {
    }

    ngOnInit()
    {
        this.setPositionClasses();
    }


    onOpenFilter()
    {
        this.showCustom = !this.showCustom;
    }

    setPositionClasses(posX: MenuPositionX = this.xPosition, posY: MenuPositionY = this.yPosition)
    {
        const classes = this._classList;
        classes['mat-menu-before'] = posX === 'before';
        classes['mat-menu-after'] = posX === 'after';
        classes['mat-menu-above'] = posY === 'above';
        classes['mat-menu-below'] = posY === 'below';
    }

    closePanel()
    {
        if (this._trigger !== void 0)
            this._trigger.closeFilter();
    }

}