import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import {
    FuseSharedModule, FuseSidebarModule, ContentModule, NavbarModule
} from 'charms-lib';

import { FooterModule } from '../../components/footer/footer.module';
import { QuickPanelModule } from '../../components/quick-panel/quick-panel.module';
import { ToolbarModule } from '../../components/toolbar/toolbar.module';
import { VerticalLayout1Component } from '../../vertical/layout-1/layout-1.component';

@NgModule({
    declarations: [
        VerticalLayout1Component
    ],
    imports     : [
        RouterModule,

        FuseSharedModule,
        FuseSidebarModule,

        ContentModule,
        FooterModule,
        NavbarModule,
        QuickPanelModule,
        ToolbarModule
    ],
    exports     : [
        VerticalLayout1Component
    ]
})
export class VerticalLayout1Module
{
}
