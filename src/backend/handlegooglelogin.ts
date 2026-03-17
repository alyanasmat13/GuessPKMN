import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "./firebase";
import { getHighestStreak, setHighestStreak } from "./streaks";

export const handleGoogleLogin = async () => {
    if (!auth) {
        console.error("Firebase auth is not initialized.");
        return;
    }
    try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("User signed in:", user);

        // Check if they already have a record, if not create one
        const currentHighest = await getHighestStreak(user.uid);
        if (currentHighest === 0) {
            await setHighestStreak(user.uid, 0);
        }

    } catch (error) {
        console.error("Error during Google login:", error);
    }
};

export const handleGoogleLogout = async () => {
    if (!auth) {
        console.error("Firebase auth is not initialized.");
        return;
    }
    try {
        await signOut(auth);
        console.log("User signed out");
    } catch (error) {
        console.error("Error signing out:", error);
    }
};