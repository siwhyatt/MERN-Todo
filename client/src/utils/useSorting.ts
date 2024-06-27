// src/utils/useSorting.ts
import { useState, useCallback } from 'react';
import { sortByCreatedAt, sortByTime, sortByPriority, SortFunction, SortType } from './sortFunctions';

export const useSorting = () => {
  const [sortFunction, setSortFunction] = useState<SortFunction>(() => () => 0);
  const [sortType, setSortType] = useState<SortType | null>(null);
  const [sortAscending, setSortAscending] = useState(true);

  const updateSort = useCallback((newSortType: SortType) => {
    setSortType(newSortType);
    setSortAscending((prev) => {
      const ascending = newSortType === sortType ? !prev : true;

      switch (newSortType) {
        case SortType.CreatedAt:
          setSortFunction(() => sortByCreatedAt(ascending));
          break;
        case SortType.Time:
          setSortFunction(() => sortByTime(ascending));
          break;
        case SortType.Priority:
          setSortFunction(() => sortByPriority(ascending));
          break;
      }

      return ascending;
    });
  }, [sortType]);

  const setSortByCreatedAt = useCallback(() => updateSort(SortType.CreatedAt), [updateSort]);
  const setSortByTime = useCallback(() => updateSort(SortType.Time), [updateSort]);
  const setSortByPriority = useCallback(() => updateSort(SortType.Priority), [updateSort]);

  return {
    sortFunction,
    sortType,
    sortAscending,
    setSortByCreatedAt,
    setSortByTime,
    setSortByPriority
  };
};
