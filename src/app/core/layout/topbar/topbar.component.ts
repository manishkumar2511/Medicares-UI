import { Component, inject, signal, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { PrimematerialModule } from '../../primematerial.module';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { NavMenuItem } from '../../interfaces/nav-menu-item';
import { MenuItem } from 'primeng/api';

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
    private themeService = inject(ThemeService);
    private router = inject(Router);

    mobileMenuOpen = false;

    public user$ = this.authService.user$;
    public isAuthenticated$ = this.authService.isAuthenticated$;
    public isDarkMode = this.themeService.isDarkMode;

    public breadcrumbItems: MenuItem[] = [
        { label: 'Home', routerLink: '/' },
        { label: 'Dashboard' },
    ];

    public guestNavItems: NavMenuItem[] = [
        { title: 'Home', href: '/home' },
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
                this.router.navigate(['/home']);
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
        this.router.navigate(['/home']);
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
