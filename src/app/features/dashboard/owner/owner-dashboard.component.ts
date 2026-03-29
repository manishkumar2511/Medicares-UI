import { Component, OnInit, inject, PLATFORM_ID, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrimematerialModule } from '../../../core/primematerial.module';
import { LayoutComponent } from '../../../core/layout/layout.component';
import { ThemeService } from '../../../core/services/theme.service';
import { CommonService } from '../../../core/services/common';
import { StoreService } from '../../../core/services/store/store.service';
import { ToastService } from '../../../core/services/notification/toast.service';
import { GenericGridComponent, GridColumn, GridAction } from '../../../shared/components/generic-grid/generic-grid.component';
import { MESSAGES } from '../../../core/constants/messages.const';
import { State } from '../../../core/models';
import { Store } from '../../../core/models/store/store.model';
import { phoneNumberValidator } from '../../../core/validators';
import { FormErrorComponent } from '../../../shared';

@Component({
    selector: 'app-owner-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimematerialModule, GenericGridComponent, FormErrorComponent],
    templateUrl: './owner-dashboard.component.html',
    styleUrl: './owner-dashboard.component.scss'
})
export class OwnerDashboardComponent implements OnInit {
    private platformId = inject(PLATFORM_ID);
    private layout = inject(LayoutComponent);
    private themeService = inject(ThemeService);
    private commonService = inject(CommonService);
    private storeService = inject(StoreService);
    private toastService = inject(ToastService);
    private fb = inject(FormBuilder);
    public dashboardMessages = MESSAGES.DASHBOARD;

    public chartData: any;
    public chartOptions: any;
    public pieData: any;
    public pieOptions: any;

    // Store Management
    stores = signal<Store[]>([]);
    states = signal<State[]>([]);
    showAddStoreDialog = signal(false);
    savingStore = signal(false);
    storeForm!: FormGroup;

    storeColumns: GridColumn[] = [
        { field: 'name', header: 'Store Name', sortable: true },
        { field: 'city', header: 'City', sortable: true, width: '140px' },
        { field: 'state', header: 'State', sortable: true, width: '140px' },
        { field: 'phone', header: 'Phone', sortable: false, width: '140px' },
        { field: 'isActive', header: 'Active', type: 'boolean', sortable: true, width: '80px' }
    ];

    storeActions: GridAction[] = [
        { id: 'view', label: 'View', icon: 'pi pi-eye', severity: 'info', tooltip: 'View Store' }
    ];

    toggleSidebar() {
        this.layout.toggleSidebar();
    }

    isDarkMode() {
        return this.themeService.isDarkMode();
    }

