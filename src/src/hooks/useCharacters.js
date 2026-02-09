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
  orderBy,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

export function useCharacters() {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useAuth();

  // Fetch all characters for current user
  const fetchCharacters = useCallback(async () => {
    if (!currentUser) {
      setCharacters([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const q = query(
        collection(db, 'characters'),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const chars = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCharacters(chars);
      setError(null);
    } catch (err) {
      console.error('Error fetching characters:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Get single character by ID
  const getCharacter = async (characterId) => {
    try {
      const docRef = doc(db, 'characters', characterId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        throw new Error('Character nicht gefunden');
      }
    } catch (err) {
      console.error('Error fetching character:', err);
      throw err;
    }
  };

  // Upload portrait to Firebase Storage
  const uploadPortrait = async (file, characterName) => {
    if (!file || !currentUser) return null;
    
    try {
      const timestamp = Date.now();
      const safeName = characterName.replace(/[^a-zA-Z0-9]/g, '_');
      const storageRef = ref(storage, `portraits/${currentUser.uid}/${safeName}_${timestamp}`);
      
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    } catch (err) {
      console.error('Error uploading portrait:', err);
      throw err;
    }
  };

  // Create new character
  const createCharacter = async (characterData, portraitFile) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');
    
    try {
      let portraitURL = null;
      
      if (portraitFile) {
        portraitURL = await uploadPortrait(portraitFile, characterData.name);
      }
      
      const newCharacter = {
        userId: currentUser.uid,
        name: characterData.name,
        portraitURL: portraitURL,
        attributes: characterData.attributes || {
          strength: 10,
          dexterity: 10,
          intelligence: 10,
          constitution: 10,
          wisdom: 10,
          charisma: 10
        },
        skills: characterData.skills || {
          combat: 0,
          magic: 0,
          social: 0,
          crafting: 0
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'characters'), newCharacter);
      
      // Refresh character list
      await fetchCharacters();
      
      return { id: docRef.id, ...newCharacter };
    } catch (err) {
      console.error('Error creating character:', err);
      throw err;
    }
  };

  // Update existing character
  const updateCharacter = async (characterId, updates, newPortraitFile = null) => {
    try {
      let portraitURL = updates.portraitURL;
      
      if (newPortraitFile) {
        portraitURL = await uploadPortrait(newPortraitFile, updates.name || 'character');
      }
      
      const docRef = doc(db, 'characters', characterId);
      await updateDoc(docRef, {
        ...updates,
        portraitURL: portraitURL,
        updatedAt: serverTimestamp()
      });
      
      await fetchCharacters();
    } catch (err) {
      console.error('Error updating character:', err);
      throw err;
    }
  };

  // Delete character
  const deleteCharacter = async (characterId) => {
    try {
      // Get character first to check for portrait
      const character = await getCharacter(characterId);
      
      // Delete portrait from storage if exists
      if (character.portraitURL) {
        try {
          const portraitRef = ref(storage, character.portraitURL);
          await deleteObject(portraitRef);
        } catch (err) {
          // Portrait might not exist, continue with deletion
          console.log('Portrait deletion skipped:', err.message);
        }
      }
      
      // Delete character document
      await deleteDoc(doc(db, 'characters', characterId));
      
      // Refresh character list
      await fetchCharacters();
    } catch (err) {
      console.error('Error deleting character:', err);
      throw err;
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCharacters();
  }, [fetchCharacters]);

  return {
    characters,
    loading,
    error,
    fetchCharacters,
    getCharacter,
    createCharacter,
    updateCharacter,
    deleteCharacter
  };
}
