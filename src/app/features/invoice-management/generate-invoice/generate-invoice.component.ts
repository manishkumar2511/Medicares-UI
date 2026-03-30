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
  isDownloadMode = signal(false);
  saving = signal(false);
  existingInvoice = signal<Invoice | null>(null);
  stores = signal<Store[]>([]);
  now = new Date();
  private cachedStore = signal<Store | null>(null);

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
      this.isDownloadMode.set(mode === 'download');
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
          if (this.selectedStoreId()) {
            const store = res.data.find(s => s.id === this.selectedStoreId());
            if (store) {
              this.cachedStore.set(store);
            }
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

          if (res.data.itemSummary) {
            const parsed = this.parseItemSummary(res.data.itemSummary);
            if (parsed.length > 0) {
              this.cart.set(parsed);
            }
          }

          const store = this.stores().find(s => s.id === res.data!.storeId);
          if (store) {
            this.cachedStore.set(store);
          }

          if (this.isDownloadMode()) {
            setTimeout(() => this.downloadPdf(), 1000);
          }
        }
      }
    });
  }

  private parseItemSummary(summary: string): CartItem[] {
    const items: CartItem[] = [];
    const regex = /(.+?)\s*\(HSN:(.+?)\)\s*x(\d+)\s*@\s*₹([\d.]+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(summary)) !== null) {
      items.push({
        name: match[1].trim(),
        hsnCode: match[2].trim(),
        quantity: parseInt(match[3], 10),
        rate: parseFloat(match[4]),
        discountPercent: 0,
        taxPercent: 12
      });
    }
    return items;
  }

  getStoreDisplayName(): string {
    return this.selectedStore()?.name || this.cachedStore()?.name || 'Medicares';
  }

  getStoreAddress(): string {
    const s = this.selectedStore() || this.cachedStore();
    if (!s?.addressLine) return '';
    return `${s.addressLine}, ${s.city || ''}, ${s.state || ''}`;
  }

  getStorePhone(): string {
    const s = this.selectedStore() || this.cachedStore();
    return s?.phone || '+91 00000 00000';
  }

  getStoreLicense(): string {
    const s = this.selectedStore() || this.cachedStore();
    return s?.licenseNumber || '';
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

  saveAndPrint(): void {
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
      subTotal: Number(this.subTotal()) || 0,
      discountTotal: Number(this.discountTotal()) || 0,
      taxTotal: Number(this.taxTotal()) || 0,
      grandTotal: Number(this.grandTotal()) || 0,
      receivedAmount: Number(this.receivedAmount()) || 0,
      roundOff: Number(this.roundOff()) || 0,
      balanceDue: Number(this.balanceDue()) || 0,
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
          setTimeout(() => this.downloadPdf(), 500);
        }
      },
      error: (err) => {
        this.saving.set(false);
        this.toastService.error('Error', err?.messages?.[0] || 'Failed to save invoice. Check if backend is running.');
      }
    });
  }

  async downloadPdf(): Promise<void> {
    const original = document.getElementById('invoice-content');
    if (!original) {
      this.toastService.warn('Warning', 'Could not capture invoice. Navigating back.');
      this.goBack();
      return;
    }

    // Create off-screen container with white background (completely detached from theme)
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;background:#ffffff;width:900px;';

    const clone = original.cloneNode(true) as HTMLElement;
    clone.style.cssText = 'background:#ffffff !important;width:900px !important;';

    // Inject scoped style into clone to override ALL CSS variables with light values
    const cloneStyle = document.createElement('style');
    cloneStyle.textContent = `
      * { transition: none !important; }
      :root, [data-theme], [data-theme="dark"] {
        --background-primary:#ffffff !important;
        --background-secondary:#F8F9FA !important;
        --text-primary:#1A1A1A !important;
        --text-secondary:#6B7280 !important;
        --border-color:#E0E0E0 !important;
        --app-bg:#ffffff !important;
        --background-light:#F0F2F5 !important;
        --primary-color:#00BCD4 !important;
      }
      .invoice-wrapper {
        background:#ffffff !important;
        background-image:none !important;
        padding:0 !important;
      }
      .invoice-container { background:#ffffff !important; }
      .invoice-card { background:#F8F9FA !important; border:1px solid #E0E0E0 !important; box-shadow:none !important; }
      .invoice-wrapper, .invoice-container, .invoice-card,
      .invoice-header, .bill-to-section, .bill-to-info,
      .bill-to-key, .bill-to-val, .items-table,
      .summary-section, .invoice-footer, .summary-row,
      .meta-key, .meta-val, .company-detail,
      .bill-to-field label, .invoice-label, .powered-by,
      td, th, .empty-row {
        color:#1A1A1A !important;
      }
      th { background:#F0F2F5 !important; }
      .qty-col, td.qty-col { background:#ffffff !important; background-color:#ffffff !important; color:#1A1A1A !important; font-weight:700 !important; text-align:center !important; }
      th.qty-col { background:#f0f2f5 !important; background-color:#f0f2f5 !important; color:#374151 !important; }
      .grand-total span { color:#00BCD4 !important; }
      .text-red { color:#ef4444 !important; }
      .text-green { color:#10B981 !important; }
      .company-name { color:#00BCD4 !important; }
      .divider, .summary-divider, .footer-divider { background:#E0E0E0 !important; }
    `;
    clone.appendChild(cloneStyle);

    // Hide nav bar and action buttons in clone
    const navBarClone = clone.querySelector('.nav-bar') as HTMLElement;
    if (navBarClone) navBarClone.style.display = 'none';
    const actionBarClone = clone.querySelector('.action-bar') as HTMLElement;
    if (actionBarClone) actionBarClone.style.display = 'none';

    // Convert SVG logo to PNG data URL for html2canvas compatibility
    const logoClone = clone.querySelector('.company-logo') as HTMLImageElement;
    if (logoClone) {
      try {
        const resp = await fetch(logoClone.src);
        const svgText = await resp.text();
        const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        const img = new Image();
        img.width = 40;
        img.height = 40;
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error('SVG load failed'));
          img.src = url;
        });
        const canvas = document.createElement('canvas');
        canvas.width = 80;
        canvas.height = 80;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, 80, 80);
        logoClone.src = canvas.toDataURL('image/png');
        URL.revokeObjectURL(url);
      } catch {
        logoClone.style.display = 'none';
      }
    }

    document.body.appendChild(container);
    container.appendChild(clone);

    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      // Wait for images
      await new Promise(r => setTimeout(r, 300));

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth - 16;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 8;

      pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 8;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 8, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const invoiceNum = this.existingInvoice()?.invoiceNumber || 'invoice';
      const invoiceDate = this.existingInvoice()?.billingDate
        ? new Date(this.existingInvoice()!.billingDate).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);
      pdf.save(`Sale_${invoiceNum}_${invoiceDate}.pdf`);
      this.toastService.success('PDF Downloaded', `Sale_${invoiceNum}_${invoiceDate}.pdf saved.`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.toastService.error('Error', 'Failed to generate PDF.');
    } finally {
      container.remove();
      setTimeout(() => this.goBack(), 600);
    }
  }

  printInvoice(): void {
    this.downloadPdf();
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
