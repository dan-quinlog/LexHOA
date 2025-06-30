import React, { useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import BoardCard from './shared/BoardCard';
import NotificationModal from '../modals/NotificationModal';
import { copyWithFeedback } from '../../utils/clipboardUtils';
import './shared/BoardTools.css';

// Import the existing queries and mutations
import { LIST_USERS_IN_GROUP } from '../../queries/userQueries';
import { MANAGE_COGNITO_GROUPS } from '../../queries/userMutations';

const BoardRoleManager = ({ userGroups = [] }) => {
  const [actionType, setActionType] = useState('LIST');
  const [selectedGroup, setSelectedGroup] = useState('BOARD');
  const [cognitoId, setCognitoId] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

  // Define GraphQL operations using Apollo hooks
  const [listUsersInGroup, { loading: queryLoading, data }] = useLazyQuery(LIST_USERS_IN_GROUP, {
    fetchPolicy: 'network-only'
  });

  const [manageCognitoGroups, { loading: mutationLoading }] = useMutation(MANAGE_COGNITO_GROUPS, {
    onCompleted: (data) => {
      setNotificationMessage(data.manageCognitoGroups.message || 'Operation completed successfully');
      setShowNotification(true);
      setCognitoId('');
      if (actionType !== 'LIST') {
        fetchUsers();
      }
    },
    onError: (error) => {
      setNotificationMessage(`Failed to ${actionType.toLowerCase()} user: ${error.message}`);
      setShowNotification(true);
    }
  });

  const groups = ['BOARD', 'MEDIA', 'TREASURER', 'SECRETARY', 'PRESIDENT'];
  const actions = ['LIST', 'ADD', 'REMOVE'];
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
  };

  const handleActionTypeChange = (e) => {
    setActionType(e.target.value);
    setCognitoId('');
  };

  const handleRun = () => {
    if (actionType === 'LIST') {
      fetchUsers();
      return;
    }

    if (!cognitoId) {
      setNotificationMessage('Please enter a Cognito ID');
      setShowNotification(true);
      return;
    }

    manageCognitoGroups({
      variables: {
        action: actionType.toLowerCase(),
        groupName: selectedGroup,
        cognitoId: cognitoId
      }
    });
  };

  // Component mount - no auto-fetch

  return (
    <>
      <div className="board-tool">
        <h2 className="section-title">Board Role Manager</h2>

        <div className="search-controls">
          <select
            value={actionType}
            onChange={handleActionTypeChange}
            className="search-type"
          >
            {actions.map(action => (
              <option key={action} value={action}>{action}</option>
            ))}
          </select>

          <select
            value={selectedGroup}
            onChange={handleGroupChange}
            className="search-type"
          >
            {groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>

          {(actionType === 'ADD' || actionType === 'REMOVE') && (
            <input
              type="text"
              placeholder="Enter Cognito ID"
              value={cognitoId}
              onChange={(e) => setCognitoId(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleRun();
                }
              }}
              className="search-input"
            />
          )}

          <button
            onClick={handleRun}
            disabled={loading || (actionType !== 'LIST' && !cognitoId)}
          >
            {loading ? 'Processing...' : 'Run'}
          </button>
        </div>

        {actionType === 'LIST' && (
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
                      <div>Cognito ID: {user.username}
                        <button
                          className="copy-btn"
                          onClick={(e) => copyWithFeedback(person.id, e)}
                          title="Copy Profile ID"
                        >
                          Copy
                        </button>
                      </div>
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
        )}
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

export default BoardRoleManager;
