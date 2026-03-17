import { useState, useEffect } from 'react';
import { auth } from '../backend/firebase'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { getHighestStreak, setHighestStreak } from '../backend/streaks'
import  { getCurrentStreak, subscribeStreak }  from './Header'

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
        // subscribe to live streak updates from Header module
        const unsub = subscribeStreak((s) => setCurrentStreak(s));
        // also initialize
        setCurrentStreak(getCurrentStreak());
        return () => unsub();
    }, [])
    

    return (
        <div className="flex items-center gap-4 text-2xl">
			<h1 className='bg-gray-700 inset-shadow-lg inset-shadow-black p-3 rounded-lg text-center pt-2.25'>
				Highest Streak: {highest}
			</h1>
		</div>
    )
}

export default HeaderLogin;