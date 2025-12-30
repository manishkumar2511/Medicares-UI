import { Component, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { PrimematerialModule } from '../../primematerial.module';
import { AuthService } from '../../services/auth.service';
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
    private router = inject(Router);
    public user$ = this.authService.user$;
    public menuItems: NavMenuItem[] = []; 

    ngOnInit() {
        this.authService.user$.subscribe(user => {
            if (user && user.role) {
                this.setMenuItems(user.role as string);
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

    onMenuItemClick(item: NavMenuItem) {
        if (item.clickEvent === 'logout') {
            this.logout();
        }
    }

    logout() {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/home']);
            }
        });
    }
}
