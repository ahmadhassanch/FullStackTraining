import { Directive } from '@angular/core';
import { NgZone } from '@angular/core';
import { OnDestroy } from '@angular/core';
import { OnInit } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Input } from '@angular/core';
import { ElementRef } from '@angular/core';
import { OnChanges } from '@angular/core';

import { Subject, fromEvent } from 'rxjs';
import { switchMap, map, takeUntil } from 'rxjs/operators';
import { TargetedEventDispatcher } from '@amcharts/amcharts4/core';

@Directive({
    selector: '[appChiDraggableDialog]',
  })
  export class ChiDraggableDialogDirective implements OnInit, OnChanges, OnDestroy {
    @Input() isMinimized = false;
    @Input() nestedParents = 4;

    // Element to be dragged
    private target: HTMLElement;

    // dialog container element to resize
    private _container: HTMLElement;

    // Drag handle
    private handle: HTMLElement;
    private _delta = {x: 0, y: 0};
    private _offset = {x: 0, y: 0};

    oldOffset: any = {x: 0, y: 0};

    private _destroy$ = new Subject<void>();

    constructor(
        private _elementRef: ElementRef,
        private _zone: NgZone,
        private _cd: ChangeDetectorRef,
    ) {}

    public ngOnInit(): void {
      this._elementRef.nativeElement.style.cursor = 'pointer';
      this.handle = this._elementRef.nativeElement;

      let parent = this._elementRef.nativeElement;
      let container = this._elementRef.nativeElement;
      for (let i = 0; i < this.nestedParents; i++)
      {
        parent = parent.parentElement;

        if (i < this.nestedParents - 2)
        {
          container = container.parentElement;
        }
      }

      this.target = parent;
      this._container = container;

      // this.target = this._elementRef.nativeElement.parentElement.parentElement.parentElement.parentElement;
      // this._container = this._elementRef.nativeElement.parentElement.parentElement;
      this._container.style.overflow = 'hidden';

      this._setupEvents();
      setTimeout(() =>
      {
        this.loadElements();
      }, 1000);
    }

    loadElements(): void
    {
    }

    ngOnChanges()
    {
      // For mimimize and maximize case of dialog
      if (this.isMinimized)
      {
        this.oldOffset = {x: this._offset.x, y: this._offset.y };

        this._offset.x = 0;
        this._offset.y = 0;
        this._delta.x = 0;
        this._delta.y = 0;

        this._translate();
      }
      else {
        this._offset.x = this.oldOffset.x;
        this._offset.y = this.oldOffset.y;
        this._translate();
      }
    }

    public ngOnDestroy(): void {
      if (!!this._destroy$ && !this._destroy$.closed) {
        this._destroy$.next();
        this._destroy$.complete();
      }
    }

    private _setupEvents() {
      this._zone.runOutsideAngular(() => {
        const mousedown$ = fromEvent(this.handle, 'mousedown');
        const mousemove$ = fromEvent(document, 'mousemove');
        const mouseup$ = fromEvent(document, 'mouseup');

        const mousedrag$ = mousedown$.pipe(
          switchMap((event: MouseEvent) => {
            const startX = event.clientX;
            const startY = event.clientY;

            return mousemove$.pipe(
                map((innerEvent: MouseEvent) => {
                    innerEvent.preventDefault();
                    this._delta = {
                    x: innerEvent.clientX - startX,
                    y: innerEvent.clientY - startY,
                    };
                }),
                takeUntil(mouseup$),
            );
          }),
          takeUntil(this._destroy$),
        );

        mousedrag$.subscribe(() => {
          if (this._delta.x === 0 && this._delta.y === 0) {
                return;
          }

          this._translate();
        });

        mouseup$.pipe(takeUntil(this._destroy$)).subscribe(() =>
        {
          this._offset.x += this._delta.x;
          this._offset.y += this._delta.y;

          this._delta = {x: 0, y: 0};
          this._cd.markForCheck();
          });
      });
    }

    private _translate() {
      requestAnimationFrame(() => {
            this.target.style.transform = `
            translate(${this._offset.x + this._delta.x}px,
                ${this._offset.y + this._delta.y}px)
            `;
        });
    }
}
