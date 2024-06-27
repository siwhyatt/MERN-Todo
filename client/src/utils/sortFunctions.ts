// src/utils/sortFunctions.ts

export interface Todo {
  _id: string;
  userId: string;
  title: string;
  time: number;
  priority: 'low' | 'medium' | 'high';
  projectId: string | null;
  createdAt: string | Date;
}

export const sortByCreatedAt = (ascending: boolean) => (a: Todo, b: Todo): number => {
  const dateA = new Date(a.createdAt).getTime();
  const dateB = new Date(b.createdAt).getTime();
  return ascending ? dateA - dateB : dateB - dateA;
};

export const sortByTime = (ascending: boolean) => (a: Todo, b: Todo): number => {
  return ascending ? a.time - b.time : b.time - a.time;
};

const priorityOrder: { [key: string]: number } = { low: 1, medium: 2, high: 3 };

export const sortByPriority = (ascending: boolean) => (a: Todo, b: Todo): number => {
  return ascending
    ? priorityOrder[a.priority] - priorityOrder[b.priority]
    : priorityOrder[b.priority] - priorityOrder[a.priority];
};

export type SortFunction = (a: Todo, b: Todo) => number;

export enum SortType {
  CreatedAt,
  Time,
  Priority
}
