import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { Result } from '../../models';
import { Store, AddStoreRequest } from '../../models/store/store.model';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private api = inject(ApiService);
  private readonly basePath = 'store';

  addStore(request: AddStoreRequest): Observable<Result<Store>> {
    return this.api.post<Result<Store>>(`${this.basePath}/add`, request);
  }

  getMyStores(): Observable<Result<Store[]>> {
    return this.api.get<Result<Store[]>>(`${this.basePath}/my-stores`);
  }
}
