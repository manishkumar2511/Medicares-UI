import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface Medicine {
  id: string;
  name: string;
  batchNo: string;
  price: number;
  stockQty: number;
  discount: number;
  tax: number;
}

@Injectable({
  providedIn: 'root'
})
export class BillingService {
  // Hardcoded data source
  private medicines: Medicine[] = [
    { id: '1', name: 'Paracetamol 500mg', batchNo: 'B-001', price: 10, stockQty: 100, discount: 5, tax: 12 },
    { id: '2', name: 'Amoxicillin 250mg', batchNo: 'B-002', price: 50, stockQty: 50, discount: 0, tax: 12 },
    { id: '3', name: 'Vitamin C 500mg', batchNo: 'B-003', price: 15, stockQty: 200, discount: 10, tax: 5 },
    { id: '4', name: 'Ibuprofen 400mg', batchNo: 'B-004', price: 20, stockQty: 0, discount: 0, tax: 12 },
    { id: '5', name: 'Cough Syrup 100ml', batchNo: 'B-005', price: 80, stockQty: 30, discount: 5, tax: 12 }
  ];

  constructor() { }

  searchMedicines(query: string): Observable<Medicine[]> {
    if (!query.trim()) {
      return of(this.medicines);
    }
    const filtered = this.medicines.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) || 
      m.batchNo.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered);
  }

  processPayment(cartData: any): Observable<{success: boolean, invoiceNo: string}> {
    // Simulate API call
    return of({ success: true, invoiceNo: `INV-${new Date().getTime()}` });
  }
}
