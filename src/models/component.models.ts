import { ApiRequest } from "./axios.models";
import { AuthState, BaseEntity, Page } from "./base.models";

export interface SnackbarState {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
}

export const ROLES = {
  ADMIN: "ROLE_ADMIN",
  COURIER: "ROLE_COURIER",
  CLIENT: "ROLE_CLIENT",
};

export const ENTITIES = {
  USER: "User",
  CONTACT: "Contact",
  ROLE: "Role",
  ORDER: "Order",
  OFFICE: "Office",
  BRANCH: "Branch",
  STATUS: "Status",
} as const;

export type EntityType = (typeof ENTITIES)[keyof typeof ENTITIES];

export interface Actions {
  create: string[];
  update: string[];
  delete: string[];
  [key: string]: string[] | undefined;
}

export interface RouteConfig {
  path: string;
  label: string;
  allowedRoles: string[];
}

export interface PublicRouteConfig extends RouteConfig {
  element: React.ReactNode;
}

export interface PrivateRouteConfig extends RouteConfig {
  element: React.ReactNode | ((actions?: Actions) => React.ReactElement);
  actions?: Actions;
}

export interface FormProps {
  id: string | number | null;
  onSubmit: (item: any) => void;
  onClose?: () => void;
}

export interface PageProps {
  allowedActions?: Actions;
}

export interface ValueColumn {
  key: string;
  label: string;
}

export interface ItemsContainerProps<T extends BaseEntity> {
  auth: AuthState;
  header: {
    title: string;
    placeholder: string;
    buttonName: string;
  };
  actions: {
    getItems: (page: number, size: number) => ApiRequest;
    createItem: (item: any) => ApiRequest;
    updateItem: (id: string | number, item: any) => ApiRequest;
    deleteItem: (id: string | number) => ApiRequest;
    searchItem: (query: string, page: number, size: number) => ApiRequest;
  };
  adapters: {
    itemAdapter: (data: any) => T;
    listAdapter: <U>(data: any, adapter: (item: any) => U) => U[] | Page<U>;
  };
  list: {
    columns: ValueColumn[];
    mapItemRow: (item: T) => { key: string; content: React.ReactNode }[];
    itemForm: (
      id: string | number | null,
      onSubmit: (item: any) => void,
      onClose?: () => void,
    ) => React.ReactNode;
  };
  allowedActions: Actions;
  formatMessage: (item: T) => string;

  rowExpandable?: (item: T) => boolean;
  expandContent?: (id: string | number) => React.ReactNode;
}
