import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import BoardCard from './shared/BoardCard';
import DeleteConfirmationModal from '../shared/DeleteConfirmationModal';
import NotificationModal from '../modals/NotificationModal';
import './shared/BoardTools.css';

// Import the queries and mutations we'll need to create
import { 
  LIST_USERS_IN_GROUP, 
  GET_USER_BY_EMAIL, 
  GET_USER_BY_NAME,
  GET_USER_BY_ID,
  LIST_GROUPS_FOR_USER
} from '../../queries/userQueries';

import {
  ADD_USER_TO_GROUP,
  REMOVE_USER_FROM_GROUP
} from '../../queries/userMutations';

// Get group names from environment variables
const PRESIDENT_GROUP = process.env.REACT_APP_PRESIDENT_GROUP_NAME || 'PRESIDENT';
const SECRETARY_GROUP = process.env.REACT_APP_SECRETARY_GROUP_NAME || 'SECRETARY';
const TREASURER_GROUP = process.env.REACT_APP_TREASURER_GROUP_NAME || 'TREASURER';
const BOARD_GROUP = process.env.REACT_APP_BOARD_GROUP_NAME || 'BOARD';
const MEDIA_GROUP = process.env.REACT_APP_MEDIA_GROUP_NAME || 'MEDIA';

const BoardRoleManager = ({ userGroups = [] }) => {
  const [searchState, setSearchState] = useState({
    searchType: 'List BOARD',
    searchTerm: '',
    searchResults: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [userGroupsData, setUserGroupsData] = useState([]);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Permission checks
  const isPresident = userGroups && userGroups.includes(PRESIDENT_GROUP);
  const isSecretary = userGroups && userGroups.includes(SECRETARY_GROUP);
  const isTreasurer = userGroups && userGroups.includes(TREASURER_GROUP);
  const isBoard = userGroups && userGroups.includes(BOARD_GROUP);

  // Only President and Secretary can manage roles
  const hasRoleManagementPermission = isPresident || isSecretary;

  // Define GraphQL operations using Apollo hooks
  const [listUsersInGroup] = useLazyQuery(LIST_USERS_IN_GROUP);
  const [getUserByEmail] = useLazyQuery(GET_USER_BY_EMAIL);
  const [getUserByName] = useLazyQuery(GET_USER_BY_NAME);
  const [getUserById] = useLazyQuery(GET_USER_BY_ID);
  const [listGroupsForUser] = useLazyQuery(LIST_GROUPS_FOR_USER);
  
  const [addUserToGroup] = useMutation(ADD_USER_TO_GROUP);
  const [removeUserFromGroup] = useMutation(REMOVE_USER_FROM_GROUP);

  const searchOptions = [
    'List BOARD',
    'List PRESIDENT',
    'List SECRETARY',
    'List TREASURER',
    'List MEDIA',
    'Search by Email',
    'Search by Name',
    'Search by Cognito ID'
  ];

  const handleSearch = async () => {
    setLoading(true);
    setErrors({});
    setSelectedUser(null);
    setUserGroupsData([]);

    try {
      if (searchState.searchType.startsWith('List ')) {
        // Extract group name from the search type
        const groupName = searchState.searchType.replace('List ', '');
        const response = await listUsersInGroup({
          variables: { groupName }
        });
        
        setSearchState(prev => ({
          ...prev,
          searchResults: response.data?.listUsersInGroup?.users || []
        }));
      } else {
        // Handle individual user search
        if (!searchState.searchTerm) {
          setErrors({ search: 'Search value is required' });
          setLoading(false);
          return;
        }

        let response;
        
        if (searchState.searchType === 'Search by Email') {
          response = await getUserByEmail({
            variables: { email: searchState.searchTerm }
          });
          
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.getUserByEmail?.user ? [response.data.getUserByEmail.user] : []
          }));
        } else if (searchState.searchType === 'Search by Name') {
          response = await getUserByName({
            variables: { name: searchState.searchTerm }
          });
          
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.getUserByName?.users || []
          }));
        } else if (searchState.searchType === 'Search by Cognito ID') {
          response = await getUserById({
            variables: { id: searchState.searchTerm }
          });
          
          setSearchState(prev => ({
            ...prev,
            searchResults: response.data?.getUserById?.user ? [response.data.getUserById.user] : []
          }));
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      setErrors({ search: 'Error performing search: ' + (error.message || 'Unknown error') });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserGroups = async (username) => {
    try {
      const response = await listGroupsForUser({
        variables: { username }
      });
      
      setUserGroupsData(response.data?.listGroupsForUser?.groups || []);
      setSelectedUser(username);
    } catch (error) {
      console.error('Error fetching user groups:', error);
      setNotificationMessage('Error fetching user groups: ' + (error.message || 'Unknown error'));
      setShowNotification(true);
    }
  };

  const handleAddToGroup = async (username, groupName) => {
    if (!hasRoleManagementPermission) {
      setNotificationMessage("You don't have permission to manage user roles");
      setShowNotification(true);
      return;
    }

    try {
      await addUserToGroup({
        variables: { username, groupName }
      });
      
      // Refresh user's groups
      await fetchUserGroups(username);
      setNotificationMessage(`User successfully added to ${groupName} group`);
      setShowNotification(true);
    } catch (error) {
      console.error('Error adding user to group:', error);
      setNotificationMessage('Error adding user to group: ' + (error.message || 'Unknown error'));
      setShowNotification(true);
    }
  };

  const confirmRemoveFromGroup = (username, groupName) => {
    if (!hasRoleManagementPermission) {
      setNotificationMessage("You don't have permission to manage user roles");
      setShowNotification(true);
      return;
    }

    setConfirmAction(() => () => handleRemoveFromGroup(username, groupName));
    setShowConfirmModal(true);
  };

  const handleRemoveFromGroup = async (username, groupName) => {
    try {
      await removeUserFromGroup({
        variables: { username, groupName }
      });
      
      // Refresh user's groups
      await fetchUserGroups(username);
      setNotificationMessage(`User successfully removed from ${groupName} group`);
      setShowNotification(true);
    } catch (error) {
      console.error('Error removing user from group:', error);
      setNotificationMessage('Error removing user from group: ' + (error.message || 'Unknown error'));
      setShowNotification(true);
    }
  };

  const getUserAttribute = (user, attributeName) => {
    if (!user || !user.attributes) return 'N/A';
    return user.attributes[attributeName] || 'N/A';
  };

  const isUserInGroup = (groupName) => {
    return userGroupsData.some(group => group.groupName === groupName);
  };

  return (
    <>
      <div className="board-tool">
        <h2 className="section-title">User Role Management</h2>
        <div className="search-controls">
          <select
            value={searchState.searchType}
            onChange={(e) => setSearchState({
              ...searchState,
              searchType: e.target.value,
              searchTerm: e.target.value.startsWith('List ') ? '' : searchState.searchTerm
            })}
            className="search-type"
          >
            {searchOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder={searchState.searchType.startsWith('List ') ? 'Not required for group listing' : 'Enter search term'}
            value={searchState.searchTerm}
            onChange={(e) => setSearchState({
              ...searchState,
              searchTerm: e.target.value
            })}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            className="search-input"
            disabled={searchState.searchType.startsWith('List ')}
          />
          <button onClick={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {errors.search && <div className="error-message">{errors.search}</div>}

        <div className="results-grid">
          {searchState.searchResults.map(user => (
            <BoardCard
              key={user.username}
              header={
                <div className="person-header">
                  <h3>{getUserAttribute(user, 'name') || user.username}</h3>
                </div>
              }
              content={
                <>
                  <div>Cognito ID: {user.username}</div>
                  <div>Email: {getUserAttribute(user, 'email')}</div>
                  <div>Phone: {getUserAttribute(user, 'phone_number')}</div>
                  
                  {selectedUser === user.username && (
                    <div className="user-groups">
                      <h4>Group Membership:</h4>
                      {userGroupsData.length === 0 ? (
                        <p>Not a member of any groups</p>
                      ) : (
                        <ul className="group-list">
                          {userGroupsData.map(group => (
                            <li key={group.groupName} className="group-item">
                              {group.groupName}
                              {hasRoleManagementPermission && (
                                <button 
                                  className="remove-button"
                                  onClick={() => confirmRemoveFromGroup(user.username, group.groupName)}
                                >
                                  Remove
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      {hasRoleManagementPermission && (
                        <div className="add-to-group">
                          <h4>Add to Group:</h4>
                          <div className="group-actions">
                            {!isUserInGroup(BOARD_GROUP) && (
                              <button onClick={() => handleAddToGroup(user.username, BOARD_GROUP)}>
                                Add to BOARD
                              </button>
                            )}
                            {!isUserInGroup(PRESIDENT_GROUP) && (
                              <button onClick={() => handleAddToGroup(user.username, PRESIDENT_GROUP)}>
                                Add to PRESIDENT
                              </button>
                            )}
                            {!isUserInGroup(SECRETARY_GROUP) && (
                              <button onClick={() => handleAddToGroup(user.username, SECRETARY_GROUP)}>
                                Add to SECRETARY
                              </button>
                            )}
                            {!isUserInGroup(TREASURER_GROUP) && (
                              <button onClick={() => handleAddToGroup(user.username, TREASURER_GROUP)}>
                                Add to TREASURER
                              </button>
                            )}
                            {!isUserInGroup(MEDIA_GROUP) && (
                              <button onClick={() => handleAddToGroup(user.username, MEDIA_GROUP)}>
                                Add to MEDIA
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              }
              actions={
                <>
                  {selectedUser !== user.username ? (
                    <button onClick={() => fetchUserGroups(user.username)}>
                      View Groups
                    </button>
                  ) : (
                    <button onClick={() => setSelectedUser(null)}>
                      Hide Groups
                    </button>
                  )}
                </>
              }
            />
          ))}
        </div>
      </div>

      {showConfirmModal && (
        <DeleteConfirmationModal
          show={showConfirmModal}
          objectId="this user from the group"
          onConfirm={() => {
            confirmAction();
            setShowConfirmModal(false);
          }}
          onClose={() => setShowConfirmModal(false)}
        />
      )}

      {showNotification && (
        <NotificationModal
          message={notificationMessage}
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
};

export default BoardRoleManager;
