import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { PrimematerialModule } from '../../../core/primematerial.module';
import { SubscriptionPlanService, PaymentService, ToastService, AuthService } from '../../../core/services';
import { SubscriptionPlan, LoginResponse } from '../../../core/models';
import { MESSAGES } from '../../../core/constants';

declare var Razorpay: any;

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
  private paymentService = inject(PaymentService);
  private toastService = inject(ToastService);
  private authService = inject(AuthService);

  plan: any;
  ownerId: string | null = null;
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
      this.ownerId = this.route.snapshot.queryParamMap.get('ownerId');
      const planNameFromUrl = this.route.snapshot.queryParamMap.get('plan');

      this.subscriptionPlanService.getSubscriptionPlans().subscribe({
        next: (res) => {
          if (res.succeeded && res.data && res.data.length > 0) {
            const planInDb = res.data.find(p => p.name.toLowerCase() === (planNameFromUrl || 'Basic').toLowerCase());

            if (planInDb) {
              this.plan = planInDb;
            } else {
              // If requested plan name from URL is not in DB, fallback to Basic or first one
              this.plan = res.data.find(p => p.name.toLowerCase() === 'basic') || res.data[0];
            }
            this.calculateBilling();
          } else {
            this.handlePlanNotFound();
          }
        },
        error: () => this.handlePlanNotFound()
      });
    }
  }

  private handlePlanNotFound() {
    this.toastService.error(MESSAGES.PAYMENT.ERROR, MESSAGES.PAYMENT.PLAN_NOT_FOUND);
    this.router.navigate(['/pricing']);
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
    if (!this.plan || !this.plan.id) {
      this.toastService.error(MESSAGES.PAYMENT.ERROR, MESSAGES.PAYMENT.PLAN_NOT_FOUND);
      return;
    }

    this.toastService.info(MESSAGES.PAYMENT.PROCESSING, MESSAGES.PAYMENT.INITIATING);

    this.paymentService.createOrder(this.plan.id, this.ownerId || undefined).subscribe({
      next: (response) => {
        if (response.succeeded && response.data) {
          const { orderId, amount, currency, keyId } = response.data;
          this.openRazorpayModal(orderId, amount, currency, keyId);
        } else {
          this.toastService.error(MESSAGES.PAYMENT.ERROR, MESSAGES.PAYMENT.INIT_FAILED);
        }
      },
      error: (err) => {
        const errorMsg = err.messages?.[0] || MESSAGES.PAYMENT.GENERIC_ERROR;
        this.toastService.error(MESSAGES.PAYMENT.PAYMENT_FAILED_TITLE, errorMsg);
      }
    });
  }

  private openRazorpayModal(orderId: string, amount: number, currency: string, keyId: string) {
    const options = {
      key: keyId,
      amount: Math.round(amount * 100), // amount in paise
      currency: currency,
      name: 'Medicares',
      description: `Subscription for ${this.plan.name} Plan`,
      image: 'assets/images/medicares-badge.svg', // Ensure logo is mapped correctly
      order_id: orderId,
      handler: (response: any) => {
        this.verifyPayment(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      prefill: {
        name: '', // Can be extracted from user info if available
        email: '',
        contact: ''
      },
      theme: {
        color: '#0e7490' // Matching Medicares theme primary color
      }
    };

    try {
      const rzp = new Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        this.toastService.error(MESSAGES.PAYMENT.TRANSACTION_FAILED, response.error.description || 'Payment Failed');
      });
      rzp.open();
    } catch (err) {
      this.toastService.error(MESSAGES.PAYMENT.SDK_ERROR_TITLE, MESSAGES.PAYMENT.SDK_ERROR);
    }
  }

  private verifyPayment(paymentId: string, orderId: string, signature: string) {
    this.toastService.info(MESSAGES.PAYMENT.PLEASE_WAIT, MESSAGES.PAYMENT.VERIFYING);

    const verifyRequest = {
      razorpayPaymentId: paymentId,
      razorpayOrderId: orderId,
      razorpaySignature: signature
    };

    this.paymentService.verifyPayment(verifyRequest).subscribe({
      next: (res) => {
        if (res && res.user) {
          this.toastService.success(MESSAGES.PAYMENT.SUCCESS_TITLE, MESSAGES.PAYMENT.SUCCESS);
          this.authService.autoLogin(res);
        } else {
          this.toastService.error(MESSAGES.PAYMENT.VERIFICATION_FAILED, MESSAGES.PAYMENT.VERIFY_FAILED);
        }
      },
      error: (err) => {
        const errorMsg = err.messages?.[0] || MESSAGES.PAYMENT.VERIFY_ERROR;
        this.toastService.error(MESSAGES.PAYMENT.VERIFICATION_ERROR, errorMsg);
      }
    });
  }

  togglePromo() {
    this.isPromoVisible = !this.isPromoVisible;
  }

  goToPricing() {
    this.router.navigate(['/pricing']);
  }
}
