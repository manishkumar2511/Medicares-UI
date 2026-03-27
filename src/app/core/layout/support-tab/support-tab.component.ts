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
        this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
    } catch(err) { }                 
  }

  isMobile() {
    return typeof window !== 'undefined' && window.innerWidth <= 650;
  }

  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.startY = event.clientY;
    this.startTop = this.y;
    this.clickTime = Date.now();
    event.stopPropagation();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    const deltaY = event.clientY - this.startY;
    this.y = Math.max(80, Math.min(window.innerHeight - 150, this.startTop + deltaY));
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  toggleChat(event: MouseEvent) {
    // If it was a quick click and not a drag, open chat
    if (Date.now() - this.clickTime < 200) {
      this.showChat.set(true);
    }
  }
}