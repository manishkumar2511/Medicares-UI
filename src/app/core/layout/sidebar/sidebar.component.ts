import { Component, Input, Output, EventEmitter, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PrimematerialModule } from '../../primematerial.module';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { StoreService } from '../../services/store/store.service';
import { NavMenuItem } from '../../interfaces/nav-menu-item';
import {
    SuperAdminSidebarMenuItems,
    AdminSidebarMenuItems,
    StoreManagerSidebarMenuItems,
    StoreStaffSidebarMenuItems
} from '../../constants/nav-menu-items';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive, PrimematerialModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
    @Input() isOpen = true;
    @Output() toggleSidebar = new EventEmitter<void>();

    private authService = inject(AuthService);
    public themeService = inject(ThemeService);
    private storeService = inject(StoreService);
    private router = inject(Router);
    public user$ = this.authService.user$;
    public menuItems: NavMenuItem[] = [];
    public storeName = signal('Add Your Store');
    public hasStore = signal(false);
    private openMenus = new Set<string>();

    ngOnInit() {
        this.authService.user$.subscribe(user => {
            if (user && user.role) {
                this.setMenuItems(user.role as string);
                if (user.role?.toLowerCase() === 'admin' || user.role?.toLowerCase() === 'owner') {
                    this.loadStoreName();
                }
            }
        });
    }

    private loadStoreName(): void {
        this.storeService.getMyStores().subscribe({
            next: (res) => {
                if (res.succeeded && res.data && res.data.length > 0) {
                    this.storeName.set(res.data[0].name);
                    this.hasStore.set(true);
                } else {
                    this.storeName.set('Add Your Store');
                    this.hasStore.set(false);
                }
            }
        });
    }

    private setMenuItems(role: string) {
        const roleLower = role?.toLowerCase();
        switch (roleLower) {
            case 'superadmin':
                this.menuItems = SuperAdminSidebarMenuItems;
                break;
            case 'admin':
            case 'owner':
                this.menuItems = AdminSidebarMenuItems;
                break;
            case 'storemanager':
                this.menuItems = StoreManagerSidebarMenuItems;
                break;
            case 'storestaff':
                this.menuItems = StoreStaffSidebarMenuItems;
                break;
            default:
                this.menuItems = [];
        }
    }

    onToggle() {
        this.toggleSidebar.emit();
    }

    goToDashboard(): void {
        this.router.navigate(['/owner-dashboard']);
    }

    onMenuItemClick(item: NavMenuItem) {
        if (item.clickEvent === 'logout') {
            this.logout();
            return;
        }

        if (item.subItems && item.subItems.length > 0) {
            this.toggleMenu(item);
        }
    }

    toggleMenu(item: NavMenuItem) {
        if (!this.isOpen) {
            this.onToggle();
        }
        const title = item.title;
        if (this.openMenus.has(title)) {
            this.openMenus.delete(title);
        } else {
            this.openMenus.add(title);
        }
    }

    isMenuOpen(item: NavMenuItem): boolean {
        if (!this.isOpen) return true;
        return this.openMenus.has(item.title);
    }

    getInitial(user: any): string {
        if (user && user.firstName) {
            return user.firstName.charAt(0).toUpperCase();
        } else if (user && user.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return 'U';
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
}
