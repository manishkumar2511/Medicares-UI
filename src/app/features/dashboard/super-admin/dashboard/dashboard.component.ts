import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimematerialModule } from '../../../../core/primematerial.module';
import { GenericGridComponent } from '../../../../shared/components/generic-grid/generic-grid.component';
import { GridColumn, GridAction, OwnerListResponse } from '../../../../core/models';
import { SuperAdminService, ToastService } from '../../../../core/services';
import { COMMON_GRID_ACTIONS } from '../../../../core/constants';


@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimematerialModule, GenericGridComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class SuperAdminDashboardComponent implements OnInit {
  private superAdminService = inject(SuperAdminService);
  private toastService = inject(ToastService);

  public owners = signal<OwnerListResponse[]>([]);
  public isLoading = signal(true);

  cols: GridColumn[] = [
    { field: 'firstName', header: 'First Name', sortable: true },
    { field: 'lastName', header: 'Last Name', sortable: true },
    { field: 'email', header: 'Email', sortable: true },
    { field: 'phone', header: 'Phone', sortable: true },
    { field: 'address', header: 'Address', sortable: true },
    { field: 'state', header: 'State', sortable: true },
    { field: 'createdAt', header: 'Joined Date', type: 'date', sortable: true },
    { field: 'status', header: 'Status', type: 'status' },
  ];

  actions: GridAction[] = [
    COMMON_GRID_ACTIONS.VIEW,
    COMMON_GRID_ACTIONS.EDIT,
    COMMON_GRID_ACTIONS.SUSPEND,
    COMMON_GRID_ACTIONS.DELETE
  ];

  ngOnInit() {
    this.loadOwners();
  }

  loadOwners() {
    this.isLoading.set(true);
    this.superAdminService.getAllOwners().subscribe({
      next: (res) => {
        if (res.succeeded) {
          const mappedOwners = (res.data || []).map(owner => ({
            ...owner,
            status: owner.isActive ? 'Active' : 'Inactive'
          }));
          this.owners.set(mappedOwners);
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.error('Error', 'Failed to load owners');
        this.isLoading.set(false);
      }
    });
  }

  handleAction(event: { id: string, data: OwnerListResponse }) {
    console.log('Action:', event.id, 'for owner:', event.data.email);
    // Future: implement specific actions
  }

  periods = [
    { label: 'Last 7 Days', value: '7' },
    { label: 'Last 30 Days', value: '30' },
    { label: 'Yearly', value: '365' }
  ];
  selectedPeriod = '30';

  lineChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'New Owners',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        borderColor: '#19B6E6',
        backgroundColor: 'rgba(25, 182, 230, 0.1)',
        tension: 0.4
      }
    ]
  };

  lineChartOptions = {
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false },
      x: { grid: { display: false }, ticks: { color: '#9CA3AF' } }
    }
  };
}
