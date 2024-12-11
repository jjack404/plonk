import React, { useContext, useState } from 'react';
import { WalletContext } from '../context/WalletContext';
import { UserProfileProps, WalletContextType } from '../types';
import './UserProfile.css';

const UserProfile: React.FC<UserProfileProps> = ({ walletAddress, profile, onClose }) => {
  const { updateProfile } = useContext<WalletContextType>(WalletContext);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [name, setName] = useState<string>(profile?.name || '');
  const [info, setInfo] = useState<string>(profile?.info || '');
  const [twitterHandle, setTwitterHandle] = useState<string>(profile?.twitterHandle || '');

  const handleEditClick = (): void => {
    setIsEditing(true);
  };

  const handleSaveClick = async (): Promise<void> => {
    const updatedProfile = { name, info, twitterHandle };
    await updateProfile(updatedProfile);
    setIsEditing(false);
  };

  const handleCancelClick = (): void => {
    // Reset form values to original profile values
    setName(profile?.name || '');
    setInfo(profile?.info || '');
    setTwitterHandle(profile?.twitterHandle || '');
    setIsEditing(false);
  };

  const handleImageClick = (): void => {
    if (isEditing) {
      // TODO: Implement image upload functionality
      console.log('Image upload clicked');
    }
  };

  const getAbbreviatedAddress = (address: string | null, length: number): string => {
    return address ? `${address.slice(0, length)}...${address.slice(-4)}` : '';
  };

  const getAvatarText = (address: string | null): string => {
    return address ? address.slice(0, 7) : '';
  };

  return (
    <div className="dashboard-container">
      <div className="header-buttons">
        {walletAddress && (
          <>
            {isEditing ? (
              <>
                <button className="edit-button save" onClick={handleSaveClick}>✔</button>
                <button className="edit-button cancel" onClick={handleCancelClick}>⃠</button>
              </>
            ) : (
              <button className="edit-button edit-pencil" onClick={handleEditClick}>✎</button>
            )}
          </>
        )}
        <button className="close-button" onClick={onClose}>✕</button>
      </div>
      <div className="dashboard">
        <div className="profile-content">
          <div className={`avatar-container ${isEditing ? 'editing' : ''}`} onClick={handleImageClick}>
            <img
              src={profile?.avatar || `https://placehold.co/100x100/020919/fffbbd/webp?text=${getAvatarText(walletAddress)}`}
              alt="Avatar"
            />
            {isEditing && (
              <div className="avatar-upload-overlay">
                upload image
              </div>
            )}
          </div>
          <div className="profile-info-container">
            <span>{getAbbreviatedAddress(walletAddress, 16)}</span>
            {isEditing ? (
              <>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="dashboard-username-input"
                  placeholder="Enter name"
                />
                <input
                  type="text"
                  value={twitterHandle}
                  onChange={(e) => setTwitterHandle(e.target.value)}
                  className="dashboard-username-input"
                  placeholder="Twitter handle (optional)"
                />
                <textarea
                  value={info}
                  onChange={(e) => setInfo(e.target.value)}
                  className="dashboard-info-input"
                  placeholder="Enter bio"
                />
              </>
            ) : (
              <>
                <h2 className="dashboard-username">{profile?.name || 'Anonymous'}</h2>
                <p className="dashboard-info">{profile?.info || 'No bio yet.'}</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;