    public statsCards = [
        { title: MESSAGES.DASHBOARD.STATS.TODAY_SALES, value: '₹3,850', icon: 'pi pi-shopping-cart', color: '#FF9800', trend: '+12%', trendIcon: 'pi pi-arrow-up' },
        { title: MESSAGES.DASHBOARD.STATS.TOTAL_ORDERS, value: '1,240', icon: 'pi pi-receipt', color: '#19B6E6', trend: '+5%', trendIcon: 'pi pi-arrow-up' },
        { title: MESSAGES.DASHBOARD.STATS.CUSTOMERS, value: '450', icon: 'pi pi-users', color: '#4CAF50', trend: '+8%', trendIcon: 'pi pi-arrow-up' },
        { title: MESSAGES.DASHBOARD.STATS.LOW_STOCK, value: '8', icon: 'pi pi-exclamation-triangle', color: '#F44336', trend: 'Critical', trendIcon: 'pi pi-info-circle' }
    ];

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.initCharts();
        }
        this.initStoreForm();
        this.loadStores();
        this.loadStates();
    }

    private initStoreForm(): void {
        this.storeForm = this.fb.group({
            name: ['', Validators.required],
            phone: ['', [Validators.required, phoneNumberValidator()]],
            licenseNumber: ['', Validators.required],
            addressLine: ['', Validators.required],
            city: ['', Validators.required],
            postalCode: ['', [Validators.required, Validators.pattern(/^\d{5,6}$/)]],
            stateId: ['', Validators.required]
        });
    }

    loadStores(): void {
        this.storeService.getMyStores().subscribe({
            next: (res) => {
                if (res.succeeded && res.data) {
                    this.stores.set(res.data);
                }
            }
        });
    }

    loadStates(): void {
        this.commonService.getState().subscribe({
            next: (res: State[]) => {
                this.states.set(res);
            }
        });
    }

    openAddStoreDialog(): void {
        this.storeForm.reset();
        this.showAddStoreDialog.set(true);
    }

    closeAddStoreDialog(): void {
        this.showAddStoreDialog.set(false);
    }

    saveStore(): void {
        if (this.storeForm.invalid) {
            this.storeForm.markAllAsTouched();
            return;
        }

        this.savingStore.set(true);
        this.storeService.addStore(this.storeForm.getRawValue()).subscribe({
            next: (res) => {
                this.savingStore.set(false);
                if (res.succeeded) {
                    this.toastService.success('Success', 'Store added successfully.');
                    this.showAddStoreDialog.set(false);
                    this.loadStores();
                }
            },
            error: () => {
                this.savingStore.set(false);
            }
        });
    }

    onStoreAction(event: { id: string; data: Store }): void {
        // View store details - can be expanded later
    }

    public recentActivities = [
        { title: 'Stock Updated', summary: 'Paracetamol 500mg (500 units)', eventTime: new Date() },
        { title: 'Low Stock Alert', summary: 'Insulin Syringes (Critical)', eventTime: new Date(Date.now() - 3600000) },
        { title: 'New Sale', summary: 'Order #7728 - $145.50', eventTime: new Date(Date.now() - 7200000) }
    ];

    private initCharts() {
        const documentStyle = getComputedStyle(document.documentElement);
        const primaryColor = documentStyle.getPropertyValue('--primary-color') || '#19B6E6';
        const textColor = documentStyle.getPropertyValue('--text-primary') || '#212121';
        const textColorSecondary = documentStyle.getPropertyValue('--text-secondary') || '#757575';
        const surfaceBorder = documentStyle.getPropertyValue('--border-color') || '#E0E0E0';

        this.chartData = {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Weekly Sales ($)',
                    data: [1200, 1900, 1500, 2100, 2400, 3100, 2800],
                    fill: true,
                    borderColor: primaryColor,
                    tension: 0.4,
                    backgroundColor: primaryColor.includes('#') ? primaryColor + '20' : 'rgba(25, 182, 230, 0.1)'
                }
            ]
        };

        this.chartOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', align: 'end', labels: { usePointStyle: true, pointStyle: 'circle', color: textColor, boxWidth: 8, padding: 10, font: { size: 10 } } },
                tooltip: { padding: 8, bodyFont: { size: 11 }, titleFont: { size: 11 } }
            },
            scales: {
                x: { ticks: { color: textColorSecondary, font: { size: 9 }, maxRotation: 0, autoSkip: true }, grid: { display: false } },
                y: { ticks: { color: textColorSecondary, font: { size: 9 }, padding: 5 }, grid: { color: surfaceBorder, drawBorder: false } }
            },
            layout: { padding: { left: 2, right: 15, top: 5, bottom: 5 } }
        };

        this.pieData = {
            labels: ['Medicines', 'Surgicals', 'Consumer', 'Others'],
            datasets: [{ data: [45, 25, 20, 10], backgroundColor: [primaryColor, '#4CAF50', '#FF9800', '#9C27B0'], borderColor: 'transparent' }]
        };

        this.pieOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, pointStyle: 'circle', color: textColor, boxWidth: 8, padding: 8, font: { size: 10 } } } },
            layout: { padding: 10 }
        };
    }
}
