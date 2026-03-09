import { Component, OnInit, inject, signal } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PrimematerialModule } from '../../../../core/primematerial.module';
import { GenericGridComponent } from '../../../../shared/components/generic-grid/generic-grid.component';
import { GridColumn, GridAction } from '../../../../core/models/grid.model';
import { COMMON_GRID_ACTIONS, SUBSCRIPTION_PLAN_STATUS_OPTIONS, SUBSCRIPTION_PLAN_TYPE_OPTIONS, MESSAGES } from '../../../../core/constants';
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
  private subscriptionPlanService = inject(SubscriptionPlanService);
  private toastService = inject(ToastService);
  private confirmationService = inject(ConfirmationService);

  public subscriptionPlans = signal<SubscriptionPlan[]>([]);
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
    COMMON_GRID_ACTIONS.DELETE
  ];

  ngOnInit() {
    this.initForm();
    this.loadSubscriptionPlans();
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

  public loadSubscriptionPlans() {
    this.subscriptionPlanService.getSubscriptionPlans().subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.subscriptionPlans.set(res.data ?? []);
        }
      },
      error: (err) => {
        this.toastService.error('Error', MESSAGES.SUBSCRIPTION_PLAN.LOAD_FAILED);
      }
    });
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
    this.subscriptionPlanService.createPlan(this.planForm.value).subscribe({
      next: (res) => {
        if (res.succeeded) {
          this.toastService.success('Success', MESSAGES.SUBSCRIPTION_PLAN.CREATE_SUCCESS);
          this.displayDialog = false;
          this.loadSubscriptionPlans();
        } else {
          this.toastService.error('Error', res.messages?.[0] || MESSAGES.SUBSCRIPTION_PLAN.CREATE_FAILED);
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.toastService.error('Error', err.messages?.[0] || MESSAGES.SUBSCRIPTION_PLAN.CREATE_FAILED);
        this.isSubmitting = false;
      }
    });
  }

  handleAction(event: { id: string, data: SubscriptionPlan }) {
    if (event.id === 'delete') {
      this.deletePlan(event.data);
    }
  }

  private deletePlan(plan: SubscriptionPlan) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the plan "${plan.name}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text',
      accept: () => {
        this.subscriptionPlanService.deleteSubscriptionPlan(plan.id).subscribe({
          next: (res) => {
            if (res.succeeded) {
              this.toastService.success('Success', MESSAGES.SUBSCRIPTION_PLAN.DELETE_SUCCESS);
              this.loadSubscriptionPlans();
            } else {
              this.toastService.error('Error', res.messages?.[0] || MESSAGES.SUBSCRIPTION_PLAN.DELETE_FAILED);
            }
          },
          error: (err) => {
            this.toastService.error('Error', err.messages?.[0] || MESSAGES.SUBSCRIPTION_PLAN.DELETE_FAILED);
          }
        });
      }
    });
  }
}
