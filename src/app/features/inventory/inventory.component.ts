import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../core/primematerial.module';
import { InventoryService, InventoryItem } from './services/inventory.service';
import { MESSAGES } from '../../core/constants/messages.const';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, PrimematerialModule],
  providers: [MessageService],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class InventoryComponent implements OnInit {
  private inventoryService = inject(InventoryService);
  private messageService = inject(MessageService);

  public messages = MESSAGES.INVENTORY;
  public commonMessages = MESSAGES.COMMON;

  public items = signal<InventoryItem[]>([]);
  public loading = signal<boolean>(true);

  ngOnInit() {
    this.loadInventory();
  }

  loadInventory() {
    this.loading.set(true);
    this.inventoryService.getInventory().subscribe({
      next: (data) => {
        this.items.set([...data]);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load inventory' });
      }
    });
  }

  deleteItem(item: InventoryItem) {
    this.inventoryService.deleteItem(item.id).subscribe(() => {
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${item.name} removed from inventory` });
      this.loadInventory();
    });
  }

  onFilter(event: Event, dt: any) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      dt.filterGlobal(inputElement.value, 'contains');
    }
  }
}
