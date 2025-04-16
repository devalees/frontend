import { StateCreator } from 'zustand';
import { 
  Selector, 
  SelectorWithDeps, 
  Paginated,
  createInitialPaginationState,
  updatePaginationState 
} from '../utils/stateTypes';

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
  notificationsData: Paginated<Notification>;
  notificationHandler?: (message: string, priority?: NotificationPriority, metadata?: Record<string, any>) => void;
  
  // Actions
  addNotification: (message: string, priority?: NotificationPriority, metadata?: Record<string, any>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  // Pagination actions
  setPage: (page: number) => void;
  
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
export const createNotificationSlice: StateCreator<NotificationSlice> = (set, get) => {
  // Define type-safe selectors
  const getUnreadNotificationsSelector: Selector<NotificationSlice, Notification[]> = (state) => {
    return state.notificationsData.items.filter(notification => !notification.read);
  };
  
  const getNotificationsByPrioritySelector: SelectorWithDeps<NotificationSlice, Notification[], [NotificationPriority]> = 
    (state, priority) => state.notificationsData.items.filter(notification => notification.priority === priority);
  
  return {
    // Initial state
    notificationsData: {
      items: [],
      pagination: createInitialPaginationState(10)
    },
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
      
      set(state => {
        const newItems = [...state.notificationsData.items, newNotification];
        return {
          ...state,
          notificationsData: {
            items: newItems,
            pagination: updatePaginationState(state.notificationsData.pagination, newItems.length)
          }
        };
      });
      
      // Call the notification handler if set
      get().notificationHandler?.(message, priority, metadata);
    },
    
    markAsRead: (id) => {
      set(state => {
        const updatedItems = state.notificationsData.items.map(notification => 
          notification.id === id ? { ...notification, read: true } : notification
        );
        
        return {
          ...state,
          notificationsData: {
            ...state.notificationsData,
            items: updatedItems
          }
        };
      });
    },
    
    markAllAsRead: () => {
      set(state => {
        const updatedItems = state.notificationsData.items.map(notification => 
          ({ ...notification, read: true })
        );
        
        return {
          ...state,
          notificationsData: {
            ...state.notificationsData,
            items: updatedItems
          }
        };
      });
    },
    
    removeNotification: (id) => {
      set(state => {
        const updatedItems = state.notificationsData.items.filter(notification => 
          notification.id !== id
        );
        
        return {
          ...state,
          notificationsData: {
            items: updatedItems,
            pagination: updatePaginationState(state.notificationsData.pagination, updatedItems.length)
          }
        };
      });
    },
    
    clearNotifications: () => {
      set(state => ({
        ...state,
        notificationsData: {
          items: [],
          pagination: createInitialPaginationState(state.notificationsData.pagination.pageSize)
        }
      }));
    },
    
    // Pagination actions
    setPage: (page) => {
      set(state => ({
        ...state,
        notificationsData: {
          ...state.notificationsData,
          pagination: {
            ...state.notificationsData.pagination,
            page: Math.max(1, Math.min(page, state.notificationsData.pagination.totalPages || 1)),
            hasNextPage: page < state.notificationsData.pagination.totalPages,
            hasPreviousPage: page > 1
          }
        }
      }));
    },
    
    // Handler management
    setNotificationHandler: (handler) => {
      set({ notificationHandler: handler });
    },
    
    clearNotificationHandler: () => {
      set({ notificationHandler: undefined });
    },
    
    // Selectors
    getUnreadNotifications: () => {
      return getUnreadNotificationsSelector(get());
    },
    
    getNotificationsByPriority: (priority) => {
      return getNotificationsByPrioritySelector(get(), priority);
    }
  };
}; 