import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { CreateSubscriptionPlanRequest, CreateSubscriptionPlanResponse, Result, SubscriptionPlan } from '../../models';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionPlanService {
    private apiService = inject(ApiService);

    createPlan(request: CreateSubscriptionPlanRequest): Observable<Result<CreateSubscriptionPlanResponse>> {
        return this.apiService.post<Result<CreateSubscriptionPlanResponse>>('/subscription-plan/create', request);
    }

    getSubscriptionPlans(): Observable<Result<SubscriptionPlan[]>> {
        return this.apiService.get<Result<SubscriptionPlan[]>>('/subscription-plan/get-all');
    }

    deleteSubscriptionPlan(id: string): Observable<Result<string>> {
        return this.apiService.delete<Result<string>>(`/subscription-plan/delete/${id}`);
    }
}
