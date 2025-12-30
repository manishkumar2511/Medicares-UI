import { Component, inject, signal, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { TopbarComponent } from './topbar/topbar.component';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SidebarComponent, TopbarComponent],
    templateUrl: './layout.component.html',
    styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
    private authService = inject(AuthService);
    public isAuthenticated$ = this.authService.isAuthenticated$;

    public isSidebarOpen = signal(true);

    ngOnInit() {
        this.checkScreenSize();
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        this.checkScreenSize();
    }

    private checkScreenSize() {
        if (typeof window !== 'undefined') {
            const isMobile = window.innerWidth <= 991;
            if (isMobile) {
                this.isSidebarOpen.set(false);
            } else {
                this.isSidebarOpen.set(true);
            }
        }
    }

    toggleSidebar() {
        this.isSidebarOpen.update(v => !v);
    }
}
