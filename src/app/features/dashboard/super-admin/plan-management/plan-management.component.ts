import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PrimematerialModule } from '../../../../core/primematerial.module';
import { GenericGridComponent } from '../../../../shared/components/generic-grid/generic-grid.component';
import { GridColumn, GridAction } from '../../../../core/models/grid.model';
import { COMMON_GRID_ACTIONS } from '../../../../core/constants/grid-action-items';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, FormsModule, PrimematerialModule, GenericGridComponent],
  templateUrl: './plan-management.component.html',
  styleUrl: './plan-management.component.scss'
})
export class PlanManagementComponent implements OnInit {
  plans: any[] = [];
  displayDialog = false;
  newPlan = { name: '', price: 0, limit: 0, status: 'Active' };
  statusOptions = ['Active', 'Draft', 'Deprecated'];

  cols: GridColumn[] = [
    { field: 'name', header: 'Tier Name', sortable: true },
    { field: 'price', header: 'Monthly Price', type: 'currency', sortable: true },
    { field: 'limit', header: 'Stores Limit', sortable: true, width: '150px' },
    { field: 'activeUsers', header: 'Active Subscribers', sortable: true },
    { field: 'isDefault', header: 'Default Plan', type: 'boolean', width: '120px' },
    { field: 'status', header: 'Current Status', type: 'status' },
  ];

  actions: GridAction[] = [
    COMMON_GRID_ACTIONS.EDIT,
    COMMON_GRID_ACTIONS.PROMOTE,
    COMMON_GRID_ACTIONS.ARCHIVE
  ];

  ngOnInit() {
    this.plans = [
      { id: 1, name: 'Basic', price: 999, limit: 1, activeUsers: 45, isDefault: false, status: 'Active' },
      { id: 2, name: 'Standard', price: 2499, limit: 5, activeUsers: 82, isDefault: true, status: 'Active' },
      { id: 3, name: 'Premium', price: 4999, limit: 15, activeUsers: 28, isDefault: false, status: 'Active' },
      { id: 4, name: 'Enterprise', price: 9999, limit: 50, activeUsers: 3, isDefault: false, status: 'Active' },
      { id: 5, name: 'Legacy Star', price: 1499, limit: 2, activeUsers: 12, isDefault: false, status: 'Deprecated' }
    ];
  }

  showCreateDialog() {
    this.displayDialog = true;
  }

  savePlan() {
    this.displayDialog = false;
  }

  handleAction(event: { id: string, data: any }) {
    console.log('Action Executed:', event.id, 'for plan:', event.data.name);
  }
}
