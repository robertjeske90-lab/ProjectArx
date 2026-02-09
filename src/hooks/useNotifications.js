import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  // Real-time listener for notifications
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  // Mark single notification as read
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      const batch = writeBatch(db);
      notifications
        .filter(n => !n.read)
        .forEach(n => {
          batch.update(doc(db, 'notifications', n.id), { read: true });
        });
      await batch.commit();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await deleteDoc(doc(db, 'notifications', notificationId));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Create notification (used by other parts of the app)
  const createNotification = async (userId, data) => {
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        ...data,
        read: false,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification
  };
}

// Notification types helper
export const NOTIFICATION_TYPES = {
  INVITE: 'invite',
  JOIN_REQUEST: 'join_request',
  APPROVED: 'approved',
  NEEDS_REVISION: 'needs_revision',
  REJECTED: 'rejected',
  SESSION_STARTING: 'session_starting',
  XP_RECEIVED: 'xp_received'
};

// Notification icons
export const getNotificationIcon = (type) => {
  switch (type) {
    case 'invite': return '📨';
    case 'join_request': return '👋';
    case 'approved': return '✅';
    case 'needs_revision': return '⚠️';
    case 'rejected': return '❌';
    case 'session_starting': return '🎲';
    case 'xp_received': return '💰';
    default: return '🔔';
  }
};

// Notification text
export const getNotificationText = (notification) => {
  switch (notification.type) {
    case 'invite':
      return `${notification.fromUserName} hat dich zu "${notification.roomName}" eingeladen!`;
    case 'join_request':
      return `${notification.fromUserName} möchte "${notification.roomName}" beitreten`;
    case 'approved':
      return `Dein Charakter "${notification.characterName}" wurde angenommen!`;
    case 'needs_revision':
      return `Dein Charakter "${notification.characterName}" braucht Überarbeitung`;
    case 'rejected':
      return `Dein Charakter "${notification.characterName}" wurde abgelehnt`;
    case 'session_starting':
      return `"${notification.roomName}" startet bald!`;
    case 'xp_received':
      return `Du hast ${notification.xpAmount} EP erhalten!`;
    default:
      return 'Neue Benachrichtigung';
  }
};
