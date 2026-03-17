import React, { useState, useEffect } from 'react';

let externalSetStreak: React.Dispatch<React.SetStateAction<number>> | null = null;
let streakValue: number = 0;
const streakListeners: Array<(s: number) => void> = [];

export function updateStreak() {
	streakValue = streakValue + 1;
	if (externalSetStreak) {
		externalSetStreak(streakValue);
	} else {
		console.debug('Streak updated in module; component not mounted yet.');
	}
	for (const l of streakListeners) l(streakValue);
}

export function resetStreak() {
	streakValue = 0;
	if (externalSetStreak) {
		externalSetStreak(0);
	} else {
		console.debug('Streak reset in module; component not mounted yet.');
	}
	for (const l of streakListeners) l(streakValue);
}

export function subscribeStreak(listener: (s: number) => void) {
	streakListeners.push(listener);
	return () => {
		const i = streakListeners.indexOf(listener);
		if (i >= 0) streakListeners.splice(i, 1);
	};
}

let generationValue: string = 'all';
const generationListeners: Array<(g: string) => void> = [];

export function setGeneration(value: string) {
	const v = value ?? 'all';
	generationValue = v;
	for (const l of generationListeners) l(v);
}

export function getGeneration() {
	return generationValue;
}

export function subscribeGeneration(listener: (g: string) => void) {
	generationListeners.push(listener);
	return () => {
		const i = generationListeners.indexOf(listener);
		if (i >= 0) generationListeners.splice(i, 1);
	};
}

export function getGenerationRange(gen?: string): { min: number; max: number } {
	const g = (gen ?? generationValue)?.toString();
	switch (g) {
		case 'one':
		case '1':
			return { min: 1, max: 151 };
		case 'two':
		case '2':
			return { min: 152, max: 251 };
		case 'three':
		case '3':
			return { min: 252, max: 386 };
		case 'four':
		case '4':
			return { min: 387, max: 493 };
		case 'five':
		case '5':
			return { min: 494, max: 649 };
		case 'six':
		case '6':
			return { min: 650, max: 721 };
		case 'seven':
		case '7':
			return { min: 722, max: 809 };
		case 'eight':
		case '8':
			return { min: 810, max: 905 };
		case 'nine':
		case '9':
			return { min: 906, max: 1025 };
		case 'all':
		default:
			return { min: 1, max: 1025 };
	}
}

export function getCurrentStreak() {
	return streakValue;
}

function Header() {
	const [streak, setStreak] = useState<number>(streakValue);
	const [gen, setGen] = useState<string>(generationValue);

	useEffect(() => {
		externalSetStreak = setStreak;
		setStreak(streakValue);
		return () => {
			externalSetStreak = null;
		};
	}, []);

	return (
		<div className="flex items-center gap-4 text-2xl">
			<h1 className='bg-gray-700 inset-shadow-lg inset-shadow-black p-3 rounded-lg text-center pt-2.25'>
				Current Streak: {streak}
			</h1>
			<div className='gap-0'>
				<label className='bg-gray-700 inset-shadow-lg inset-shadow-black p-3 pr-0 rounded-lg rounded-r-none text-center pt-2.25' htmlFor="generation">Gen:</label>
				<select
					id="generation"
					value={gen}
					onChange={(e) => {
						const v = e.target.value;
						setGen(v);
						setGeneration(v);
					}}
					name="generation"
					className='bg-gray-700 inset-shadow-lg inset-shadow-black p-3 rounded-l-none rounded-lg text-center pt-2 pb-[11px]'>
					<option value="all">All</option>
					<option value="one">1</option>
					<option value="two">2</option>
					<option value="three">3</option>
					<option value="four">4</option>
					<option value="five">5</option>
					<option value="six">6</option>
					<option value="seven">7</option>
					<option value="eight">8</option>
					<option value="nine">9</option>
				</select>
			</div>
		</div>
	);
}

export default Header;
