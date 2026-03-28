import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../core/primematerial.module';
import { PurchasesService, PurchaseOrder } from '../../core/services';
import { MESSAGES } from '../../core/constants/messages.const';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [CommonModule, PrimematerialModule],
  templateUrl: './purchases.component.html',
  styleUrl: './purchases.component.scss'
})
export class PurchasesComponent implements OnInit {
  private purchasesService = inject(PurchasesService);
  public messages = MESSAGES.PURCHASES;
  public commonMessages = MESSAGES.COMMON;

  public orders = signal<PurchaseOrder[]>([]);
  public loading = signal<boolean>(true);
  
  ngOnInit() {
    this.loadOrders();
  }

  loadOrders() {
    this.loading.set(true);
    this.purchasesService.getPurchases().subscribe({
      next: (data) => {
        this.orders.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  getSeverity(status: string): "success" | "info" | "warn" | "danger" | "secondary" | "contrast" | undefined {
    switch(status.toLowerCase()) {
      case 'completed': return 'success';
      case 'pending': return 'warn';
      case 'returned': return 'danger';
      default: return 'info';
    }
  }

  onFilter(event: Event, dt: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      dt.filterGlobal(inputElement.value, 'contains');
    }
  }
}
