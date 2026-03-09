import { inject, Injectable } from '@angular/core';
import { ApiService } from '../api.service';
import { Observable } from 'rxjs';
import { CreateSubscriptionPlanRequest, CreateSubscriptionPlanResponse, Result } from '../../models';

@Injectable({
    providedIn: 'root'
})
export class SubscriptionPlanService {
    private apiService = inject(ApiService);

    createPlan(request: CreateSubscriptionPlanRequest): Observable<Result<CreateSubscriptionPlanResponse>> {
        return this.apiService.post<Result<CreateSubscriptionPlanResponse>>('/subscription-plan/create', request);
    }
}
