export interface GridColumn {
    field: string;
    header: string;
    type?: 'text' | 'date' | 'badge' | 'currency' | 'status' | 'image' | 'boolean';
    sortable?: boolean;
    width?: string;
}

export interface GridAction {
    id: string;
    label: string;
    icon: string;
    color?: string;
    severity?: 'success' | 'info' | 'warn' | 'danger' | 'help' | 'primary' | 'secondary' | 'contrast';
    tooltip?: string;
}
