import { TodoSlice, createTodoSlice } from './todoSlice';
import { UserSlice, createUserSlice } from './userSlice';
import { NotificationSlice, createNotificationSlice } from './notificationSlice';
import { AuthSlice, createAuthSlice } from './authSlice';

// Export all slice types
export type { TodoSlice, UserSlice, NotificationSlice, AuthSlice };

// Export all slice creators
export { createTodoSlice, createUserSlice, createNotificationSlice, createAuthSlice };

// Combined state type
export type RootState = TodoSlice & UserSlice & NotificationSlice & AuthSlice; 