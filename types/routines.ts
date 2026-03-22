export type RoutineType =
  | "hourly"
  | "morning"
  | "night"
  | "work"
  | "study"
  | "gym"
  | "custom";

export type RoutineDay =
  | "sunday"
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday";

export interface RoutineTask {
  id: string;
  title: string;
  time?: string;
  notes?: string;
}

export interface Routine {
  id: string;
  title: string;
  routineType: RoutineType;
  day?: RoutineDay;
  startTime?: string;
  endTime?: string;
  notes?: string;
  imageDataUrl?: string;
  imageUrl?: string;
  tasks: RoutineTask[];
}