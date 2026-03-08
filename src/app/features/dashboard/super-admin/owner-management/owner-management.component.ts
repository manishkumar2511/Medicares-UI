import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../../../core/primematerial.module';
import { GenericGridComponent } from '../../../../shared/components/generic-grid/generic-grid.component';
import { GridColumn, GridAction } from '../../../../core/models/grid.model';
import { COMMON_GRID_ACTIONS } from '../../../../core/constants/grid-action-items';

@Component({
  selector: 'app-owner-management',
  standalone: true,
  imports: [CommonModule, PrimematerialModule, GenericGridComponent],
  templateUrl: './owner-management.component.html',
  styleUrl: './owner-management.component.scss'
})
export class OwnerManagementComponent implements OnInit {
  owners: any[] = [];

  cols: GridColumn[] = [
    { field: 'image', header: 'User', type: 'image', width: '80px' },
    { field: 'name', header: 'Owner Name', sortable: true },
    { field: 'email', header: 'Email Address', sortable: true },
    { field: 'pharmacyCount', header: 'Pharmacies', sortable: true, width: '120px' },
    { field: 'subscription', header: 'Plan', type: 'badge' },
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
    // Hardcoded data for development
    this.owners = [
      {
        id: 1,
        name: 'Aravind Swamy',
        email: 'aravind.s@medicares.com',
        pharmacyCount: 12,
        subscription: 'Premium',
        joinedDate: new Date('2023-11-15'),
        status: 'Active',
        image: 'https://i.pravatar.cc/150?u=1'
      },
      {
        id: 2,
        name: 'Priya Sharma',
        email: 'priya.sh@google.com',
        pharmacyCount: 5,
        subscription: 'Standard',
        joinedDate: new Date('2024-01-20'),
        status: 'Pending',
        image: 'https://i.pravatar.cc/150?u=2'
      },
      {
        id: 3,
        name: 'Rahul Varma',
        email: 'rahul.v@medicares.in',
        pharmacyCount: 22,
        subscription: 'Enterprise',
        joinedDate: new Date('2023-05-10'),
        status: 'Active',
        image: 'https://i.pravatar.cc/150?u=3'
      },
      {
        id: 4,
        name: 'Sneha Kapur',
        email: 'sneha.k@outlook.com',
        pharmacyCount: 2,
        subscription: 'Basic',
        joinedDate: new Date('2024-02-05'),
        status: 'Inactive',
        image: 'https://i.pravatar.cc/150?u=4'
      },
      {
        id: 5,
        name: 'Vikram Mehta',
        email: 'vikram.m@gmail.com',
        pharmacyCount: 8,
        subscription: 'Premium',
        joinedDate: new Date('2023-12-01'),
        status: 'Active',
        image: 'https://i.pravatar.cc/150?u=5'
      }
    ];
  }

  handleAction(event: { id: string, data: any }) {
    console.log('Action Executed:', event.id, 'for owner:', event.data.name);
  }
}
