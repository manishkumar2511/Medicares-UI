import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { SubscriptionPlanService } from '../../core/services';
import { SubscriptionPlan } from '../../core/models';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pricing.component.html',
  styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit {
  private subscriptionPlanService = inject(SubscriptionPlanService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  
  public plans = signal<SubscriptionPlan[]>([]);
  public isLoading = signal(true);
  ownerId: string | null = null;

  ngOnInit() {
    this.ownerId = this.route.snapshot.queryParamMap.get('ownerId');
    this.loadPlans();
  }

  loadPlans() {
    this.isLoading.set(true);
    this.subscriptionPlanService.getSubscriptionPlans().subscribe({
      next: (res) => {
        if (res.succeeded) {
          // Filter only active plans for the landing/pricing page if needed, 
          // but for now showing what's returned.
          this.plans.set(res.data || []);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading plans:', err);
        this.isLoading.set(false);
      }
    });
  }

  getFeatures(description: string | undefined): string[] {
    if (!description) return [];
    return description.split(',').map(f => f.trim());
  }

  selectPlan(plan: SubscriptionPlan) {
    const planForPayment = {
      ...plan,
      price: plan.price > 0 ? `₹${plan.price}` : 'Contact Us',
      period: plan.price > 0 ? (plan.durationInDays === 30 ? '/mo' : `/${plan.durationInDays} days`) : ''
    };

    this.router.navigate(['/payment-management/payment-billing'], {
      queryParams: { 
        plan: plan.name,
        ownerId: this.ownerId
       },
      state: { plan: planForPayment }
    });
  }
}
