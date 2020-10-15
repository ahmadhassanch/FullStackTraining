import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';


import { ContentComponent } from './content.component';
import { FuseSharedModule } from '../../../shared.module';


@NgModule({
    declarations: [
        ContentComponent
    ],
    imports     : [
        RouterModule,
        FuseSharedModule
    ],
    exports     : [
        ContentComponent
    ]
})
export class ContentModule
{
}
