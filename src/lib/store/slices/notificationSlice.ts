import { StateCreator } from 'zustand';
import { createSlice } from '../sliceFactory';

// Notification priority levels
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high'
}

// Notification type
export interface Notification {
  id: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: NotificationPriority;
  source?: string;
  metadata?: Record<string, any>;
}

// Notification state
export interface NotificationSlice {
  // State
  notifications: Notification[];
  notificationHandler?: (message: string, priority?: NotificationPriority, metadata?: Record<string, any>) => void;
  
  // Actions
  addNotification: (message: string, priority?: NotificationPriority, metadata?: Record<string, any>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Handler management
  setNotificationHandler: (handler: (message: string, priority?: NotificationPriority, metadata?: Record<string, any>) => void) => void;
  clearNotificationHandler: () => void;
  
  // Selectors
  getUnreadNotifications: () => Notification[];
  getNotificationsByPriority: (priority: NotificationPriority) => Notification[];
}

/**
 * Create a notification slice for managing system notifications
 */
export const createNotificationSlice = createSlice<NotificationSlice>((set, get) => ({
  // Initial state
  notifications: [],
  notificationHandler: undefined,
  
  // Actions
  addNotification: (message, priority = NotificationPriority.NORMAL, metadata = {}) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      message,
      timestamp: Date.now(),
      read: false,
      priority,
      metadata,
    };
    
    set((state) => ({
      ...state,
      notifications: [...state.notifications, newNotification]
    }));
    
    // Call the notification handler if set
    get().notificationHandler?.(message, priority, metadata);
  },
  
  markAsRead: (id) => {
    set((state) => ({
      ...state,
      notifications: state.notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    }));
  },
  
  markAllAsRead: () => {
    set((state) => ({
      ...state,
      notifications: state.notifications.map(notification => ({ ...notification, read: true }))
    }));
  },
  
  removeNotification: (id) => {
    set((state) => ({
      ...state,
      notifications: state.notifications.filter(notification => notification.id !== id)
    }));
  },
  
  clearNotifications: () => {
    set((state) => ({
      ...state,
      notifications: []
    }));
  },
  
  // Handler management
  setNotificationHandler: (handler) => {
    set((state) => ({
      ...state,
      notificationHandler: handler
    }));
  },
  
  clearNotificationHandler: () => {
    set((state) => ({
      ...state,
      notificationHandler: undefined
    }));
  },
  
  // Selectors
  getUnreadNotifications: () => {
    return get().notifications.filter(notification => !notification.read);
  },
  
  getNotificationsByPriority: (priority) => {
    return get().notifications.filter(notification => notification.priority === priority);
  }
})); 