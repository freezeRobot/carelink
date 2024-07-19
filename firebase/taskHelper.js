import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

export const createTask = async (uid, taskName, taskType, taskDescription, targetTime) => {
  const firestore = getFirestore();
  const today = new Date();
  const timestamp = today.toISOString().split('T')[0];

  const tasksRef = collection(firestore, 'tasks');
  const q = query(tasksRef, where('uid', '==', uid), where('date', '==', timestamp));
  const querySnapshot = await getDocs(q);
  const taskId = querySnapshot.size + 1;

  await addDoc(tasksRef, {
    uid,
    date: timestamp,
    taskId,
    taskName,
    taskType,
    taskDescription,
    targetTime,
    createdAt: new Date(),
  });
};
