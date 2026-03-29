import { Routes } from "@angular/router";
import { authRoutes } from "./features/auth/routes";
import { LayoutComponent } from "./core/layout/layout.component";
import { AuthGuard, redirectIfAuthenticatedGuard } from "./core/guards";
import { InvoiceManagementComponent } from "./features/invoice-management";
import { GenerateInvoiceComponent } from "./features/invoice-management/generate-invoice";

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', title: 'Home', loadComponent: () => import('./core/home').then(m => m.HomeComponent), pathMatch: 'full' },
      { path: 'home', title: 'Home', loadComponent: () => import('./core/home').then(m => m.HomeComponent) },
      { path: 'pricing', title: 'Pricing', loadComponent: () => import('./features/pricing').then(m => m.PricingComponent) },
      { path: 'about', title: 'About', loadComponent: () => import('./core/home').then(m => m.HomeComponent) },
      { path: 'contact', title: 'Contact', loadComponent: () => import('./core/home').then(m => m.HomeComponent) },
      { path: 'owner-dashboard',
         title: 'Owner Dashboard', 
         loadComponent: () => import('./features/dashboard/owner/owner-dashboard.component')
         .then(m => m.OwnerDashboardComponent),
        canActivate: [AuthGuard]},
      { path: 'invoice-management',
        title: 'Invoice Management',
        component: InvoiceManagementComponent,
        canActivate: [AuthGuard]},
      { path: 'invoice-management/generate',
        title: 'Generate Invoice',
        component: GenerateInvoiceComponent,
        canActivate: [AuthGuard]},
      { path: 'billing-management',
        title: 'Billing Management',
        loadComponent: () => import('./features/billing').then(m => m.BillingComponent),
        canActivate: [AuthGuard]},
      { path: 'inventory-management',
        title: 'Inventory Management',
        loadComponent: () => import('./features/inventory').then(m => m.InventoryComponent),
        canActivate: [AuthGuard]},
      { path: 'purchases',
        title: 'Purchases',
        loadComponent: () => import('./features/purchases').then(m => m.PurchasesComponent),
        canActivate: [AuthGuard]},
      { path: 'sales-history',
        title: 'Sales History',
        loadComponent: () => import('./features/sales-history/sales-history.component').then(m => m.SalesHistoryComponent),
        canActivate: [AuthGuard]},
      { path: 'reports',
        title: 'Reports & Analytics',
        loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
        canActivate: [AuthGuard]},
      { path: 'super-admin', loadChildren: () => import('./features/dashboard/super-admin/super-admin.routes').then(m => m.superAdminRoutes) },
      { path: 'account', children: authRoutes },
    ]
  },
  { path: 'payment-management', title: 'Payment Management', loadChildren: () => import('./features/payment-management').then(m => m.PaymentManagementModule) },
  { path: "**", redirectTo: "/" },
];