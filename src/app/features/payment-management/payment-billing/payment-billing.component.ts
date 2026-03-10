import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PrimematerialModule } from '../../../core/primematerial.module';
import { SubscriptionPlanService } from '../../../core/services';
import { SubscriptionPlan } from '../../../core/models';

@Component({
  selector: 'app-payment-billing',
  standalone: true,
  imports: [CommonModule, PrimematerialModule],
  templateUrl: './payment-billing.component.html',
  styleUrls: ['./payment-billing.component.scss']
})
export class PaymentBillingComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private subscriptionPlanService = inject(SubscriptionPlanService);

  plan: any;
  subtotal: number = 0;
  tax: number = 0;
  total: number = 0;

  paymentMethods = [
    {
      id: 'upi_apps',
      name: 'UPI Apps',
      description: 'PhonePe, Google Pay, Paytm',
      icon: 'pi pi-mobile',
      type: 'apps',
      options: [
        { id: 'phonepe', name: 'PhonePe', icon: 'https://img.icons8.com/color/48/phone-pe.png' },
        { id: 'gpay', name: 'Google Pay', icon: 'https://img.icons8.com/color/48/google-pay.png' },
        { id: 'paytm', name: 'Paytm', icon: 'https://img.icons8.com/color/48/paytm.png' }
      ]
    },
    { id: 'upi_id', name: 'UPI ID / VPA', description: 'Pay using any UPI ID', icon: 'pi pi-send', type: 'input' },
    { id: 'netbanking', name: 'Net Banking', description: 'All Indian Banks', icon: 'pi pi-building', type: 'select' }
  ];

  selectedMethodId: string = 'upi_apps';
  selectedAppId: string = 'phonepe';
  isPromoVisible: boolean = false;

  ngOnInit() {
    this.extractPlanData();
    this.calculateBilling();
  }

  private extractPlanData() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state?.['plan']) {
      this.plan = nav.extras.state['plan'];
      this.calculateBilling();
    } else {
      const planName = this.route.snapshot.queryParamMap.get('plan') || 'Basic';

      this.subscriptionPlanService.getSubscriptionPlans().subscribe({
        next: (res) => {
          if (res.succeeded && res.data) {
            const foundPlan = res.data.find(p => p.name.toLowerCase() === planName.toLowerCase());
            if (foundPlan) {
              this.plan = {
                ...foundPlan,
                price: foundPlan.price
              };
            }
          }

          if (!this.plan) {
            const planMap: any = {
              'Basic': { name: 'Basic', price: 999, description: 'Best for individual proprietors & small pharmacies' },
              'Bronze': { name: 'Bronze', price: 1499, description: 'Ideal for growing pharmacy businesses' },
              'Silver': { name: 'Silver', price: 2999, description: 'Advanced features for multiple stores' },
              'Gold': { name: 'Gold', price: 4999, description: 'Comprehensive enterprise-grade solution' }
            };
            this.plan = planMap[planName] || planMap['Basic'];
          }

          this.calculateBilling();
        },
        error: () => {
          // Fallback if API fails
          const planMap: any = {
            'Basic': { name: 'Basic', price: 999, description: 'Best for individual proprietors & small pharmacies' }
          };
          this.plan = planMap['Basic'];
          this.calculateBilling();
        }
      });
    }
  }

  calculateBilling() {
    let priceVal = this.plan?.price;
    if (typeof priceVal === 'string') {
      priceVal = priceVal.replace(/[^\d.]/g, '');
    }

    this.subtotal = Number(priceVal) || 0;
    this.tax = this.subtotal * 0.18; 
    this.total = this.subtotal + this.tax;
  }

  selectMethod(id: string) {
    this.selectedMethodId = id;
  }

  selectApp(id: string) {
    this.selectedAppId = id;
  }

  payNow() {
    console.log('Processing payment for:', this.plan.name, 'Total:', this.total, 'Method:', this.selectedMethodId);
    
  }

  togglePromo() {
    this.isPromoVisible = !this.isPromoVisible;
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
  }
}
