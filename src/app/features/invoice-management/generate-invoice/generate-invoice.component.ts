import { Component, OnInit, inject, signal, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Input, Output, EventEmitter } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);

  @Input() inputInvoiceId?: string;
  @Input() silentDownload: boolean = false;
  @Input() silentPrint: boolean = false;
  @Output() onDownloadComplete = new EventEmitter<boolean>();

  isViewMode = signal(false);
  isPrintMode = signal(false);
  isDownloadMode = signal(false);
  saving = signal(false);
  existingInvoice = signal<Invoice | null>(null);
  stores = signal<Store[]>([]);
  now = new Date();
  private cachedStore = signal<Store | null>(null);
  private storesLoaded = signal(false);

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

    const invoiceId = this.inputInvoiceId || this.route.snapshot.queryParamMap.get('invoiceId');
    const mode = this.silentDownload ? 'download' : this.route.snapshot.queryParamMap.get('mode');

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
          this.storesLoaded.set(true);
          if (!this.isViewMode()) {
            this.selectedStoreId.set(res.data[0].id);
          }
          if (this.selectedStoreId()) {
            const store = res.data.find(s => s.id === this.selectedStoreId());
            if (store) {
              this.cachedStore.set(store);
            }
          }
        } else {
          this.storesLoaded.set(true);
        }
      },
      error: () => this.storesLoaded.set(true)
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

          // Ensure store info is loaded
          const checkStores = () => {
            try {
              const storeId = res.data?.storeId?.toLowerCase() || '';
              const store = this.stores().find(s => s?.id?.toLowerCase() === storeId);
              if (store) {
                this.cachedStore.set(store);
              }

              if (!(this.cdr as any).destroyed) {
                this.cdr.detectChanges();
              }

              if (this.isDownloadMode() || this.silentDownload) {
                setTimeout(() => {
                  try {
                    if (!(this.cdr as any).destroyed) {
                      this.cdr.detectChanges();
                    }
                    this.downloadPdf();
                  } catch (e) {
                    console.error('Error triggering download:', e);
                    this.handleLoadError('Failed to initiate PDF rendering.');
                  }
                }, 1000);
              } else if (this.isPrintMode() || this.silentPrint) {
                setTimeout(() => {
                  try {
                    if (!(this.cdr as any).destroyed) {
                      this.cdr.detectChanges();
                    }
                    this.printInvoice();
                  } catch (e) {
                    console.error('Error triggering print:', e);
                    this.handleLoadError('Failed to initiate Print dialog.');
                  }
                }, 500);
              }
            } catch (err) {
              console.error('Error checking stores:', err);
              this.handleLoadError('Error parsing invoice data.');
            }
          };

          if (this.storesLoaded()) {
            checkStores();
          } else {
            // Wait for loadStores to complete
            let attempts = 0;
            const interval = setInterval(() => {
              if (this.storesLoaded() || attempts > 50) { // Timeout after 5s
                clearInterval(interval);
                checkStores();
              }
              attempts++;
            }, 100);
          }
        } else {
          this.handleLoadError('Failed to load invoice details.');
        }
      },
      error: (err) => {
        console.error('API Error loading invoice:', err);
        this.handleLoadError('Error fetching invoice for download.');
      }
    });
  }

  private handleLoadError(message: string): void {
    this.toastService.error('Error', message);
    if (this.silentDownload) {
      this.onDownloadComplete.emit(false);
    } else {
      this.goBack();
    }
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
    if (this.existingInvoice()?.storeName) return this.existingInvoice()!.storeName!;
    const selId = this.selectedStoreId()?.toLowerCase();
    const s = this.stores().find(s => s?.id?.toLowerCase() === selId);
    return s?.name || this.cachedStore()?.name || 'Medicares';
  }

  getStoreAddress(): string {
    if (this.existingInvoice()?.storeAddress) return this.existingInvoice()!.storeAddress!;
    const selId = this.selectedStoreId()?.toLowerCase();
    const s = this.stores().find(s => s?.id?.toLowerCase() === selId) || this.cachedStore();
    if (!s?.addressLine) return '';
    return `${s.addressLine}, ${s.city || ''}, ${s.state || ''}`;
  }

  getStorePhone(): string {
    if (this.existingInvoice()?.storePhone) return this.existingInvoice()!.storePhone!;
    const selId = this.selectedStoreId()?.toLowerCase();
    const s = this.stores().find(s => s?.id?.toLowerCase() === selId) || this.cachedStore();
    return s?.phone || '+91 00000 00000';
  }

  getStoreLicense(): string {
    if (this.existingInvoice()?.storeLicense) return this.existingInvoice()!.storeLicense!;
    const selId = this.selectedStoreId()?.toLowerCase();
    const s = this.stores().find(s => s?.id?.toLowerCase() === selId) || this.cachedStore();
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
      this.toastService.warn('Warning', 'Could not capture invoice.');
      if (this.silentDownload) {
        this.onDownloadComplete.emit(false);
      } else {
        this.goBack();
      }
      return;
    }

    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;left:-10000px;top:0;z-index:-1;background:#ffffff;width:900px;';

    const clone = original.cloneNode(true) as HTMLElement;
    clone.style.cssText = 'background:#ffffff !important;width:900px !important;';

    // Apply inline styles to all elements (NO <style> tag — that causes global theme leak)
    clone.querySelectorAll('*').forEach((el) => {
      const h = el as HTMLElement;
      const tag = h.tagName?.toLowerCase();
      if (tag === 'style' || tag === 'script') return;

      if (['div', 'section', 'header', 'footer', 'table', 'thead', 'tbody', 'tr', 'ul', 'li'].includes(tag)) {
        h.style.setProperty('background', '#ffffff', 'important');
        h.style.setProperty('background-color', '#ffffff', 'important');
      }
      if (tag === 'th') {
        h.style.setProperty('background', '#f0f2f5', 'important');
        h.style.setProperty('background-color', '#f0f2f5', 'important');
        h.style.setProperty('color', '#374151', 'important');
      }
      if (tag === 'td') {
        h.style.setProperty('background', '#ffffff', 'important');
        h.style.setProperty('background-color', '#ffffff', 'important');
        h.style.setProperty('color', '#1A1A1A', 'important');
      }
      if (['p', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'label', 'a', 'strong', 'b', 'small'].includes(tag)) {
        h.style.setProperty('color', '#1A1A1A', 'important');
      }
      if (h.classList.contains('company-name') || h.classList.contains('bill-to-label')) {
        h.style.setProperty('color', '#00BCD4', 'important');
      }
      if (h.closest('.grand-total')) {
        h.style.setProperty('color', '#00BCD4', 'important');
      }
      if (h.classList.contains('invoice-label')) {
        h.style.setProperty('border-bottom', '2px solid #00BCD4', 'important');
      }
      if (['divider', 'summary-divider', 'footer-divider'].some(c => h.classList.contains(c))) {
        h.style.setProperty('background', '#e5e7eb', 'important');
      }
      if (h.classList.contains('text-red')) h.style.setProperty('color', '#ef4444', 'important');
      if (h.classList.contains('text-green')) h.style.setProperty('color', '#10B981', 'important');
      h.style.setProperty('transition', 'none', 'important');
      h.style.setProperty('box-shadow', 'none', 'important');
    });

    const navBarClone = clone.querySelector('.nav-bar') as HTMLElement;
    if (navBarClone) navBarClone.style.display = 'none';
    const actionBarClone = clone.querySelector('.action-bar') as HTMLElement;
    if (actionBarClone) actionBarClone.style.display = 'none';

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

      if (this.silentDownload) {
        this.onDownloadComplete.emit(true);
      }
    } catch (err) {
      console.error('PDF generation failed:', err);
      this.toastService.error('Error', 'Failed to generate PDF.');
      if (this.silentDownload) {
        this.onDownloadComplete.emit(false);
      }
    } finally {
      container.remove();
      if (!this.silentDownload) {
        setTimeout(() => this.goBack(), 600);
      }
    }
  }

  printInvoice(): void {
    const printContent = document.getElementById('invoice-content');
    if (!printContent) return;

    // Isolate for printing
    const printContainer = document.createElement('div');
    printContainer.id = 'temp-print-section';
    printContainer.style.width = '100%';

    const clone = printContent.cloneNode(true) as HTMLElement;

    // Remove no-print elements from clone
    const noPrintElems = clone.querySelectorAll('.no-print');
    noPrintElems.forEach(el => el.remove());

    printContainer.appendChild(clone);

    // Hide all direct children of body
    const bodyChildren = Array.from(document.body.children) as HTMLElement[];
    const hiddenElements: HTMLElement[] = [];

    bodyChildren.forEach(child => {
      if (child.tagName !== 'SCRIPT' && child.tagName !== 'STYLE') {
        hiddenElements.push(child);
        child.style.display = 'none';
      }
    });

    document.body.appendChild(printContainer);

    const calcHeightPx = printContainer.offsetHeight || printContainer.scrollHeight;
    const heightInMm = Math.ceil(calcHeightPx * 0.264583) + 40;

    const dynamicStyle = document.createElement('style');
    dynamicStyle.id = 'print-dynamic-style';
    dynamicStyle.innerHTML = `
      @media print {
        @page {
          size: 210mm ${Math.max(heightInMm, 150)}mm !important;
          margin: 0 !important;
        }
        html, body {
          overflow: hidden !important; /* Force no second page spill */
          height: 100% !important;
        }
      }
    `;
    document.head.appendChild(dynamicStyle);

    // Trigger Print
    window.print();

    // Restore Original DOM
    dynamicStyle.remove();
    printContainer.remove();
    hiddenElements.forEach(child => {
      child.style.display = '';
    });

    // Automatically navigate back up to grid or emit completion
    if (!this.silentDownload && !this.silentPrint) {
      this.goBack();
    } else if (this.silentPrint) {
      this.onDownloadComplete.emit(true);
    }
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
