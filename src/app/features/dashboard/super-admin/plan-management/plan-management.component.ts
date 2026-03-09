import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrimematerialModule } from '../../../../core/primematerial.module';
import { GenericGridComponent } from '../../../../shared/components/generic-grid/generic-grid.component';
import { GridColumn, GridAction } from '../../../../core/models/grid.model';
import { COMMON_GRID_ACTIONS, SUBSCRIPTION_PLAN_STATUS_OPTIONS, SUBSCRIPTION_PLAN_TYPE_OPTIONS } from '../../../../core/constants';
import { SubscriptionPlan, SubscriptionPlanStatus, SubscriptionPlanType } from '../../../../core/models';
import { SubscriptionPlanService, ToastService } from '../../../../core/services';
import { FormHelpers } from '../../../../core/helpers';
import { FormErrorComponent } from '../../../../shared';

@Component({
  selector: 'app-plan-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, PrimematerialModule, GenericGridComponent, FormErrorComponent],
  templateUrl: './plan-management.component.html',
  styleUrl: './plan-management.component.scss'
})
export class PlanManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private planService = inject(SubscriptionPlanService);
  private toastService = inject(ToastService);

  plans: SubscriptionPlan[] = [];
  displayDialog = false;
  planForm!: FormGroup;
  isSubmitting = false;

  statusOptions = SUBSCRIPTION_PLAN_STATUS_OPTIONS;
  typeOptions = SUBSCRIPTION_PLAN_TYPE_OPTIONS;

  cols: GridColumn[] = [
    { field: 'name', header: 'Tier Name', sortable: true },
    { field: 'price', header: 'Monthly Price', type: 'currency', sortable: true },
    { field: 'type', header: 'Plan Type', sortable: true },
    { field: 'storeLimit', header: 'Stores Limit', sortable: true, width: '150px' },
    { field: 'durationInDays', header: 'Duration (Days)', sortable: true, width: '160px' },
    { field: 'status', header: 'Status', type: 'status' },
  ];

  actions: GridAction[] = [
    COMMON_GRID_ACTIONS.EDIT,
    COMMON_GRID_ACTIONS.PROMOTE,
    COMMON_GRID_ACTIONS.ARCHIVE
  ];

  ngOnInit() {
    this.initForm();
    this.loadPlans();
  }

  private initForm() {
    this.planForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(150)]],
      type: [SubscriptionPlanType.Basic, Validators.required],
      price: [0, [Validators.required, Validators.min(1)]],
      durationInDays: [30, [Validators.required, Validators.min(1)]],
      storeLimit: [1, [Validators.required, Validators.min(1)]],
      status: [SubscriptionPlanStatus.Draft, Validators.required],
      description: ['', Validators.maxLength(500)]
    });
  }

  // TODO: Replace with actual API call to fetch plans
  private loadPlans() {
    this.plans = [];
  }

  showCreateDialog() {
    this.initForm();
    this.displayDialog = true;
  }

  isFieldInvalid(controlName: string): boolean {
    return FormHelpers.isFieldInvalid(this.planForm, controlName);
  }

  savePlan() {
    if (this.planForm.invalid) {
      this.planForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.planService.createPlan(this.planForm.value).subscribe({
      next: (res) => {
        this.toastService.success('Plan created successfully');
        this.displayDialog = false;
        this.loadPlans();
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.error('Error', err.messages?.[0] || 'Error creating plan');
        this.isSubmitting = false;
      }
    });
  }

  handleAction(event: { id: string, data: SubscriptionPlan }) {
    console.log('Action Executed:', event.id, 'for plan:', event.data.name);
  }
}
