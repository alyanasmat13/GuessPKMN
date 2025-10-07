import { useState, useEffect, useRef } from 'react';

let externalResetTimer: (() => void) | null = null;
let pendingReset = false;

export function resetTimer() {
	if (externalResetTimer) {
		externalResetTimer();
	} else {
		pendingReset = true;
	}
}

const Timer = () => {

    const [sec, setSec] = useState(0);
    const [hundredths, setHundredths] = useState(0);
    const hundredthsRef = useRef<number>(hundredths);

    useEffect(() => {
        if (pendingReset) {
            setSec(0);
            setHundredths(0);
            hundredthsRef.current = 0;
            pendingReset = false;
        }
        externalResetTimer = () => {
            setSec(0);
            setHundredths(0);
            hundredthsRef.current = 0;
            pendingReset = false;
        };

        const id = window.setInterval(() => {
            const next = hundredthsRef.current + 1;
            if (next >= 100) {
                hundredthsRef.current = 0;
                setHundredths(0);
                setSec(s => s + 1);
            } else {
                hundredthsRef.current = next;
                setHundredths(next);
            }
        }, 10);

        return () => {
            window.clearInterval(id);
            externalResetTimer = null;
        };
    }, []);

  return (
    <div className="text-4xl -m-12">
        <span className='bg-gray-700 inset-shadow-lg inset-shadow-black p-3 rounded-lg text-center pt-2.25'>
            {sec}.{hundredths.toString().padStart(2, '0')}s
        </span>
    </div>
  );
};

export default Timer
