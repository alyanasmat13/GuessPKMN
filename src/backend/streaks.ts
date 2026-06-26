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
    // Clamp to a safe, non-negative integer so the write conforms to the
    // Firestore security rules (see firestore.rules) and never gets rejected.
    const safeValue = Math.max(0, Math.min(1_000_000, Math.floor(Number(value) || 0)))
    const d = doc(db, 'users', uid)
    await setDoc(d, { highestStreak: safeValue }, { merge: true })
  } catch (e) {
    console.error('Error setting highest streak', e)
  }
}
