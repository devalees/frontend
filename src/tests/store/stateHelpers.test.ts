import { describe, it, expect } from '../../tests/utils';
import {
  updateProperty,
  updateProperties,
  addItem,
  removeItemAtIndex,
  removeItem,
  updateItemAtIndex,
  updateItem,
  toggleArrayItem,
  moveItem,
  sortArray,
  uniqueArray
} from '../../lib/store/utils/stateHelpers';

describe('State Helpers', () => {
  describe('Object Update Helpers', () => {
    it('should update a single property immutably', () => {
      const obj = { name: 'John', age: 30 };
      const updated = updateProperty(obj, 'age', 31);
      
      expect(updated).not.toBe(obj); // Ensure immutability
      expect(updated).toEqual({ name: 'John', age: 31 });
      expect(obj).toEqual({ name: 'John', age: 30 }); // Original unchanged
    });
    
    it('should update multiple properties immutably', () => {
      const obj = { name: 'John', age: 30, city: 'New York' };
      const updated = updateProperties(obj, { age: 31, city: 'Boston' });
      
      expect(updated).not.toBe(obj); // Ensure immutability
      expect(updated).toEqual({ name: 'John', age: 31, city: 'Boston' });
      expect(obj).toEqual({ name: 'John', age: 30, city: 'New York' }); // Original unchanged
    });
  });
  
  describe('Array Update Helpers', () => {
    it('should add an item to an array immutably', () => {
      const array = [1, 2, 3];
      const updated = addItem(array, 4);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toEqual([1, 2, 3, 4]);
      expect(array).toEqual([1, 2, 3]); // Original unchanged
    });
    
    it('should remove an item by index immutably', () => {
      const array = [1, 2, 3, 4];
      const updated = removeItemAtIndex(array, 1);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toEqual([1, 3, 4]);
      expect(array).toEqual([1, 2, 3, 4]); // Original unchanged
    });
    
    it('should remove items by predicate immutably', () => {
      const array = [1, 2, 3, 4, 5];
      const updated = removeItem(array, item => item % 2 === 0);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toEqual([1, 3, 5]);
      expect(array).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    });
    
    it('should update an item by index immutably', () => {
      const array = [1, 2, 3];
      const updated = updateItemAtIndex(array, 1, item => item * 10);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toEqual([1, 20, 3]);
      expect(array).toEqual([1, 2, 3]); // Original unchanged
    });
    
    it('should update items by predicate immutably', () => {
      const array = [1, 2, 3, 4];
      const updated = updateItem(array, item => item % 2 === 0, item => item * 10);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toEqual([1, 20, 3, 40]);
      expect(array).toEqual([1, 2, 3, 4]); // Original unchanged
    });
    
    it('should toggle an array item immutably', () => {
      const array = [1, 2, 3];
      
      // Should remove if present
      const updated1 = toggleArrayItem(array, 2);
      expect(updated1).toEqual([1, 3]);
      
      // Should add if not present
      const updated2 = toggleArrayItem(array, 4);
      expect(updated2).toEqual([1, 2, 3, 4]);
      
      expect(array).toEqual([1, 2, 3]); // Original unchanged
    });
    
    it('should move an item in an array immutably', () => {
      const array = [1, 2, 3, 4];
      const updated = moveItem(array, 0, 2);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toEqual([2, 3, 1, 4]);
      expect(array).toEqual([1, 2, 3, 4]); // Original unchanged
    });
    
    it('should sort an array immutably', () => {
      const array = [3, 1, 4, 2];
      const updated = sortArray(array, (a, b) => a - b);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toEqual([1, 2, 3, 4]);
      expect(array).toEqual([3, 1, 4, 2]); // Original unchanged
    });
    
    it('should deduplicate array items immutably', () => {
      const array = [1, 2, 2, 3, 3, 3, 4];
      const updated = uniqueArray(array);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toEqual([1, 2, 3, 4]);
      expect(array).toEqual([1, 2, 2, 3, 3, 3, 4]); // Original unchanged
    });
    
    it('should deduplicate objects by key function', () => {
      const array = [
        { id: 1, name: 'John' },
        { id: 2, name: 'Jane' },
        { id: 1, name: 'Johnny' }, // Duplicate id
        { id: 3, name: 'Bob' }
      ];
      
      const updated = uniqueArray(array, item => item.id);
      
      expect(updated).not.toBe(array); // Ensure immutability
      expect(updated).toHaveLength(3);
      expect(updated.map(item => item.id)).toEqual([1, 2, 3]);
      expect(array).toHaveLength(4); // Original unchanged
    });
  });
}); 