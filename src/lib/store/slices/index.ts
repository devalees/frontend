import { TodoSlice, createTodoSlice } from './todoSlice';
import { UserSlice, createUserSlice } from './userSlice';
import { NotificationSlice, createNotificationSlice } from './notificationSlice';

// Export all slice types
export type { TodoSlice, UserSlice, NotificationSlice };

// Export all slice creators
export { createTodoSlice, createUserSlice, createNotificationSlice };

// Combined state type
export type RootState = TodoSlice & UserSlice & NotificationSlice; 