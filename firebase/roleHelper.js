import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 存储身份信息
export const saveRole = async (uid, role) => {
  try {
    const firestore = getFirestore();

    // 存储在 Firestore
    await setDoc(doc(firestore, `users/${uid}`), {
      uid,
      role,
    });

    console.log(`Role ${role} saved for UID: ${uid}`); // 日志记录

    // 存储在本地
    await AsyncStorage.setItem('role', role);
    await AsyncStorage.setItem('uid', uid); // 存储 UID
  } catch (error) {
    console.error('Error saving role to Firestore:', error);
  }
};

// 获取身份信息
export const getRole = async (uid) => {
  try {
    const firestore = getFirestore();

    // 从本地存储获取
    let role = await AsyncStorage.getItem('role');
    if (role) {
      console.log(`Role ${role} retrieved from local storage for UID: ${uid}`); // 日志记录
      return role;
    }

    // 从 Firestore 获取
    const roleDoc = await getDoc(doc(firestore, `users/${uid}`));
    if (roleDoc.exists()) {
      role = roleDoc.data().role;
      console.log(`Role ${role} retrieved from Firestore for UID: ${uid}`); // 日志记录
      await AsyncStorage.setItem('role', role); // 更新本地存储
      await AsyncStorage.setItem('uid', uid); // 更新本地存储 UID
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
