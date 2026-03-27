import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface InventoryItem {
  id: string;
  name: string;
  batchNo: string;
  category: string;
  stockQty: number;
  price: number;
  expiryDate: string;
  supplier: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private items: InventoryItem[] = [
    { id: '1', name: 'Paracetamol 500mg', batchNo: 'B-001', category: 'Tablet', stockQty: 100, price: 10, expiryDate: '2026-12-31', supplier: 'PharmaCorp' },
    { id: '2', name: 'Amoxicillin 250mg', batchNo: 'B-002', category: 'Capsule', stockQty: 50, price: 50, expiryDate: '2027-05-15', supplier: 'MediLife' },
    { id: '3', name: 'Vitamin C 500mg', batchNo: 'B-003', category: 'Supplement', stockQty: 200, price: 15, expiryDate: '2028-01-20', supplier: 'HealthPlus' },
    { id: '4', name: 'Ibuprofen 400mg', batchNo: 'B-004', category: 'Tablet', stockQty: 0, price: 20, expiryDate: '2026-10-10', supplier: 'PharmaCorp' }
  ];

  constructor() {}

  getInventory(): Observable<InventoryItem[]> {
    return of(this.items);
  }

  deleteItem(id: string): Observable<boolean> {
    this.items = this.items.filter(i => i.id !== id);
    return of(true);
  }
}
