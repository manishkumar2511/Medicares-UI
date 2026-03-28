import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { AuthService } from '../services/auth.service';

import { SupportTabComponent } from './support-tab/support-tab.component';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent, FooterComponent, SupportTabComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
    private authService = inject(AuthService);
    public isAuthenticated = this.authService.isAuthenticatedSignal;

    public isSidebarOpen = signal(true);
    public isContentScrolled = signal(false);

    ngOnInit() {
        this.checkScreenSize();
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.checkScreenSize();
    }

    private lastWidth = 0;

    private checkScreenSize() {
        if (typeof window !== 'undefined') {
            const currentWidth = window.innerWidth;
            if (currentWidth === this.lastWidth) return;

            const wasMobile = this.lastWidth <= 991;
            const isMobile = currentWidth <= 991;

            // Only force a state change if we cross the breakpoint
            if (this.lastWidth === 0 || (wasMobile !== isMobile)) {
                this.isSidebarOpen.set(true); // Default to open/strip visible
            }

            this.lastWidth = currentWidth;
        }
    }

    toggleSidebar() {
        this.isSidebarOpen.update(v => !v);
    }

    @HostListener('window:scroll', [])
    onWindowScroll() {
        if (typeof window !== 'undefined') {
            this.isContentScrolled.set(window.scrollY > 50);
        }
    }
}
