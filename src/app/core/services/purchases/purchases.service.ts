import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PurchaseOrder {
  id: string;
  orderId: string;
  supplier: string;
  date: string;
  amount: number;
  status: 'Pending' | 'Completed' | 'Returned';
}

@Injectable({
  providedIn: 'root'
})
export class PurchasesService {
  private orders: PurchaseOrder[] = [
    { id: '1', orderId: 'PO-2001', supplier: 'PharmaCorp Distributors', date: '2026-03-25', amount: 4500.00, status: 'Completed' },
    { id: '2', orderId: 'PO-2002', supplier: 'HealthPlus Wholesale', date: '2026-03-26', amount: 1250.50, status: 'Completed' },
    { id: '3', orderId: 'PO-2003', supplier: 'MediLife Pharma', date: '2026-03-27', amount: 890.00, status: 'Pending' },
    { id: '4', orderId: 'PO-2004', supplier: 'PharmaCorp Distributors', date: '2026-03-27', amount: 550.00, status: 'Returned' }
  ];

  constructor() {}

  getPurchases(): Observable<PurchaseOrder[]> {
    return of(this.orders);
  }
}
