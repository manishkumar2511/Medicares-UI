import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ThemeService } from '../../core/services/theme.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule],
  templateUrl:'./navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  
  mobileMenuOpen = false;
  userMenuOpen = false;
  constructor(public themeService: ThemeService, private router: Router, public auth: AuthService) {}
    closeMenu(): void {
      if (this.mobileMenuOpen) {
        this.mobileMenuOpen = false;
      }
    }
    navigateToHome(): void {
    this.router.navigate(['/home']);
    this.closeMenu();
  }
  navigateToLogin(): void {
    this.router.navigate(['/account/login']);
    this.closeMenu();
  }
  navigateToOwnerRegistration(): void {
    this.router.navigate(['/account/owner-registration']);
    this.closeMenu();
  }



  get isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.closeMenu();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  // get currentUser() {
  //   // return reactive current user from the auth signal so template updates
  //   return this.auth.currentUser();
  // }

  // isSuperAdmin(): boolean {
  //   const cu = this.auth.currentUser();
  //   return !!(cu && cu.role === 'SuperAdmin');
  // }

  logout(): void {
    this.auth.logout();
    this.closeMenu();
    this.userMenuOpen = false;
  }
}
