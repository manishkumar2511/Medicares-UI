import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api.service';
import { Result } from '../../models';
import { Invoice, GenerateInvoiceRequest } from '../../models/invoice/invoice.model';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private api = inject(ApiService);
  private readonly basePath = 'invoice';

  generateInvoice(request: GenerateInvoiceRequest): Observable<Result<Invoice>> {
    return this.api.post<Result<Invoice>>(`${this.basePath}/generate`, request);
  }

  getInvoiceById(id: string): Observable<Result<Invoice>> {
    return this.api.get<Result<Invoice>>(`${this.basePath}/${id}`);
  }

  getAllInvoices(): Observable<Result<Invoice[]>> {
    return this.api.get<Result<Invoice[]>>(`${this.basePath}/get-all`);
  }
}
