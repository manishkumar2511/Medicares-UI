import { Component, HostListener, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../primematerial.module';

@Component({
  selector: 'app-support-tab',
  standalone: true,
  imports: [CommonModule, PrimematerialModule],
  templateUrl: './support-tab.component.html',
  styleUrl: './support-tab.component.scss'
})
export class SupportTabComponent implements AfterViewChecked {
  @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

  public y = 300; 
  public isDragging = false;
  public showChat = signal(false);
  public hasTyped = signal(false);

  private startY = 0;
  private startTop = 0;
  private clickTime = 0;

  ngAfterViewChecked() {        
    this.scrollToBottom();        
  } 

  scrollToBottom(): void {
    try {
        if (this.myScrollContainer) {
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        }
    } catch(err) { }                 
  }

  isMobile() {
    return typeof window !== 'undefined' && window.innerWidth <= 991;
  }

  // MOUSE EVENTS
  onMouseDown(event: MouseEvent) {
    this.initDrag(event.clientY);
    this.clickTime = Date.now();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    this.drag(event.clientY);
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.endDrag();
  }

  // TOUCH EVENTS (for Mobile/Tablet)
  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.initDrag(event.touches[0].clientY);
    this.clickTime = Date.now();
    // Don't call stopPropagation here to allow click detection
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.isDragging) {
        this.drag(event.touches[0].clientY);
        event.preventDefault(); // Prevent scrolling while dragging
    }
  }

  @HostListener('document:touchend')
  onTouchEnd() {
    this.endDrag();
  }

  // HELPER METHODS
  private initDrag(clientY: number) {
    this.isDragging = true;
    this.startY = clientY;
    this.startTop = this.y;
  }

  private drag(clientY: number) {
    if (!this.isDragging) return;
    const deltaY = clientY - this.startY;
    const maxY = typeof window !== 'undefined' ? window.innerHeight - 100 : 500;
    this.y = Math.max(80, Math.min(maxY, this.startTop + deltaY));
  }

  private endDrag() {
    this.isDragging = false;
  }

  toggleChat(event: MouseEvent | TouchEvent) {
    // If it was a quick click/tap and not a drag, open chat
    if (Date.now() - this.clickTime < 250) {
      this.showChat.set(true);
    }
  }
}