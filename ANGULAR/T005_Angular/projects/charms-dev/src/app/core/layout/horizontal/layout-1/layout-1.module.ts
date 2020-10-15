import { NgModule } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';

import {
    FuseSidebarModule, FuseSharedModule, ContentModule, NavbarModule
} from 'charms-lib';

import { FooterModule } from '../../components/footer/footer.module';
import { QuickPanelModule } from '../../components/quick-panel/quick-panel.module';
import { ToolbarModule } from '../../components/toolbar/toolbar.module';
import { HorizontalLayout1Component } from '../../horizontal/layout-1/layout-1.component';

@NgModule({
    declarations: [
        HorizontalLayout1Component
    ],
    imports     : [
        MatSidenavModule,

        FuseSharedModule,
        FuseSidebarModule,

        ContentModule,
        FooterModule,
        NavbarModule,
        QuickPanelModule,
        ToolbarModule
    ],
    exports     : [
        HorizontalLayout1Component
    ]
})
export class HorizontalLayout1Module
{
}
