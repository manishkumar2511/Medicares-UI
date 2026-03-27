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
  error: string = '';

  ngOnInit() {
    this.extractPlanData();
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
        this.error = errorMsg;
        if (errorMsg === MESSAGES.PAYMENT.SESSION_NOT_FOUND) {
          const ownerId = err?.ownerId || err?.error?.ownerId;
          setTimeout(() => {
            this.router.navigate(['/account/owner-registration'], { queryParams: { ownerId } });
          }, 3000);
        }
        // this.toastService.error(MESSAGES.PAYMENT.PAYMENT_FAILED_TITLE, errorMsg);
      }
    });
  }

  private openRazorpayModal(orderId: string, amount: number, currency: string, keyId: string) {
    const planName = this.plan?.name || 'Subscription';
    const options = {
      key: keyId,
      amount: Math.round(amount * 100),
      currency: currency,
      name: 'Medicares Solutions',
      description: `Plan: ${planName} | Total: ${currency} ${amount.toFixed(2)}`,
      image: 'assets/images/favIcon.png',
      order_id: orderId,
      handler: (response: any) => {
        this.verifyPayment(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      prefill: {
        name: '',
        email: '',
        contact: ''
      },
      notes: {
        plan_name: planName,
        payment_origin: 'Medicares Web Checkout'
      },
      theme: {
        color: '#0e7490'
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

  goToPricing() {
    this.router.navigate(['/pricing']);
  }
}
