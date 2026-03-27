import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenubarModule } from 'primeng/menubar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { MenuItem } from 'primeng/api';
import { ThemeService } from '../services/theme.service';
import { SharedModule } from '../../shared/shared.module';
import { SubscriptionPlanService } from '../services';
import { SubscriptionPlan, SubscriptionPlanType } from '../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ButtonModule, CardModule, MenubarModule, ToggleButtonModule, SharedModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  mobileMenuOpen = false;
  private subscriptionPlanService = inject(SubscriptionPlanService);
  private router = inject(Router);
  public themeService = inject(ThemeService);

  pricingPlans: any[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadPlans();
  }

  loadPlans() {
    this.isLoading = true;
    this.subscriptionPlanService.getSubscriptionPlans().subscribe({
      next: (res) => {
        if (res.succeeded && res.data) {
          // Mapping dynamic API data to the format used in our template
          this.pricingPlans = res.data.map(p => {
            let badgeText = '';
            if (p.type === SubscriptionPlanType.Standard) {
              badgeText = 'Most Popular';
            } else if (p.type === SubscriptionPlanType.Premium) {
              badgeText = 'Premium';
            }

            return {
              ...p,
              price: p.price > 0 ? `₹${p.price}` : 'Free/Contact',
              period: p.price > 0 ? (p.durationInDays === 30 ? '/mo' : `/${p.durationInDays} days`) : '',
              badgeText: badgeText,
              features: this.getFeatures(p.description)
            };
          });
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching plans for home:', err);
        this.isLoading = false;
      }
    });
  }

  getFeatures(description: string | undefined): string[] {
    if (!description) return [];
    return description.split(',').map(f => f.trim());
  }

  selectPlan(plan: any) {
    this.router.navigate(['/payment-management/payment-billing'], { 
      queryParams: { plan: plan.name }, 
      state: { plan } 
    });
  }

  menuItems: MenuItem[] = [
    {
      label: 'Home',
      icon: 'pi pi-home',
      routerLink: ['/']
    },
    {
      label: 'Features',
      icon: 'pi pi-star',
      routerLink: ['/features']
    },
    {
      label: 'Pricing',
      icon: 'pi pi-dollar',
      routerLink: ['/pricing']
    },
    {
      label: 'About',
      icon: 'pi pi-info-circle',
      routerLink: ['/about']
    },
    {
      label: 'Contact',
      icon: 'pi pi-envelope',
      routerLink: ['/contact']
    }
  ];

  clients = [
    { name: 'MediCare Plus', logo: '🏥' },
    { name: 'HealthFirst', logo: '💊' },
    { name: 'PharmaCorp', logo: '⚕️' },
    { name: 'Wellness Hub', logo: '🏥' },
    { name: 'CareMax', logo: '💉' },
    { name: 'HealthLink', logo: '🩺' }
  ];

  bannerQuote = "Empowering Healthcare Stores with Smart Management Solutions";
  bannerSubtext = "Join thousands of healthcare providers who trust our platform to streamline their operations and grow their business.";

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
