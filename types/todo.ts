export type TaskPriority = "low" | "med" | "high";
export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string; // ISO date
  priority: TaskPriority;
  status: TaskStatus;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
