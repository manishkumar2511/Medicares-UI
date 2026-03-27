import { Component, HostListener, signal, ViewChild, ElementRef, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../primematerial.module';
import { AuthService } from '../../services/auth.service';

interface ChatMessage {
    text: string;
    sender: 'user' | 'assistant';
    time: string;
    status?: 'sent' | 'delivered' | 'read';
}

@Component({
    selector: 'app-support-tab',
    standalone: true,
    imports: [CommonModule, PrimematerialModule],
    templateUrl: './support-tab.component.html',
    styleUrl: './support-tab.component.scss'
})
export class SupportTabComponent implements AfterViewChecked {
    private authService = inject(AuthService);
    @ViewChild('scrollMe') private myScrollContainer!: ElementRef;

    public y = 300;
    public isDragging = false;
    public showChat = signal(false);
    public isTyping = signal(false);
    public userInput = signal('');

    public messages = signal<ChatMessage[]>([
        {
            text: "Hello! I'm your Medicares Solutions assistant. How can I help you today?",
            sender: 'assistant',
            time: this.getCurrentTime()
        }
    ]);

    private startY = 0;
    private startTop = 0;
    private clickTime = 0;

    private readonly REPLY_MAP: Record<string, string> = {
        'billing': "Our billing dashboard allows you to track sales, generate invoices, and manage taxes in real-time. Would you like a tour?",
        'inventory': "The Inventory module helps you manage medicine batches, expiry dates, and stock levels effortlessly.",
        'stock': "You can set low-stock alerts in the Inventory settings to never run out of essential medicines.",
        'pricing': "We offer various subscription plans tailored for small to large pharmacies. Check the 'Our Plans' page for details.",
        'help': "I can assist you with Billing, Inventory, or account settings. Just mention the module name!",
        'hello': "Hi there! How can I assist you with Medicares Solutions today?",
        'hi': "Hello! Ready to manage your pharmacy today? How can I help?",
    };

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            if (this.myScrollContainer) {
                this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
            }
        } catch (err) { }
    }

    getCurrentTime(): string {
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    onSendMessage() {
        const text = this.userInput().trim();
        if (!text) return;

        // 1. Add User Message
        const userMsg: ChatMessage = {
            text: text,
            sender: 'user',
            time: this.getCurrentTime(),
            status: 'read'
        };
        this.messages.update(prev => [...prev, userMsg]);
        this.userInput.set('');

        // 2. Trigger Auto-Reply
        this.generateAutoReply(text);
    }

    private generateAutoReply(query: string) {
        this.isTyping.set(true);

        // Simulate thinking delay
        setTimeout(() => {
            const lowerQuery = query.toLowerCase();
            let replyText = "I'm still learning! Let me look into that for you, or feel free to ask about Billing or Inventory.";

            // Find match in keyword map
            for (const key in this.REPLY_MAP) {
                if (lowerQuery.includes(key)) {
                    replyText = this.REPLY_MAP[key];
                    break;
                }
            }

            const assistantMsg: ChatMessage = {
                text: replyText,
                sender: 'assistant',
                time: this.getCurrentTime()
            };

            this.messages.update(prev => [...prev, assistantMsg]);
            this.isTyping.set(false);
        }, 1500);
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

    // TOUCH EVENTS
    @HostListener('touchstart', ['$event'])
    onTouchStart(event: TouchEvent) {
        this.initDrag(event.touches[0].clientY);
        this.clickTime = Date.now();
    }

    @HostListener('document:touchmove', ['$event'])
    onTouchMove(event: TouchEvent) {
        if (this.isDragging) {
            this.drag(event.touches[0].clientY);
            event.preventDefault();
        }
    }

    @HostListener('document:touchend')
    onTouchEnd() {
        this.endDrag();
    }

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

    trackByFn(index: number, item: any) {
        return index;
    }

    toggleChat(event: MouseEvent | TouchEvent) {
        if (Date.now() - this.clickTime < 250) {
            this.showChat.set(true);
        }
    }
}