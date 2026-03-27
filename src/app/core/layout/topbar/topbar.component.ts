import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PrimematerialModule } from '../../primematerial.module';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NavMenuItem } from '../../interfaces/nav-menu-item';
import { MenuItem } from 'primeng/api';

import { filter, map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd } from '@angular/router';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [CommonModule, RouterLink, PrimematerialModule],
    templateUrl: './topbar.component.html',
    styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
    @Input() isSidebarOpen = true;
    @Output() toggleSidebar = new EventEmitter<void>();

    private authService = inject(AuthService);
    public themeService = inject(ThemeService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

    mobileMenuOpen = false;
    public pageTitle = '';

    public user$ = this.authService.user$;
    public isAuthenticated = this.authService.isAuthenticatedSignal;
    public isDarkMode = this.themeService.isDarkMode;

    constructor() {
        this.updatePageTitle();
        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => this.updatePageTitle());
    }

    private updatePageTitle() {
        try {
            let route = this.activatedRoute.root;
            while (route.firstChild) {
                route = route.firstChild;
            }
            // Use ?. for safety
            this.pageTitle = route.snapshot?.title || route.snapshot?.data?.['title'] || '';
        } catch (e) {
            this.pageTitle = '';
        }
    }

    public breadcrumbItems: MenuItem[] = [
        { label: 'Home', routerLink: '/' },
        { label: 'Dashboard' },
    ];

    public guestNavItems: NavMenuItem[] = [
        { title: 'Home', href: '/' },
        { title: 'Pricing', href: '/pricing' },
        { title: 'About', href: '/about' },
        { title: 'Contact', href: '/contact' },
    ];

    onToggleSidebar() {
        this.toggleSidebar.emit();
    }

    toggleTheme() {
        this.themeService.toggleTheme();
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/']);
            }
        });
    }

    navigateToLogin() {
        this.router.navigate(['/account/login']);
    }

    navigateToOwnerRegistration() {
        this.router.navigate(['/account/owner-registration']);
    }

    navigateToHome() {
        this.router.navigate(['/']);
    }

    navigateToProfile() {
        this.router.navigate(['/account/profile']);
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    closeMobileMenu() {
        this.mobileMenuOpen = false;
    }
}
