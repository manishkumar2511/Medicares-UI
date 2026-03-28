import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimematerialModule } from '../../core/primematerial.module';
import { BillingService, Medicine } from '../../core/services';
import { MESSAGES } from '../../core/constants/messages.const';
import { MessageService } from 'primeng/api';

export interface CartItem {
  id: string;
  name: string;
  batchNo: string;
  price: number;
  qty: number;
  discount: number;
  tax: number;
  itemTotalPrice: number;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimematerialModule],
  providers: [MessageService],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.scss'
})
export class BillingComponent implements OnInit {
  private billingService = inject(BillingService);
  private messageService = inject(MessageService);

  public messages = MESSAGES.BILLING_MANAGEMENT;
  public commonMessages = MESSAGES.COMMON;

  // Manual Input State
  public newMedicine = signal<any>({
    name: '',
    batchNo: '',
    price: null,
    qty: 1,
    discount: 0,
    tax: 12
  });

  public cart = signal<CartItem[]>([]);

  // Computed signals for totals
  public subTotal = computed(() => 
    this.cart().reduce((acc, item) => acc + (item.price * item.qty), 0)
  );

  public totalDiscount = computed(() => 
    this.cart().reduce((acc, item) => acc + ((item.price * item.qty * item.discount) / 100), 0)
  );

  public totalTax = computed(() => {
    return this.cart().reduce((acc, item) => {
      const basePrice = item.price * item.qty;
      const discountAmt = (basePrice * item.discount) / 100;
      const priceAfterDiscount = basePrice - discountAmt;
      return acc + ((priceAfterDiscount * item.tax) / 100);
    }, 0);
  });

  public grandTotal = computed(() => 
    this.subTotal() - this.totalDiscount() + this.totalTax()
  );

  ngOnInit() {
  }

  addManualItem() {
    const med = this.newMedicine();
    if (!med.name || !med.price || med.qty <= 0) {
      this.messageService.add({ severity: 'error', summary: 'Missing Info', detail: 'Please provide medicine name and price.' });
      return;
    }

    const newItem: CartItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: med.name,
      batchNo: med.batchNo || 'N/A',
      price: med.price,
      qty: med.qty,
      discount: med.discount,
      tax: med.tax,
      itemTotalPrice: 0
    };
    
    newItem.itemTotalPrice = this.calculateItemTotal(newItem);
    this.cart.set([...this.cart(), newItem]);

    // Reset Form
    this.newMedicine.set({
      name: '',
      batchNo: '',
      price: null,
      qty: 1,
      discount: 0,
      tax: 12
    });
  }

  calculateItemTotal(item: CartItem): number {
    const basePrice = item.price * item.qty;
    const discountAmt = (basePrice * item.discount) / 100;
    const priceAfterDiscount = basePrice - discountAmt;
    const taxAmt = (priceAfterDiscount * item.tax) / 100;
    return priceAfterDiscount + taxAmt;
  }

  removeFromCart(index: number) {
    const currentCart = this.cart();
    const updatedCart = [...currentCart];
    updatedCart.splice(index, 1);
    this.cart.set(updatedCart);
  }

  handlePrintSave() {
    if (this.cart().length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'Empty Cart', detail: this.messages.EMPTY_CART });
      return;
    }
    // Logic for Print & Save (Local record keeping)
    console.log('Printing Invoice...', this.cart());
    this.messageService.add({ severity: 'success', summary: 'Bill Saved', detail: 'Successfully saved and ready to print.' });
    this.clearCart();
  }

  clearCart() {
    this.cart.set([]);
  }
}
