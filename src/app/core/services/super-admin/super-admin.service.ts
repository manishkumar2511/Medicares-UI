import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { Result, OwnerListResponse } from '../../models';

@Injectable({
    providedIn: 'root'
})
export class SuperAdminService {
    private apiService = inject(ApiService);

    getAllOwners(): Observable<Result<OwnerListResponse[]>> {
        return this.apiService.get<Result<OwnerListResponse[]>>('/super-admin/owners/get-all');
    }
}
