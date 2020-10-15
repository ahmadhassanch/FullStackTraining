import { Component } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

@Component({
    selector     : 'content',
    templateUrl  : './content.component.html',
    styleUrls    : ['./content.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ContentComponent
{
    /**
     * Constructor
     */
    constructor()
    {
    }
}
