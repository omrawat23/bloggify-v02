
import { atom } from 'jotai';

interface User {
    displayName: string;
    email: string;
    photoURL: string;
}

export const userAtom = atom<User | null>(null);
export const loadingAtom = atom(true);