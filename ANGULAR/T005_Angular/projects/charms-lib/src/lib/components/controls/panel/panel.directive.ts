import { Directive } from '@angular/core';
import { ElementRef } from '@angular/core';

@Directive({
    selector: '[chiPanelClose]'
})
export class  ChiPanelCloseDirective
{
    private closeHandler: any;

    constructor(public _elRef: ElementRef<HTMLElement>)
    {
        this._elRef.nativeElement.addEventListener('click', (event: MouseEvent) =>
        {
            this.closeHandler();
        });
    }

    setClose(h: any)
    {
        this.closeHandler = h;
    }
}