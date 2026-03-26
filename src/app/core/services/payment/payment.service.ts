import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { Result, CreateOrderResponse, VerifyPaymentRequest, LoginResponse } from '../../models';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private apiService = inject(ApiService);

  createOrder(subscriptionPlanId: string, ownerId?: string): Observable<Result<CreateOrderResponse>> {
    return this.apiService.post<Result<CreateOrderResponse>>('payments/create-order', { subscriptionPlanId, ownerId });
  }

  verifyPayment(request: VerifyPaymentRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('payments/verify-payment', request);
  }
}
