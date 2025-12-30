import { Routes } from "@angular/router";
import { authRoutes } from "./features/auth/routes";
import { LayoutComponent } from "./core/layout/layout.component";

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: 'home', title: 'Home', loadComponent: () => import('./core/home').then(m => m.HomeComponent) },
      { path: 'pricing', title: 'Pricing', loadComponent: () => import('./features/pricing').then(m => m.PricingComponent) },
      { path: 'about', title: 'About', loadComponent: () => import('./core/home').then(m => m.HomeComponent) },
      { path: 'contact', title: 'Contact', loadComponent: () => import('./core/home').then(m => m.HomeComponent) },
      { path: 'owner-dashboard', title: 'Owner Dashboard', loadComponent: () => import('./features/dashboard/owner-dashboard.component').then(m => m.OwnerDashboardComponent) },
      { path: 'payment-management', title: 'Payment Management', loadChildren: () => import('./features/payment-management').then(m => m.PaymentManagementModule) },
      { path: 'account', children: authRoutes },
    ]
  },
  { path: "**", redirectTo: "/home" },
];