"use client"
import React from 'react';
import { useAtom } from 'jotai';
import { userAtom, loadingAtom } from '@/store/userAtoms';

const UserProfile: React.FC = () => {
    const [user] = useAtom(userAtom);
    const [loading] = useAtom(loadingAtom);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <div>No user logged in</div>;
    }

    return (
        <div>
            <h1>{user.displayName}</h1>
            <p>{user.email}</p>
            <img src={user.photoURL} alt={user.displayName} />
        </div>
    );
};

export default UserProfile;
