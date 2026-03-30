import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { PrimematerialModule } from '../../core/primematerial.module';
import { GenericGridComponent, GridColumn, GridAction } from '../../shared/components/generic-grid/generic-grid.component';
import { GenerateInvoiceComponent } from './generate-invoice/generate-invoice.component';
import { COMMON_GRID_ACTIONS } from '../../core/constants/grid-action-items';
import { InvoiceService } from '../../core/services/invoice/invoice.service';
import { ToastService } from '../../core/services/notification/toast.service';
import { Invoice } from '../../core/models/invoice/invoice.model';

@Component({
  selector: 'app-invoice-management',
  standalone: true,
  imports: [CommonModule, PrimematerialModule, GenericGridComponent, GenerateInvoiceComponent],
  templateUrl: './invoice-management.component.html',
  styleUrl: './invoice-management.component.scss'
})
export class InvoiceManagementComponent implements OnInit {
  private router = inject(Router);
  private invoiceService = inject(InvoiceService);
  private toastService = inject(ToastService);

  invoices = signal<Invoice[]>([]);
  loading = signal(false);
  downloadInvoiceId = signal<string | null>(null);

  columns: GridColumn[] = [
    { field: 'invoiceNumber', header: 'Invoice #', sortable: true, width: '140px' },
    { field: 'billingDate', header: 'Date', type: 'date', sortable: true, width: '120px' },
    { field: 'customerName', header: 'Customer', sortable: true },
    { field: 'grandTotal', header: 'Total', type: 'currency', sortable: true, width: '130px' },
    { field: 'receivedAmount', header: 'Received', type: 'currency', sortable: true, width: '130px' },
    { field: 'paymentMode', header: 'Mode', type: 'badge', sortable: true, width: '100px' },
    { field: 'status', header: 'Status', type: 'status', sortable: true, width: '110px' }
  ];

  actions: GridAction[] = [
    { ...COMMON_GRID_ACTIONS.VIEW, icon: 'pi pi-eye', severity: 'info' },
    { id: 'download', label: 'Download', icon: 'pi pi-download', severity: 'success', tooltip: 'Download Invoice PDF' },
    { id: 'print', label: 'Print', icon: 'pi pi-print', severity: 'secondary', tooltip: 'Print Invoice' },
    { id: 'share', label: 'Share', icon: 'pi pi-whatsapp', severity: 'success', tooltip: 'Share via WhatsApp' }
  ];

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.loading.set(true);
    this.invoiceService.getAllInvoices().subscribe({
      next: (res) => {
        if (res.succeeded && res.data) {
          this.invoices.set(res.data);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      }
    });
  }

  goToGenerateInvoice(): void {
    this.router.navigate(['/invoice-management/generate']);
  }

  onActionExecuted(event: { id: string; data: Invoice }): void {
    if (event.id === 'view' || event.id === 'print') {
      this.router.navigate(['/invoice-management/generate'], {
        queryParams: { invoiceId: event.data.id, mode: event.id }
      });
    } else if (event.id === 'download') {
      this.toastService.info('Download Started', 'Preparing invoice PDF...');
      this.downloadInvoiceId.set(event.data.id);
    } else if (event.id === 'share') {
      this.shareViaWhatsApp(event.data);
    }
  }

  onDownloadComplete(success: boolean): void {
    this.downloadInvoiceId.set(null);
  }

  shareViaWhatsApp(invoice: Invoice): void {
    const date = new Date(invoice.billingDate).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric'
    });

    const message = [
      `*Invoice: ${invoice.invoiceNumber}*`,
      `Date: ${date}`,
      `Customer: ${invoice.customerName}`,
      ``,
      `Items: ${invoice.itemSummary || 'N/A'}`,
      ``,
      `Subtotal: ₹${invoice.subTotal.toFixed(2)}`,
      `Discount: -₹${invoice.discountTotal.toFixed(2)}`,
      `GST: +₹${invoice.taxTotal.toFixed(2)}`,
      `*Grand Total: ₹${invoice.grandTotal.toFixed(2)}*`,
      `Received: ₹${invoice.receivedAmount.toFixed(2)}`,
      `Balance Due: ₹${invoice.balanceDue.toFixed(2)}`,
      `Payment: ${invoice.paymentMode}`,
      ``,
      `Thank you for your business!`,
      `_Powered by Medicares_`
    ].join('\n');

    const phone = invoice.customerContact?.replace(/\D/g, '') || '';
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(url, '_blank');
  }
}
