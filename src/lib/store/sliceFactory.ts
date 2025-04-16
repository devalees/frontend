import { StateCreator } from 'zustand';

/**
 * Type for a slice factory function
 * 
 * @template TState - The slice state type
 * @template TStore - Optional: the full store state type (defaults to TState)
 */
export type SliceCreator<TState, TStore = TState> = (
  set: (fn: (state: TStore) => TStore) => void,
  get: () => TStore
) => TState;

/**
 * Factory function to create a properly typed slice
 * 
 * @template TState - The slice state type
 * @template TStore - Optional: the full store state type (defaults to TState)
 * @param creator - The slice creator function
 * @returns A state creator that can be used by Zustand
 */
export function createSlice<TState, TStore = TState>(
  creator: SliceCreator<TState, TStore>
): StateCreator<TStore> {
  return (set, get, api) => {
    return {
      ...creator(
        (fn) => set((state) => fn(state)),
        get
      ),
    } as unknown as TStore;
  };
}

/**
 * Factory function to combine multiple slices into one store
 * 
 * @template TState - The combined state type
 * @param slices - Array of state creators for each slice
 * @returns A state creator combining all slices
 */
export function combineSlices<TState extends object>(
  slices: StateCreator<TState>[]
): StateCreator<TState> {
  return (set, get, api) => {
    return slices.reduce(
      (combinedState, slice) => {
        return {
          ...combinedState,
          ...slice(set, get, api),
        };
      },
      {} as TState
    );
  };
} 