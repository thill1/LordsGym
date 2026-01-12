// Activity logging utility for admin actions

import { supabase, isSupabaseConfigured } from './supabase';

export type ActionType = 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'export';
export type EntityType = 'product' | 'page' | 'event' | 'user' | 'testimonial' | 'media' | 'settings' | 'calendar_booking';

export interface ActivityLog {
  action_type: ActionType;
  entity_type: EntityType;
  entity_id?: string;
  description: string;
  metadata?: Record<string, any>;
}

export const logActivity = async (log: ActivityLog): Promise<void> => {
  if (!isSupabaseConfigured()) {
    // Fallback to console in development
    console.log('[Activity Log]', log);
    return;
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    await supabase
      .from('activity_logs')
      .insert({
        user_id: user?.id || null,
        action_type: log.action_type,
        entity_type: log.entity_type,
        entity_id: log.entity_id || null,
        description: log.description,
        metadata: log.metadata || null
      });
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw - activity logging should not break the app
  }
};

// Convenience functions
export const logProductAction = (action: ActionType, productId: string, productTitle: string) => {
  logActivity({
    action_type: action,
    entity_type: 'product',
    entity_id: productId,
    description: `${action} product: ${productTitle}`
  });
};

export const logPageAction = (action: ActionType, pageId: string, pageTitle: string) => {
  logActivity({
    action_type: action,
    entity_type: 'page',
    entity_id: pageId,
    description: `${action} page: ${pageTitle}`
  });
};

export const logEventAction = (action: ActionType, eventId: string, eventTitle: string) => {
  logActivity({
    action_type: action,
    entity_type: 'event',
    entity_id: eventId,
    description: `${action} event: ${eventTitle}`
  });
};

export const logUserAction = (action: ActionType, userId: string, userEmail: string) => {
  logActivity({
    action_type: action,
    entity_type: 'user',
    entity_id: userId,
    description: `${action} user: ${userEmail}`
  });
};
