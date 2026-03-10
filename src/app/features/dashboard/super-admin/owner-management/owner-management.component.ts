import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../../../core/primematerial.module';
import { GenericGridComponent } from '../../../../shared/components/generic-grid/generic-grid.component';
import { GridColumn, GridAction } from '../../../../core/models/grid.model';
import { COMMON_GRID_ACTIONS } from '../../../../core/constants/grid-action-items';
import { SuperAdminService } from '../../../../core/services/super-admin/super-admin.service';
import { OwnerListResponse } from '../../../../core/models';

@Component({
  selector: 'app-owner-management',
  standalone: true,
  imports: [CommonModule, PrimematerialModule, GenericGridComponent],
  templateUrl: './owner-management.component.html',
  styleUrl: './owner-management.component.scss'
})
export class OwnerManagementComponent implements OnInit {
  owners: any[] = [];
  superAdminService = inject(SuperAdminService);

  cols: GridColumn[] = [
    { field: 'name', header: 'Owner Name', sortable: true },
    { field: 'email', header: 'Email Address', sortable: true },
    { field: 'phone', header: 'Phone', sortable: true },
    { field: 'address', header: 'Address', sortable: true },
    { field: 'state', header: 'State', sortable: true },
    { field: 'joinedDate', header: 'Joined At', type: 'date', sortable: true },
    { field: 'status', header: 'Status', type: 'status', width: '120px' },
  ];

  actions: GridAction[] = [
    COMMON_GRID_ACTIONS.VIEW,
    COMMON_GRID_ACTIONS.EDIT,
    COMMON_GRID_ACTIONS.SUSPEND,
    COMMON_GRID_ACTIONS.DELETE
  ];

  ngOnInit() {
    this.superAdminService.getAllOwners().subscribe({
      next: (res) => {
        if (res.succeeded && res.data) {
          console.log('Owners fetched successfully:', res.data);
          this.owners = res.data.map((owner: OwnerListResponse) => ({
            ...owner,
            name: `${owner.firstName} ${owner.lastName}`,
            address: owner.address,
            state: owner.state,
            joinedDate: owner.createdAt,
            status: owner.isActive ? 'Active' : 'Inactive'
          }));
        }
      }
    });
  }

  handleAction(event: { id: string, data: any }) {
    console.log('Action Executed:', event.id, 'for owner:', event.data.name);
  }
}
