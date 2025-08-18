import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

const ProfileContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 15px;
  border: 1px solid rgba(255, 255, 255, 0.2);
`;

const Avatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid #9146ff;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: white;
`;

const UserStatus = styled.span`
  font-size: 12px;
  color: #00f5ff;
`;

function UserProfile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <ProfileContainer
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
    >
      <Avatar 
        src={user.profile_image_url} 
        alt={user.display_name}
        onError={(e) => {
          e.target.src = 'https://static-cdn.jtvnw.net/user-default-pictures-uv/cdd517fe-def4-11e9-948e-784f43822e80-profile_image-70x70.png';
        }}
      />
      <UserInfo>
        <UserName>{user.display_name}</UserName>
        <UserStatus>🟢 Online</UserStatus>
      </UserInfo>
    </ProfileContainer>
  );
}

export default UserProfile;
