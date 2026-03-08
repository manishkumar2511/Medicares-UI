import { GridAction } from '../models/grid.model';

export const GRID_ACTION_ITEMS = {
  Edit: "edit",
  Delete: "delete",
  View: "view",
  Suspend: "suspend",
  Promote: "promote",
  Archive: "archive"
};

export const COMMON_GRID_ACTIONS = {
  VIEW: {
    id: GRID_ACTION_ITEMS.View,
    label: 'View Details',
    icon: 'pi pi-eye',
    severity: 'info' as const,
    tooltip: 'View Profile'
  } as GridAction,
  EDIT: {
    id: GRID_ACTION_ITEMS.Edit,
    label: 'Edit',
    icon: 'pi pi-pencil',
    severity: 'primary' as const,
    tooltip: 'Update Information'
  } as GridAction,
  SUSPEND: {
    id: GRID_ACTION_ITEMS.Suspend,
    label: 'Suspend',
    icon: 'pi pi-lock',
    severity: 'warn' as const,
    tooltip: 'Suspend Account'
  } as GridAction,
  DELETE: {
    id: GRID_ACTION_ITEMS.Delete,
    label: 'Delete',
    icon: 'pi pi-trash',
    severity: 'danger' as const,
    tooltip: 'Remove Permanent'
  } as GridAction,
  PROMOTE: {
    id: GRID_ACTION_ITEMS.Promote,
    label: 'Set Default',
    icon: 'pi pi-star',
    severity: 'warn' as const,
    tooltip: 'Set as Default'
  } as GridAction,
  ARCHIVE: {
    id: GRID_ACTION_ITEMS.Archive,
    label: 'Archive',
    icon: 'pi pi-trash',
    severity: 'danger' as const,
    tooltip: 'Archive Record'
  } as GridAction
};
