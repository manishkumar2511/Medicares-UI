import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sales-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <div class="card p-6 text-center">
        <i class="pi pi-history text-6xl mb-4 text-primary"></i>
        <h2 class="text-2xl font-bold mb-2">Sales History</h2>
        <p class="text-color-secondary">This module is coming soon. Here you will see all your previous sales records.</p>
      </div>
    </div>
  `
})
export class SalesHistoryComponent {}
