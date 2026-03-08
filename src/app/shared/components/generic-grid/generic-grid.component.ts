import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrimematerialModule } from '../../../core/primematerial.module';
import { GridColumn, GridAction } from '../../../core/models/grid.model';

@Component({
  selector: 'app-generic-grid',
  standalone: true,
  imports: [CommonModule, PrimematerialModule],
  templateUrl: './generic-grid.component.html',
  styleUrl: './generic-grid.component.scss'
})
export class GenericGridComponent {
  @Input() data: any[] = [];
  @Input() columns: GridColumn[] = [];
  @Input() actions: GridAction[] = [];
  @Input() rows: number = 10;
  @Input() showActionLabels: boolean = false;

  @Output() actionExecuted = new EventEmitter<{ id: string, data: any }>();

  getStatusSeverity(status: string): any {
    const s = status?.toLowerCase();
    if (['active', 'completed', 'paid', 'success', 'true'].includes(s)) return 'success';
    if (['pending', 'warning', 'warn', 'in-progress'].includes(s)) return 'warn';
    if (['inactive', 'cancelled', 'failed', 'false', 'expired'].includes(s)) return 'danger';
    return 'info';
  }

  onActionClick(id: string, data: any) {
    this.actionExecuted.emit({ id, data });
  }
}

export * from '../../../core/models/grid.model';
