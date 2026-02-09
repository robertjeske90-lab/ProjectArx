import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  doc, 
  query, 
  where,
  updateDoc,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications, NOTIFICATION_TYPES } from './useNotifications';

// Generate room code
function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ARX-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function useGameRooms() {
  const [myRooms, setMyRooms] = useState([]); // Rooms where I'm SL
  const [joinedRooms, setJoinedRooms] = useState([]); // Rooms where I'm player
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser, userProfile } = useAuth();
  const { createNotification } = useNotifications();

  // Fetch all rooms for current user
  const fetchRooms = useCallback(async () => {
    if (!currentUser) {
      setMyRooms([]);
      setJoinedRooms([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Rooms where I'm SL
      const slQuery = query(
        collection(db, 'gameRooms'),
        where('slUserId', '==', currentUser.uid)
      );
      const slSnapshot = await getDocs(slQuery);
      const slRooms = slSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        role: 'sl'
      }));

      // Rooms where I'm a member
      const memberQuery = query(
        collection(db, 'roomMembers'),
        where('userId', '==', currentUser.uid),
        where('status', 'in', ['approved', 'pending', 'invited'])
      );
      const memberSnapshot = await getDocs(memberQuery);
      
      // Fetch room details for each membership
      const memberRooms = await Promise.all(
        memberSnapshot.docs.map(async (memberDoc) => {
          const memberData = memberDoc.data();
          const roomDoc = await getDoc(doc(db, 'gameRooms', memberData.roomId));
          if (roomDoc.exists()) {
            return {
              id: roomDoc.id,
              ...roomDoc.data(),
              role: 'player',
              memberStatus: memberData.status,
              characterId: memberData.characterId,
              characterName: memberData.characterName
            };
          }
          return null;
        })
      );

      setMyRooms(slRooms.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate()));
      setJoinedRooms(memberRooms.filter(r => r !== null));
      setError(null);
    } catch (err) {
      console.error('Error fetching rooms:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Create new room (as SL)
  const createRoom = async (roomData) => {
    if (!currentUser || !userProfile) throw new Error('Nicht eingeloggt');

    try {
      const roomCode = generateRoomCode();
      
      const newRoom = {
        name: roomData.name,
        description: roomData.description || '',
        roomCode,
        slUserId: currentUser.uid,
        slName: userProfile.displayName,
        settings: {
          techLevel: roomData.techLevel || 'fantasy',
          maxPlayers: roomData.maxPlayers || 6,
          requiresApproval: true
        },
        createdAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'gameRooms'), newRoom);
      await fetchRooms();

      return { id: docRef.id, roomCode, ...newRoom };
    } catch (err) {
      console.error('Error creating room:', err);
      throw err;
    }
  };

  // Get room by code
  const getRoomByCode = async (roomCode) => {
    try {
      const q = query(
        collection(db, 'gameRooms'),
        where('roomCode', '==', roomCode.toUpperCase())
      );
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return null;
      }

      const roomDoc = snapshot.docs[0];
      return { id: roomDoc.id, ...roomDoc.data() };
    } catch (err) {
      console.error('Error finding room:', err);
      throw err;
    }
  };

  // Get room by ID
  const getRoom = async (roomId) => {
    try {
      const roomDoc = await getDoc(doc(db, 'gameRooms', roomId));
      if (roomDoc.exists()) {
        return { id: roomDoc.id, ...roomDoc.data() };
      }
      return null;
    } catch (err) {
      console.error('Error fetching room:', err);
      throw err;
    }
  };

  // Request to join room (player initiated)
  const requestToJoin = async (roomId, characterId, characterName) => {
    if (!currentUser || !userProfile) throw new Error('Nicht eingeloggt');

    try {
      const room = await getRoom(roomId);
      if (!room) throw new Error('Runde nicht gefunden');

      // Check if already a member
      const existingQuery = query(
        collection(db, 'roomMembers'),
        where('roomId', '==', roomId),
        where('userId', '==', currentUser.uid)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('Du bist bereits Mitglied oder hast eine Anfrage gestellt');
      }

      // Create membership request
      await addDoc(collection(db, 'roomMembers'), {
        roomId,
        userId: currentUser.uid,
        userName: userProfile.displayName,
        playerCode: userProfile.playerCode,
        characterId,
        characterName,
        joinMethod: 'requested',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // Notify SL
      await createNotification(room.slUserId, {
        type: NOTIFICATION_TYPES.JOIN_REQUEST,
        fromUserId: currentUser.uid,
        fromUserName: userProfile.displayName,
        roomId,
        roomName: room.name,
        characterId,
        characterName
      });

      await fetchRooms();
    } catch (err) {
      console.error('Error requesting to join:', err);
      throw err;
    }
  };

  // Invite player (SL initiated)
  const invitePlayer = async (roomId, playerCode) => {
    if (!currentUser || !userProfile) throw new Error('Nicht eingeloggt');

    try {
      const room = await getRoom(roomId);
      if (!room) throw new Error('Runde nicht gefunden');
      if (room.slUserId !== currentUser.uid) throw new Error('Nur der SL kann einladen');

      // Find user by player code
      const userQuery = query(
        collection(db, 'users'),
        where('playerCode', '==', playerCode.toUpperCase())
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        throw new Error('Spieler-Code nicht gefunden');
      }

      const invitedUser = userSnapshot.docs[0];
      const invitedUserData = invitedUser.data();

      // Check if already a member
      const existingQuery = query(
        collection(db, 'roomMembers'),
        where('roomId', '==', roomId),
        where('userId', '==', invitedUser.id)
      );
      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        throw new Error('Spieler ist bereits Mitglied oder eingeladen');
      }

      // Create invitation
      await addDoc(collection(db, 'roomMembers'), {
        roomId,
        userId: invitedUser.id,
        userName: invitedUserData.displayName,
        playerCode: invitedUserData.playerCode,
        characterId: null,
        characterName: null,
        joinMethod: 'invited',
        invitedBy: currentUser.uid,
        status: 'invited',
        createdAt: serverTimestamp()
      });

      // Notify invited player
      await createNotification(invitedUser.id, {
        type: NOTIFICATION_TYPES.INVITE,
        fromUserId: currentUser.uid,
        fromUserName: userProfile.displayName,
        roomId,
        roomName: room.name
      });

      return { success: true, userName: invitedUserData.displayName };
    } catch (err) {
      console.error('Error inviting player:', err);
      throw err;
    }
  };

  // Accept invitation (player)
  const acceptInvitation = async (roomId, characterId, characterName) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');

    try {
      // Find membership
      const memberQuery = query(
        collection(db, 'roomMembers'),
        where('roomId', '==', roomId),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'invited')
      );
      const memberSnapshot = await getDocs(memberQuery);

      if (memberSnapshot.empty) {
        throw new Error('Einladung nicht gefunden');
      }

      const memberDoc = memberSnapshot.docs[0];

      // Update to pending (needs SL approval for character)
      await updateDoc(doc(db, 'roomMembers', memberDoc.id), {
        characterId,
        characterName,
        status: 'pending',
        respondedAt: serverTimestamp()
      });

      // Notify SL
      const room = await getRoom(roomId);
      await createNotification(room.slUserId, {
        type: NOTIFICATION_TYPES.JOIN_REQUEST,
        fromUserId: currentUser.uid,
        fromUserName: memberDoc.data().userName,
        roomId,
        roomName: room.name,
        characterId,
        characterName
      });

      await fetchRooms();
    } catch (err) {
      console.error('Error accepting invitation:', err);
      throw err;
    }
  };

  // Decline invitation (player)
  const declineInvitation = async (roomId) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');

    try {
      const memberQuery = query(
        collection(db, 'roomMembers'),
        where('roomId', '==', roomId),
        where('userId', '==', currentUser.uid)
      );
      const memberSnapshot = await getDocs(memberQuery);

      if (!memberSnapshot.empty) {
        await deleteDoc(doc(db, 'roomMembers', memberSnapshot.docs[0].id));
      }

      await fetchRooms();
    } catch (err) {
      console.error('Error declining invitation:', err);
      throw err;
    }
  };

  // Get room members (for SL)
  const getRoomMembers = async (roomId) => {
    try {
      const q = query(
        collection(db, 'roomMembers'),
        where('roomId', '==', roomId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.error('Error fetching members:', err);
      throw err;
    }
  };

  // Approve character (SL)
  const approveCharacter = async (roomId, memberId) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');

    try {
      const memberDoc = await getDoc(doc(db, 'roomMembers', memberId));
      const memberData = memberDoc.data();

      await updateDoc(doc(db, 'roomMembers', memberId), {
        status: 'approved',
        reviewedAt: serverTimestamp()
      });

      // Notify player
      const room = await getRoom(roomId);
      await createNotification(memberData.userId, {
        type: NOTIFICATION_TYPES.APPROVED,
        fromUserId: currentUser.uid,
        fromUserName: room.slName,
        roomId,
        roomName: room.name,
        characterId: memberData.characterId,
        characterName: memberData.characterName
      });
    } catch (err) {
      console.error('Error approving character:', err);
      throw err;
    }
  };

  // Reject/Request revision (SL)
  const rejectCharacter = async (roomId, memberId, reason, needsRevision = false) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');

    try {
      const memberDoc = await getDoc(doc(db, 'roomMembers', memberId));
      const memberData = memberDoc.data();

      await updateDoc(doc(db, 'roomMembers', memberId), {
        status: needsRevision ? 'needs_revision' : 'rejected',
        rejectionReason: reason,
        reviewedAt: serverTimestamp()
      });

      // Notify player
      const room = await getRoom(roomId);
      await createNotification(memberData.userId, {
        type: needsRevision ? NOTIFICATION_TYPES.NEEDS_REVISION : NOTIFICATION_TYPES.REJECTED,
        fromUserId: currentUser.uid,
        fromUserName: room.slName,
        roomId,
        roomName: room.name,
        characterId: memberData.characterId,
        characterName: memberData.characterName,
        message: reason
      });
    } catch (err) {
      console.error('Error rejecting character:', err);
      throw err;
    }
  };

  // Join without character (create later)
  const joinWithoutCharacter = async (roomId) => {
    if (!currentUser || !userProfile) throw new Error('Nicht eingeloggt');

    try {
      const room = await getRoom(roomId);
      if (!room) throw new Error('Runde nicht gefunden');

      // Check if already a member
      const existingQuery = query(
        collection(db, 'roomMembers'),
        where('roomId', '==', roomId),
        where('userId', '==', currentUser.uid)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error('Du bist bereits Mitglied dieser Runde');
      }

      // Create membership without character
      await addDoc(collection(db, 'roomMembers'), {
        roomId,
        userId: currentUser.uid,
        userName: userProfile.displayName,
        playerCode: userProfile.playerCode,
        characterId: null,
        characterName: null,
        joinMethod: 'requested',
        status: 'joined_no_char', // New status: joined but no character yet
        createdAt: serverTimestamp()
      });

      await fetchRooms();
      return { success: true };
    } catch (err) {
      console.error('Error joining without character:', err);
      throw err;
    }
  };

  // Update room settings (SL only)
  const updateRoomSettings = async (roomId, newSettings) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');

    try {
      const room = await getRoom(roomId);
      if (!room) throw new Error('Runde nicht gefunden');
      if (room.slUserId !== currentUser.uid) throw new Error('Nur der SL kann Einstellungen ändern');

      await updateDoc(doc(db, 'gameRooms', roomId), {
        settings: {
          ...room.settings,
          ...newSettings
        }
      });

      await fetchRooms();
    } catch (err) {
      console.error('Error updating room settings:', err);
      throw err;
    }
  };

  // Submit character for room (when joined without character)
  const submitCharacterForRoom = async (roomId, characterId, characterName) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');

    try {
      // Find existing membership
      const memberQuery = query(
        collection(db, 'roomMembers'),
        where('roomId', '==', roomId),
        where('userId', '==', currentUser.uid)
      );
      const memberSnapshot = await getDocs(memberQuery);

      if (memberSnapshot.empty) {
        throw new Error('Du bist kein Mitglied dieser Runde');
      }

      const memberDoc = memberSnapshot.docs[0];

      // Update with character and set to pending
      await updateDoc(doc(db, 'roomMembers', memberDoc.id), {
        characterId,
        characterName,
        status: 'pending',
        submittedAt: serverTimestamp()
      });

      // Notify SL
      const room = await getRoom(roomId);
      await createNotification(room.slUserId, {
        type: NOTIFICATION_TYPES.JOIN_REQUEST,
        fromUserId: currentUser.uid,
        fromUserName: memberDoc.data().userName,
        roomId,
        roomName: room.name,
        characterId,
        characterName
      });

      await fetchRooms();
    } catch (err) {
      console.error('Error submitting character:', err);
      throw err;
    }
  };

  // Delete room (SL only)
  const deleteRoom = async (roomId) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');

    try {
      const room = await getRoom(roomId);
      if (room.slUserId !== currentUser.uid) {
        throw new Error('Nur der SL kann die Runde löschen');
      }

      // Delete all members
      const membersQuery = query(
        collection(db, 'roomMembers'),
        where('roomId', '==', roomId)
      );
      const membersSnapshot = await getDocs(membersQuery);
      
      const batch = writeBatch(db);
      membersSnapshot.docs.forEach(memberDoc => {
        batch.delete(memberDoc.ref);
      });
      batch.delete(doc(db, 'gameRooms', roomId));
      
      await batch.commit();
      await fetchRooms();
    } catch (err) {
      console.error('Error deleting room:', err);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  return {
    myRooms,
    joinedRooms,
    loading,
    error,
    fetchRooms,
    createRoom,
    getRoom,
    getRoomByCode,
    getRoomMembers,
    requestToJoin,
    joinWithoutCharacter,
    submitCharacterForRoom,
    invitePlayer,
    acceptInvitation,
    declineInvitation,
    approveCharacter,
    rejectCharacter,
    updateRoomSettings,
    deleteRoom
  };
}
