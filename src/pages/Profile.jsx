import React, { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged, updateProfile } from 'firebase/auth';
import axios from 'axios';
import Navbar from '../components/NavbarIn';

const Profile = () => {
    const [displayName, setDisplayName] = useState('');
    const [newDisplayName, setNewDisplayName] = useState('');
    const [profilePic, setProfilePic] = useState(null);
    const [message, setMessage] = useState('');
    const auth = getAuth();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setDisplayName(user.displayName || 'No display name set');
                setProfilePic(user.photoURL || '');
            } else {
                setDisplayName('No user signed in');
            }
        });

        return () => unsubscribe();
    }, [auth]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (auth.currentUser) {
            try {
                let photoURL = profilePic;
                if (profilePic && typeof profilePic !== 'string') {
                    const formData = new FormData();
                    formData.append('file', profilePic);
                    formData.append('upload_preset', 'ml_default'); // Replace with your upload preset
                    const cloudinaryResponse = await axios.post(
                        'https://api.cloudinary.com/v1_1/dn5t68vyk/image/upload', // Replace with your Cloudinary cloud name
                        formData
                    );
                    photoURL = cloudinaryResponse.data.secure_url;
                }

                await updateProfile(auth.currentUser, {
                    displayName: newDisplayName || displayName,
                    photoURL,
                });

                setDisplayName(newDisplayName || displayName);
                setMessage('Profile updated successfully.');
            } catch (error) {
                setMessage(`Error updating profile: ${error.message}`);
            }
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setProfilePic(e.target.files[0]);
        }
    };

    return (
        <>
            <Navbar />
            <div className="mt-72 max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>

                {/* Username Display */}
                <div className="text-center mb-4">
                    <p className="text-lg font-semibold">Username:</p>
                    <p className="text-gray-700">{displayName}</p>
                </div>

                <div className="mb-4 text-center">
                    <img
                        src={profilePic || 'https://cdn.vectorstock.com/i/500p/54/69/male-user-icon-vector-8865469.jpg'}
                        alt="Profile"
                        className="w-32 h-32 rounded-full mx-auto object-cover"
                    />
                </div>

                <form onSubmit={handleUpdateProfile}>
                    <div className="mb-4">
                        <label htmlFor="newDisplayName" className="block text-sm font-medium text-gray-700">
                            Update Display Name
                        </label>
                        <input
                            type="text"
                            id="newDisplayName"
                            value={newDisplayName}
                            onChange={(e) => setNewDisplayName(e.target.value)}
                            placeholder="Enter new display name"
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="profilePic" className="block text-sm font-medium text-gray-700">
                            Profile Picture
                        </label>
                        <input
                            type="file"
                            id="profilePic"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="mt-1 block w-full text-sm text-gray-500
              file:mr-4 file:py-2
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Update Profile
                    </button>
                </form>
                {message && (
                    <p className="mt-4 text-center text-green-500">{message}</p>
                )}
            </div>
        </>
    );
};

export default Profile;
