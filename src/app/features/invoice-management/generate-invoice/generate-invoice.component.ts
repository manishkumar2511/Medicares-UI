import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PrimematerialModule } from '../../../core/primematerial.module';
import { InvoiceService } from '../../../core/services/invoice/invoice.service';
import { StoreService } from '../../../core/services/store/store.service';
import { ToastService } from '../../../core/services/notification/toast.service';
import { GenerateInvoiceRequest, BillingStatus, Invoice } from '../../../core/models/invoice/invoice.model';
import { Store } from '../../../core/models/store/store.model';

interface CartItem {
  name: string;
  hsnCode: string;
  rate: number;
  discountPercent: number;
  quantity: number;
  taxPercent: number;
}

@Component({
  selector: 'app-generate-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimematerialModule],
  templateUrl: './generate-invoice.component.html',
  styleUrl: './generate-invoice.component.scss'
})
export class GenerateInvoiceComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private invoiceService = inject(InvoiceService);
  private storeService = inject(StoreService);
  private toastService = inject(ToastService);

  isViewMode = signal(false);
  isPrintMode = signal(false);
  saving = signal(false);
  existingInvoice = signal<Invoice | null>(null);
  stores = signal<Store[]>([]);
  now = new Date();

  // Store selection
  selectedStoreId = signal('');
  selectedStore = computed(() => this.stores().find(s => s.id === this.selectedStoreId()));

  // Customer
  customerName = signal('');
  customerContact = signal('');
  paymentMode = signal<string>('Cash');
  transactionId = signal('');

  // Quick Entry
  newItem: CartItem = {
    name: '',
    hsnCode: '',
    rate: 0,
    discountPercent: 0,
    quantity: 1,
    taxPercent: 12
  };

  cart = signal<CartItem[]>([]);

  paymentModes = [
    { label: 'Cash', value: 'Cash' },
    { label: 'UPI', value: 'UPI' },
    { label: 'Card', value: 'Card' },
    { label: 'Net Banking', value: 'NetBanking' }
  ];

  // Computed
  subTotal = computed(() =>
    this.cart().reduce((acc, item) => acc + (item.rate * item.quantity), 0)
  );

  discountTotal = computed(() =>
    this.cart().reduce((acc, item) => {
      const base = item.rate * item.quantity;
      return acc + (base * item.discountPercent / 100);
    }, 0)
  );

  taxableValue = computed(() => this.subTotal() - this.discountTotal());

  taxTotal = computed(() =>
    this.cart().reduce((acc, item) => {
      const base = item.rate * item.quantity;
      const disc = base * item.discountPercent / 100;
      return acc + ((base - disc) * item.taxPercent / 100);
    }, 0)
  );

  grandTotal = computed(() => this.subTotal() - this.discountTotal() + this.taxTotal());

  roundOff = computed(() => {
    const rounded = Math.round(this.grandTotal());
    return +(rounded - this.grandTotal()).toFixed(2);
  });

  receivedAmount = signal(0);

  balanceDue = computed(() => {
    const rounded = Math.round(this.grandTotal());
    return +(rounded - this.receivedAmount()).toFixed(2);
  });

  ngOnInit(): void {
    this.loadStores();

    const invoiceId = this.route.snapshot.queryParamMap.get('invoiceId');
    const mode = this.route.snapshot.queryParamMap.get('mode');

    if (invoiceId) {
      this.isViewMode.set(true);
      this.isPrintMode.set(mode === 'print');
      this.loadInvoice(invoiceId);
    }
  }

  loadStores(): void {
    this.storeService.getMyStores().subscribe({
      next: (res) => {
        if (res.succeeded && res.data && res.data.length > 0) {
          this.stores.set(res.data);
          if (!this.isViewMode()) {
            this.selectedStoreId.set(res.data[0].id);
          }
        }
      }
    });
  }

  loadInvoice(id: string): void {
    this.invoiceService.getInvoiceById(id).subscribe({
      next: (res) => {
        if (res.succeeded && res.data) {
          this.existingInvoice.set(res.data);
          this.customerName.set(res.data.customerName);
          this.customerContact.set(res.data.customerContact || '');
          this.paymentMode.set(res.data.paymentMode);
          this.transactionId.set(res.data.transactionId || '');
          this.receivedAmount.set(res.data.receivedAmount);
          this.selectedStoreId.set(res.data.storeId);
        }
      }
    });
  }

  addItem(): void {
    if (!this.newItem.name || this.newItem.rate <= 0) {
      this.toastService.warn('Missing Info', 'Please provide item name and rate.');
      return;
    }
    this.cart.set([...this.cart(), { ...this.newItem }]);
    this.newItem = {
      name: '',
      hsnCode: '',
      rate: 0,
      discountPercent: 0,
      quantity: 1,
      taxPercent: 12
    };
  }

  removeItem(index: number): void {
    const updated = [...this.cart()];
    updated.splice(index, 1);
    this.cart.set(updated);
  }

  getItemTotal(item: CartItem): number {
    const base = item.rate * item.quantity;
    const disc = base * item.discountPercent / 100;
    const taxable = base - disc;
    const tax = taxable * item.taxPercent / 100;
    return +(taxable + tax).toFixed(2);
  }

  getItemDiscountAmt(item: CartItem): number {
    return +((item.rate * item.quantity * item.discountPercent) / 100).toFixed(2);
  }

  getItemTaxableValue(item: CartItem): number {
    const base = item.rate * item.quantity;
    return +(base - (base * item.discountPercent / 100)).toFixed(2);
  }

  saveInvoice(): void {
    if (!this.selectedStoreId()) {
      this.toastService.warn('Required', 'Please select a store.');
      return;
    }
    if (!this.customerName()) {
      this.toastService.warn('Required', 'Customer name is required.');
      return;
    }
    if (this.cart().length === 0) {
      this.toastService.warn('Empty', 'Add at least one item.');
      return;
    }

    this.saving.set(true);

    const itemSummary = this.cart().map(item =>
      `${item.name} (HSN:${item.hsnCode || 'N/A'}) x${item.quantity} @ ₹${item.rate}`
    ).join(', ');

    const request: GenerateInvoiceRequest = {
      storeId: this.selectedStoreId(),
      customerName: this.customerName(),
      customerContact: this.customerContact() || undefined,
      itemSummary,
      subTotal: this.subTotal(),
      discountTotal: this.discountTotal(),
      taxTotal: this.taxTotal(),
      grandTotal: this.grandTotal(),
      receivedAmount: this.receivedAmount(),
      roundOff: this.roundOff(),
      balanceDue: this.balanceDue(),
      paymentMode: this.paymentMode(),
      transactionId: this.transactionId() || undefined,
      status: BillingStatus.Completed
    };

    this.invoiceService.generateInvoice(request).subscribe({
      next: (res) => {
        this.saving.set(false);
        if (res.succeeded) {
          this.toastService.success('Success', 'Invoice generated successfully.');
          this.existingInvoice.set(res.data);
          this.isViewMode.set(true);
        }
      },
      error: () => {
        this.saving.set(false);
      }
    });
  }

  printInvoice(): void {
    window.print();
  }

  goBack(): void {
    this.router.navigate(['/invoice-management']);
  }

  createNew(): void {
    this.isViewMode.set(false);
    this.existingInvoice.set(null);
    this.customerName.set('');
    this.customerContact.set('');
    this.paymentMode.set('Cash');
    this.transactionId.set('');
    this.cart.set([]);
    this.receivedAmount.set(0);
    if (this.stores().length > 0) {
      this.selectedStoreId.set(this.stores()[0].id);
    }
  }
}
