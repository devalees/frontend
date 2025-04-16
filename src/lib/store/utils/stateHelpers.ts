/**
 * State helper utilities for Zustand store
 * Provides immutable update functions for common state operations
 */

/**
 * Updates a property in an object immutably
 * @param obj The object to update
 * @param key The key of the property to update
 * @param value The new value
 * @returns A new object with the updated property
 */
export function updateProperty<T extends object, K extends keyof T>(
  obj: T,
  key: K,
  value: T[K]
): T {
  return {
    ...obj,
    [key]: value,
  };
}

/**
 * Updates multiple properties in an object immutably
 * @param obj The object to update
 * @param updates An object containing the updates
 * @returns A new object with the updated properties
 */
export function updateProperties<T extends object>(
  obj: T,
  updates: Partial<T>
): T {
  return {
    ...obj,
    ...updates,
  };
}

/**
 * Adds an item to an array immutably
 * @param array The array to update
 * @param item The item to add
 * @returns A new array with the added item
 */
export function addItem<T>(array: T[], item: T): T[] {
  return [...array, item];
}

/**
 * Removes an item from an array immutably
 * @param array The array to update
 * @param index The index of the item to remove
 * @returns A new array without the removed item
 */
export function removeItemAtIndex<T>(array: T[], index: number): T[] {
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Removes an item from an array by predicate immutably
 * @param array The array to update
 * @param predicate A function that returns true for the item to remove
 * @returns A new array without the removed item
 */
export function removeItem<T>(array: T[], predicate: (item: T) => boolean): T[] {
  return array.filter((item) => !predicate(item));
}

/**
 * Updates an item in an array immutably
 * @param array The array to update
 * @param index The index of the item to update
 * @param updater A function that returns the updated item
 * @returns A new array with the updated item
 */
export function updateItemAtIndex<T>(
  array: T[],
  index: number,
  updater: (item: T) => T
): T[] {
  return [
    ...array.slice(0, index),
    updater(array[index]),
    ...array.slice(index + 1),
  ];
}

/**
 * Updates an item in an array by predicate immutably
 * @param array The array to update
 * @param predicate A function that returns true for the item to update
 * @param updater A function that returns the updated item
 * @returns A new array with the updated item
 */
export function updateItem<T>(
  array: T[],
  predicate: (item: T) => boolean,
  updater: (item: T) => T
): T[] {
  return array.map((item) => (predicate(item) ? updater(item) : item));
}

/**
 * Toggles an item in an array immutably
 * @param array The array to update
 * @param item The item to toggle
 * @returns A new array with the item toggled
 */
export function toggleArrayItem<T>(array: T[], item: T): T[] {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
}

/**
 * Moves an item in an array immutably
 * @param array The array to update
 * @param fromIndex The index of the item to move
 * @param toIndex The index to move the item to
 * @returns A new array with the item moved
 */
export function moveItem<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...array];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}

/**
 * Sorts an array immutably
 * @param array The array to sort
 * @param compareFn The comparison function
 * @returns A new sorted array
 */
export function sortArray<T>(array: T[], compareFn: (a: T, b: T) => number): T[] {
  return [...array].sort(compareFn);
}

/**
 * Deduplicates an array immutably
 * @param array The array to deduplicate
 * @param keyFn Optional function to extract comparison key
 * @returns A new array with duplicates removed
 */
export function uniqueArray<T>(
  array: T[],
  keyFn?: (item: T) => any
): T[] {
  if (keyFn) {
    const seen = new Set();
    return array.filter((item) => {
      const key = keyFn(item);
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
  return [...new Set(array)];
} 