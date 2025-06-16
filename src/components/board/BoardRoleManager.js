import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import BoardCard from './shared/BoardCard';
import NotificationModal from '../modals/NotificationModal';
import './shared/BoardTools.css';

// Import the existing queries and mutations
import { LIST_USERS_IN_GROUP } from '../../queries/userQueries';
import { ADD_USER_TO_GROUP } from '../../queries/userMutations';

const UserManagement = ({ userGroups = [] }) => {
  const [selectedGroup, setSelectedGroup] = useState('BOARD');
  const [userId, setUserId] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Define GraphQL operations using Apollo hooks
  const [listUsersInGroup, { loading: queryLoading, data }] = useLazyQuery(LIST_USERS_IN_GROUP, {
    fetchPolicy: 'network-only'
  });
  
  const [addUserToGroup, { loading: mutationLoading }] = useMutation(ADD_USER_TO_GROUP, {
    onCompleted: (data) => {
      setNotificationMessage(data.addUserToGroup.message);
      setShowNotification(true);
      setUserId('');
      fetchUsers(); // Refresh the user list
    },
    onError: (error) => {
      setNotificationMessage(`Failed to add user to group: ${error.message}`);
      setShowNotification(true);
    }
  });

  const groups = ['BOARD', 'OWNERS', 'RESIDENTS'];
  const loading = queryLoading || mutationLoading;
  const users = data?.listUsersInGroup || [];

  const fetchUsers = () => {
    listUsersInGroup({
      variables: { groupName: selectedGroup }
    });
  };

  const handleGroupChange = (e) => {
    const newGroup = e.target.value;
    setSelectedGroup(newGroup);
    listUsersInGroup({
      variables: { groupName: newGroup }
    });
  };
  
  const handleAddUserToGroup = () => {
    if (!userId) {
      setNotificationMessage('Please enter a user ID');
      setShowNotification(true);
      return;
    }
    
    addUserToGroup({
      variables: { 
        userId: userId,
        groupName: selectedGroup
      }
    });
  };

  // Initial fetch on component mount
  React.useEffect(() => {
    fetchUsers();
  }, []);
  
  return (
    <>
      <div className="board-tool">
        <h2 className="section-title">User Group Management</h2>
        
        <div className="search-controls">
          <select
            value={selectedGroup}
            onChange={handleGroupChange}
            className="search-type"
          >
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
          
          <input
            type="text"
            placeholder="Enter user ID to add to group"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleAddUserToGroup();
              }
            }}
            className="search-input"
          />
          
          <button 
            onClick={handleAddUserToGroup} 
            disabled={loading || !userId}
          >
            {loading ? 'Adding...' : `Add to ${selectedGroup}`}
          </button>
        </div>

        <div className="results-grid">
          {loading ? (
            <div>Loading users...</div>
          ) : users.length > 0 ? (
            users.map(user => (
              <BoardCard
                key={user.username}
                header={
                  <div className="person-header">
                    <h3>{user.email || user.username}</h3>
                  </div>
                }
                content={
                  <>
                    <div>Cognito ID: {user.username}</div>
                    <div>Email: {user.email}</div>
                    <div>Status: {user.userStatus}</div>
                    <div>Enabled: {user.enabled ? 'Yes' : 'No'}</div>
                  </>
                }
              />
            ))
          ) : (
            <div>No users found in this group</div>
          )}
        </div>
      </div>

      {showNotification && (
        <NotificationModal
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

export default UserManagement;
