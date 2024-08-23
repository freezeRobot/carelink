import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


export const saveRole = async (uid, role) => {
  try {
    const firestore = getFirestore();

    // Stored in Firestore
    await setDoc(doc(firestore, `users/${uid}`), {
      uid,
      role,
    });

    console.log(`Role ${role} saved for UID: ${uid}`); //test anchor
    await AsyncStorage.setItem('role', role);//AsyncStorage
    await AsyncStorage.setItem('uid', uid); 
  } catch (error) {
    console.error('Error saving role to Firestore:', error);//test anchor
  }
};

export const getRole = async (uid) => {
  try {
    const firestore = getFirestore();

    let role = await AsyncStorage.getItem('role');
    if (role) {
      console.log(`Role ${role} retrieved from local storage for UID: ${uid}`); //test anchor
      return role;
    }

    const roleDoc = await getDoc(doc(firestore, `users/${uid}`));
    if (roleDoc.exists()) {
      role = roleDoc.data().role;
      console.log(`Role ${role} retrieved from Firestore for UID: ${uid}`); //test anchor
      await AsyncStorage.setItem('role', role); 
      await AsyncStorage.setItem('uid', uid); 
      return role;
    } else {
      console.log(`No role found in Firestore for UID: ${uid}`);//test anchor
    }

    return null;
  } catch (error) {
    console.error('Error getting role from Firestore:', error);//test anchor
    return null;
  }
};
