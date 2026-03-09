export enum SubscriptionPlanStatus {
    Active = 'Active',
    Draft = 'Draft',
    Deprecated = 'Deprecated'
}

export enum SubscriptionPlanType {
    Basic = 'Basic',
    Standard = 'Standard',
    Premium = 'Premium',
    Enterprise = 'Enterprise'
}

export interface CreateSubscriptionPlanRequest {
    name: string;
    description?: string;
    price: number;
    durationInDays: number;
    storeLimit: number;
    type: SubscriptionPlanType;
    status: SubscriptionPlanStatus;
}

export interface CreateSubscriptionPlanResponse {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationInDays: number;
    storeLimit: number;
    type: SubscriptionPlanType;
    status: SubscriptionPlanStatus;
}

export interface SubscriptionPlan {
    id: string;
    name: string;
    description?: string;
    price: number;
    durationInDays: number;
    storeLimit: number;
    type: SubscriptionPlanType;
    status: SubscriptionPlanStatus;
}
