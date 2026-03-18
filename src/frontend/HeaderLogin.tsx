import { useState, useEffect } from 'react';
import { auth } from '../backend/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getHighestStreak, setHighestStreak } from '../backend/streaks'
import { getCurrentStreak, subscribeStreak } from './Header'

const HeaderLogin = () => {

    const [highest, setHighest] = useState<number>(0);
    const [currentStreak, setCurrentStreak] = useState<number>(getCurrentStreak());
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            setUser(u)
            if (u) {
                const h = await getHighestStreak(u.uid)
                setHighest(h)
            } else {
                setHighest(0)
            }
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        if (user && currentStreak > highest) {
            setHighestStreak(user.uid, currentStreak)
            setHighest(currentStreak)
        }
    }, [currentStreak, user, highest])

    useEffect(() => {
        const unsub = subscribeStreak((s) => setCurrentStreak(s));
        setCurrentStreak(getCurrentStreak());
        return () => unsub();
    }, [])


    return (
        <div className="stat-pill">
            <span className="text-white/40 text-sm uppercase tracking-widest">Best</span>
            <span className="text-white font-bold">{highest}</span>
        </div>
    )
}

export default HeaderLogin;