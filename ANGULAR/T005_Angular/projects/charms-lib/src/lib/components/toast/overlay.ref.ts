import { OverlayRef } from '@angular/cdk/overlay';

export class ToastRef
{
  constructor(private readonly overlay: OverlayRef) { }

  close(): void
  {
    this.overlay.dispose();
  }

  isVisible(): any
  {
    return this.overlay && this.overlay.overlayElement;
  }

  getPosition(): any
  {
    return this.overlay.overlayElement.getBoundingClientRect();
  }
}