import { SubscriptionPlanStatus, SubscriptionPlanType } from '../models/subscription-plan/subscription-plan.model';

export const SUBSCRIPTION_PLAN_STATUS_OPTIONS = [
    { label: 'Active', value: SubscriptionPlanStatus.Active },
    { label: 'Draft', value: SubscriptionPlanStatus.Draft },
    { label: 'Deprecated', value: SubscriptionPlanStatus.Deprecated }
];

export const SUBSCRIPTION_PLAN_TYPE_OPTIONS = [
    { label: 'Basic', value: SubscriptionPlanType.Basic },
    { label: 'Standard', value: SubscriptionPlanType.Standard },
    { label: 'Premium', value: SubscriptionPlanType.Premium },
    { label: 'Enterprise', value: SubscriptionPlanType.Enterprise }
];
