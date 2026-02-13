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
        where('userId', '==', currentUser.uid)
      );

      const querySnapshot = await getDocs(q);
      const chars = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort client-side
      chars.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });

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
      await fetchCharacters();

      return { id: docRef.id, ...newCharacter };
    } catch (err) {
      console.error('Error creating character:', err);
      throw err;
    }
  };

  // ============================================
  // UPDATE CHARACTER - FIXED VERSION!
  // Das alte Problem: portraitURL wurde IMMER gesetzt,
  // auch wenn es undefined war (was Firestore hasst)
  // ============================================
  const updateCharacter = async (characterId, updates, newPortraitFile = null) => {
    try {
      const docRef = doc(db, 'characters', characterId);
      
      // Build update object - NEVER include undefined values!
      const updateData = {
        updatedAt: serverTimestamp()
      };

      // Handle portrait separately
      if (newPortraitFile) {
        // New file uploaded - get URL
        updateData.portraitURL = await uploadPortrait(newPortraitFile, updates.name || 'character');
      } else if (updates.hasOwnProperty('portraitURL') && updates.portraitURL !== undefined) {
        // Explicitly set (could be null to remove, or a string URL)
        updateData.portraitURL = updates.portraitURL;
      }
      // If neither condition met, DON'T touch portraitURL at all!

      // Add all other fields from updates, filtering out undefined
      Object.entries(updates).forEach(([key, value]) => {
        // Skip portraitURL (handled above) and undefined values
        if (key !== 'portraitURL' && value !== undefined) {
          updateData[key] = value;
        }
      });

      await updateDoc(docRef, updateData);
      await fetchCharacters();
    } catch (err) {
      console.error('Error updating character:', err);
      throw err;
    }
  };

  // Delete character
  const deleteCharacter = async (characterId) => {
    try {
      const character = await getCharacter(characterId);

      // Delete portrait from storage if exists
      if (character.portraitURL && character.portraitURL.includes('firebase')) {
        try {
          const url = new URL(character.portraitURL);
          const path = decodeURIComponent(url.pathname.split('/o/')[1]?.split('?')[0] || '');
          if (path) {
            const portraitRef = ref(storage, path);
            await deleteObject(portraitRef);
          }
        } catch (err) {
          console.log('Portrait deletion skipped:', err.message);
        }
      }

      await deleteDoc(doc(db, 'characters', characterId));
      await fetchCharacters();
    } catch (err) {
      console.error('Error deleting character:', err);
      throw err;
    }
  };

  // Create new character V2 (with full background system)
  const createCharacterV2 = async (characterData, portraitFile) => {
    if (!currentUser) throw new Error('Nicht eingeloggt');

    try {
      let portraitURL = null;

      if (portraitFile) {
        portraitURL = await uploadPortrait(portraitFile, characterData.name);
      }

      const newCharacter = {
        userId: currentUser.uid,
        version: 2,
        name: characterData.name,
        alias: characterData.alias || '',
        portraitURL: portraitURL,
        backgrounds: characterData.backgrounds || {},
        alignment: characterData.alignment || { moral: 0, order: 0, focus: 0 },
        backstory: characterData.backstory || '',
        avatar: characterData.avatar || null,
        cosmetics: characterData.cosmetics || {
          title: 'none',
          customTitle: '',
          hairColor: 'brown',
          eyeColor: 'brown',
          skinFeatures: [],
          distinctiveFeatures: [],
          notes: ''
        },
        physical: characterData.physical || {},
        attributes: characterData.attributes || {},
        vitals: characterData.vitals || {},
        skills: characterData.skills || {},
        resources: { ausdauerakt: 1, fokus: 1, inbrunst: 1, glueck: 1 },
        experience: characterData.experience || {
          total: 0, spent: 0, available: 0, modifier: 1.0
        },
        wounds: [],
        buffs: [],
        debuffs: [],
        equipment: { slots: {} },
        inventory: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'characters'), newCharacter);
      await fetchCharacters();
      return { id: docRef.id, ...newCharacter };
    } catch (err) {
      console.error('Error creating character:', err);
      throw err;
    }
  };

  // Award EP to character
  const awardExperience = async (characterId, amount) => {
    try {
      const character = await getCharacter(characterId);
      const expMod = character.experience?.modifier || 1.0;
      const actualAmount = Math.round(amount * expMod);

      const newExp = {
        total: (character.experience?.total || 0) + actualAmount,
        available: (character.experience?.available || 0) + actualAmount,
        spent: character.experience?.spent || 0,
        modifier: expMod
      };

      await updateDoc(doc(db, 'characters', characterId), {
        experience: newExp,
        updatedAt: serverTimestamp()
      });

      await fetchCharacters();
      return { awarded: actualAmount, newTotal: newExp.total };
    } catch (err) {
      console.error('Error awarding experience:', err);
      throw err;
    }
  };

  // Spend EP on skill
  const spendExperience = async (characterId, skillKey, cost) => {
    try {
      const character = await getCharacter(characterId);
      const available = character.experience?.available || 0;

      if (cost > available) {
        throw new Error('Nicht genug EP verfügbar');
      }

      const currentSkillLevel = character.skills?.[skillKey] || 0;
      const newSkills = { ...character.skills, [skillKey]: currentSkillLevel + 1 };
      const newExp = {
        ...character.experience,
        available: available - cost,
        spent: (character.experience?.spent || 0) + cost
      };

      await updateDoc(doc(db, 'characters', characterId), {
        skills: newSkills,
        experience: newExp,
        updatedAt: serverTimestamp()
      });

      await fetchCharacters();
      return { newLevel: currentSkillLevel + 1, remainingEP: newExp.available };
    } catch (err) {
      console.error('Error spending experience:', err);
      throw err;
    }
  };

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
    createCharacterV2,
    updateCharacter,
    deleteCharacter,
    awardExperience,
    spendExperience
  };
}
