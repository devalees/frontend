import { TodoSlice, createTodoSlice } from './todoSlice';
import { UserSlice, createUserSlice } from './userSlice';

// Export all slice types
export type { TodoSlice, UserSlice };

// Export slice creators
export { createTodoSlice, createUserSlice };

// Combined state type
export type RootState = TodoSlice & UserSlice; 