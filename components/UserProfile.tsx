"use client"
import React from 'react';
import { useAtom } from 'jotai';
import { userAtom, loadingAtom } from '@/store/userAtoms';
import Image from 'next/image';

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
            <Image src={user.photoURL} alt={user.displayName} width={100} height={100}/>
        </div>
    );
};

export default UserProfile;
