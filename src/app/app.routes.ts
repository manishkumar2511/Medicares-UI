import { Routes } from "@angular/router";
import { authRoutes } from "./features/auth/routes";
import { LayoutComponent } from "./core/layout/layout.component";
import { AuthGuard, redirectIfAuthenticatedGuard } from "./core/guards";

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      // GUEST-ONLY: Redirect to dashboard if already logged in
      { 
        path: '', 
        title: 'Home', 
        loadComponent: () => import('./core/home').then(m => m.HomeComponent), 
        pathMatch: 'full', 
        canActivate: [redirectIfAuthenticatedGuard] 
      },
      { 
        path: 'home', 
        title: 'Home', 
        loadComponent: () => import('./core/home').then(m => m.HomeComponent), 
        canActivate: [redirectIfAuthenticatedGuard] 
      },
      { 
        path: 'pricing', 
        title: 'Our Plans', 
        loadComponent: () => import('./features/pricing').then(m => m.PricingComponent), 
        canActivate: [redirectIfAuthenticatedGuard] 
      },
      { 
        path: 'about', 
        title: 'About Medicares', 
        loadComponent: () => import('./core/home').then(m => m.HomeComponent), 
        canActivate: [redirectIfAuthenticatedGuard] 
      },
      { 
        path: 'contact', 
        title: 'Contact Support', 
        loadComponent: () => import('./core/home').then(m => m.HomeComponent), 
        canActivate: [redirectIfAuthenticatedGuard] 
      },
      { 
        path: 'account', 
        children: authRoutes, 
        canActivate: [redirectIfAuthenticatedGuard] 
      },

      // PROTECTED: Requires authentication
      { 
        path: 'owner-dashboard',
        title: 'Owner Dashboard', 
        loadComponent: () => import('./features/dashboard/owner/owner-dashboard.component').then(m => m.OwnerDashboardComponent),
        canActivate: [AuthGuard]
      },
      { 
        path: 'super-admin', 
        loadChildren: () => import('./features/dashboard/super-admin/super-admin.routes').then(m => m.superAdminRoutes),
        canActivate: [AuthGuard]
      },
      { 
        path: 'payment-management', 
        title: 'Payment Management', 
        loadChildren: () => import('./features/payment-management').then(m => m.PaymentManagementModule),
        canActivate: [AuthGuard]
      },
    ]
  },

  { path: "**", redirectTo: "/" },
];