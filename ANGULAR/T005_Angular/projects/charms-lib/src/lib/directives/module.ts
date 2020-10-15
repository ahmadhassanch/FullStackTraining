import { NgModule } from '@angular/core';

import { DraggableDialogDirective } from './draggable/draggable.directive';
import { FuseIfOnDomDirective } from './fuse-if-on-dom/fuse-if-on-dom.directive';
import { FuseInnerScrollDirective } from './fuse-inner-scroll/fuse-inner-scroll.directive';
import { FusePerfectScrollbarDirective } from './fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { FuseMatSidenavHelperDirective, FuseMatSidenavTogglerDirective } from './fuse-mat-sidenav/fuse-mat-sidenav.directive';
import { NumbersOnlyDirective } from './validation-directivess/only_positive_decimal';

@NgModule({
    declarations: [
        DraggableDialogDirective,
        FuseIfOnDomDirective,
        FuseInnerScrollDirective,
        FuseMatSidenavHelperDirective,
        FuseMatSidenavTogglerDirective,
        FusePerfectScrollbarDirective,
        NumbersOnlyDirective,
    ],
    imports     : [],
    exports     : [
        DraggableDialogDirective,
        FuseIfOnDomDirective,
        FuseInnerScrollDirective,
        FuseMatSidenavHelperDirective,
        FuseMatSidenavTogglerDirective,
        FusePerfectScrollbarDirective,
        NumbersOnlyDirective
    ]
})
export class FuseDirectivesModule
{
}
