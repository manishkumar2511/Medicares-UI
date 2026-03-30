export interface Invoice {
  id: string;
  storeId: string;
  invoiceNumber: string;
  customerName: string;
  customerContact?: string;
  itemSummary?: string;
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  receivedAmount: number;
  roundOff: number;
  balanceDue: number;
  paymentMode: string;
  transactionId?: string;
  status: string;
  billingDate: string;
  storeName?: string;
  storePhone?: string;
  storeAddress?: string;
  storeLicense?: string;
}

export interface GenerateInvoiceRequest {
  storeId: string;
  customerName: string;
  customerContact?: string;
  itemSummary?: string;
  subTotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  receivedAmount: number;
  roundOff: number;
  balanceDue: number;
  paymentMode: string;
  transactionId?: string;
  status: string;
}

export enum BillingStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded'
}

export enum PaymentMode {
  Cash = 'Cash',
  UPI = 'UPI',
  Card = 'Card',
  NetBanking = 'NetBanking'
}
