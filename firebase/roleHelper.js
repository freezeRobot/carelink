import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';


export const saveRole = async (uid, role) => {
  try {
    const firestore = getFirestore();

    // 存储在 Firestore
    await setDoc(doc(firestore, `users/${uid}`), {
      uid,
      role,
    });

    console.log(`Role ${role} saved for UID: ${uid}`); 
    await AsyncStorage.setItem('role', role);
    await AsyncStorage.setItem('uid', uid); 
  } catch (error) {
    console.error('Error saving role to Firestore:', error);
  }
};

export const getRole = async (uid) => {
  try {
    const firestore = getFirestore();

    let role = await AsyncStorage.getItem('role');
    if (role) {
      console.log(`Role ${role} retrieved from local storage for UID: ${uid}`); // 日志记录
      return role;
    }

    const roleDoc = await getDoc(doc(firestore, `users/${uid}`));
    if (roleDoc.exists()) {
      role = roleDoc.data().role;
      console.log(`Role ${role} retrieved from Firestore for UID: ${uid}`); 
      await AsyncStorage.setItem('role', role); 
      await AsyncStorage.setItem('uid', uid); 
      return role;
    } else {
      console.log(`No role found in Firestore for UID: ${uid}`);
    }

    return null;
  } catch (error) {
    console.error('Error getting role from Firestore:', error);
    return null;
  }
};
