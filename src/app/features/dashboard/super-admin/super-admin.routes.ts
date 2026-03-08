import { Routes } from '@angular/router';

export const superAdminRoutes: Routes = [
    {
        path: '',
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            {
                path: 'dashboard',
                title: 'Super Admin Dashboard',
                loadComponent: () => import('./dashboard/dashboard.component').then(m => m.SuperAdminDashboardComponent)
            },
            {
                path: 'owners',
                title: 'Owner Management',
                loadComponent: () => import('./owner-management/owner-management.component').then(m => m.OwnerManagementComponent)
            },
            {
                path: 'plans',
                title: 'Plan Management',
                loadComponent: () => import('./plan-management/plan-management.component').then(m => m.PlanManagementComponent)
            }
        ]
    }
];
