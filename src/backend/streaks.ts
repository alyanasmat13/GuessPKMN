import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'

export async function getHighestStreak(uid: string): Promise<number> {
  try {
    const d = doc(db, 'users', uid)
    const snap = await getDoc(d)
    if (!snap.exists()) return 0
    const data = snap.data()
    return (data?.highestStreak as number) ?? 0
  } catch (e) {
    console.error('Error fetching highest streak', e)
    return 0
  }
}

export async function setHighestStreak(uid: string, value: number): Promise<void> {
  try {
    const d = doc(db, 'users', uid)
    await setDoc(d, { highestStreak: value }, { merge: true })
  } catch (e) {
    console.error('Error setting highest streak', e)
  }
}
