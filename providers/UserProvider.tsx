"use client"

import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { auth } from '@/firebase';
import { userAtom, loadingAtom } from '@/store/userAtoms';

interface UserProviderProps {
      children: React.ReactNode; 
}

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [, setUser] = useAtom(userAtom);
  const [, setLoading] = useAtom(loadingAtom);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoading(true);  // Set loading to true while checking auth state
      if (user) {
        const userData = {
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: user.photoURL || ''
        };
        setUser(userData); // Cache user details
      } else {
        setUser(null); // Clear user details if not logged in
      }
      setLoading(false); // Set loading to false after checking
    });

    return () => unsubscribe(); // Cleanup the subscription
  }, [setUser, setLoading]);

  return <>{children}</>;
};

export default UserProvider;
