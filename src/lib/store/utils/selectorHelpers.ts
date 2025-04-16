/**
 * Selector helper utilities for Zustand store
 * Provides functions for creating and composing selectors
 */

/**
 * Type definition for a selector function
 */
export type Selector<TState, TResult> = (state: TState) => TResult;

/**
 * Type for a path of object keys
 */
export type Path = (string | number)[];

/**
 * Gets a value from a nested object using a path
 * @param obj The object to get the value from
 * @param path The path to the value
 * @returns The value at the path or undefined if not found
 */
export function getValueByPath<T>(obj: any, path: Path): T | undefined {
  return path.reduce((acc, key) => {
    if (acc === undefined) return undefined;
    return acc[key];
  }, obj);
}

/**
 * Creates a selector that gets a value from a nested path
 * @param path The path to the value
 * @returns A selector function that extracts the value at the given path
 */
export function createPathSelector<TState extends object, TResult>(
  path: Path
): Selector<TState, TResult | undefined> {
  return (state: TState) => getValueByPath<TResult>(state, path);
}

/**
 * Creates a selector with a transformation function
 * @param selector A selector to get the input data
 * @param transform A function to transform the input data
 * @returns A new selector that applies the transformation to the selected data
 */
export function createTransformedSelector<TState, TInput, TOutput>(
  selector: Selector<TState, TInput>,
  transform: (input: TInput) => TOutput
): Selector<TState, TOutput> {
  return (state: TState) => transform(selector(state));
}

/**
 * Creates a selector that depends on multiple input selectors
 * @param selectors An array of selectors
 * @param combiner A function that combines the results of the input selectors
 * @returns A new selector that combines the results of multiple selectors
 */
export function createCombinedSelector<TState, TInputs extends any[], TOutput>(
  selectors: [...{ [K in keyof TInputs]: Selector<TState, TInputs[K]> }],
  combiner: (...inputs: TInputs) => TOutput
): Selector<TState, TOutput> {
  return (state: TState) => {
    const inputs = selectors.map(selector => selector(state)) as TInputs;
    return combiner(...inputs);
  };
}

/**
 * Creates a memoized selector that only recomputes when inputs change
 * @param selectors An array of input selectors
 * @param combiner A function that combines the results of the input selectors
 * @returns A memoized selector function
 */
export function createMemoizedSelector<TState, TInputs extends any[], TOutput>(
  selectors: [...{ [K in keyof TInputs]: Selector<TState, TInputs[K]> }],
  combiner: (...inputs: TInputs) => TOutput
): Selector<TState, TOutput> {
  let lastInputs: TInputs | undefined;
  let lastResult: TOutput | undefined;

  return (state: TState) => {
    const inputs = selectors.map(selector => selector(state)) as TInputs;
    
    // Check if inputs have changed
    const inputsChanged = !lastInputs || inputs.some((input, index) => !Object.is(input, lastInputs![index]));
    
    if (inputsChanged) {
      // Recompute the result if inputs changed
      const result = combiner(...inputs);
      lastInputs = inputs;
      lastResult = result;
      return result;
    }
    
    // Return memoized result if inputs haven't changed
    return lastResult as TOutput;
  };
}

/**
 * Creates a predicate selector that filters an array
 * @param arraySelector Selector that returns an array
 * @param predicate A predicate function to filter the array
 * @returns A selector that returns the filtered array
 */
export function createFilterSelector<TState, TItem>(
  arraySelector: Selector<TState, TItem[]>,
  predicate: (item: TItem) => boolean
): Selector<TState, TItem[]> {
  return createTransformedSelector(
    arraySelector,
    (items) => items.filter(predicate)
  );
}

/**
 * Creates a selector that maps array items
 * @param arraySelector Selector that returns an array
 * @param mapper A function to transform each item
 * @returns A selector that returns the mapped array
 */
export function createMapSelector<TState, TInput, TOutput>(
  arraySelector: Selector<TState, TInput[]>,
  mapper: (item: TInput) => TOutput
): Selector<TState, TOutput[]> {
  return createTransformedSelector(
    arraySelector,
    (items) => items.map(mapper)
  );
}

/**
 * Creates a selector that returns a sorted array
 * @param arraySelector Selector that returns an array
 * @param compareFn A comparison function to sort the array
 * @returns A selector that returns the sorted array
 */
export function createSortSelector<TState, TItem>(
  arraySelector: Selector<TState, TItem[]>,
  compareFn: (a: TItem, b: TItem) => number
): Selector<TState, TItem[]> {
  return createTransformedSelector(
    arraySelector,
    (items) => [...items].sort(compareFn)
  );
}

/**
 * Creates a selector that returns a specific item from an array by predicate
 * @param arraySelector Selector that returns an array
 * @param predicate A function to identify the item
 * @returns A selector that returns the found item or undefined
 */
export function createItemSelector<TState, TItem>(
  arraySelector: Selector<TState, TItem[]>,
  predicate: (item: TItem) => boolean
): Selector<TState, TItem | undefined> {
  return createTransformedSelector(
    arraySelector,
    (items) => items.find(predicate)
  );
} 