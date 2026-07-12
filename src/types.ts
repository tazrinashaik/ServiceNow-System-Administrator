export enum UserStatus {
  ACTIVE = "Active",
  INACTIVE = "Inactive"
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "PM" | "Team Member" | "Global Admin";
  status: UserStatus;
  lastLogin: string;
  department: string;
  securityLevel: string;
  assignedRoles: string[];
}

export interface PermissionSet {
  read: boolean;
  write: boolean;
  delete: boolean;
  audit: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: PermissionSet;
  isCustom: boolean;
}

export enum TaskStatus {
  BLOCKED = "Blocked",
  IN_PROGRESS = "In Progress",
  COMPLETED = "Completed"
}

export interface Task {
  id: string;
  title: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  dueDate: string;
  status: TaskStatus;
  doneBy?: string;
  description?: string;
}

export interface Activity {
  id: string;
  type: "assign" | "mismatch" | "task_completed";
  user?: string;
  role?: string;
  message: string;
  time: string;
  system: string;
  severity: "info" | "warning" | "success";
}

export interface SystemHealth {
  apiLatency: number;
  cloudSync: number;
  status: "Operational" | "Degraded" | "Maintenance";
  lastAuditTime: string;
}

export interface SessionInfo {
  token: string;
  user: {
    name: string;
    email: string;
    avatar: string;
    role: string;
  } | null;
}
