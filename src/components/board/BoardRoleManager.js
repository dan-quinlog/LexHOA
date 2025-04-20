import React, { useState, useEffect } from 'react';
import { useLazyQuery } from '@apollo/client';
import { fetchAuthSession } from 'aws-amplify/auth';
import { LIST_PROFILES, PROFILE_BY_EMAIL, PROFILE_BY_NAME } from '../../queries/queries';
import BoardCard from './shared/BoardCard';
import NotificationModal from '../modals/NotificationModal';
import './shared/BoardTools.css';

// Get group names from environment variables
const PRESIDENT_GROUP = process.env.REACT_APP_PRESIDENT_GROUP_NAME;
const SECRETARY_GROUP = process.env.REACT_APP_SECRETARY_GROUP_NAME;
const TREASURER_GROUP = process.env.REACT_APP_TREASURER_GROUP_NAME;
const BOARD_GROUP = process.env.REACT_APP_BOARD_GROUP_NAME;
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

// All available roles
const ROLES = [
  { value: PRESIDENT_GROUP, label: 'President' },
  { value: SECRETARY_GROUP, label: 'Secretary' },
  { value: TREASURER_GROUP, label: 'Treasurer' },
  { value: BOARD_GROUP, label: 'Board Member' }
];

const BoardRoleManager = ({ userGroups = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('email');
  const [roleFilter, setRoleFilter] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [userRoles, setUserRoles] = useState({});

  // Check if current user is president
  const isPresident = userGroups && userGroups.includes(PRESIDENT_GROUP);

  // GraphQL queries
  const [searchByEmail] = useLazyQuery(PROFILE_BY_EMAIL);
  const [searchByName] = useLazyQuery(PROFILE_BY_NAME);
  const [listProfiles] = useLazyQuery(LIST_PROFILES);

  // Load initial data based on role filter
  useEffect(() => {
      if (roleFilter) {
          handleRoleSearch();
      }
  }, [roleFilter]);

  // Function to search users by role
  const handleRoleSearch = async () => {
      if (!roleFilter) return;
      setLoading(true);
      setError('');
      try {
          // First get all profiles
          const response = await listProfiles({
              variables: {
                  filter: {},
                  limit: 100
              }
          });
          const profiles = response.data?.listProfiles?.items || [];
            
          // For each profile, check if they have the selected role
          const profilesWithRoles = await Promise.all(
              profiles.map(async (profile) => {
                  if (profile.cognitoID) {
                      try {
                          // Get user's groups from Cognito
                          const userGroups = await getUserGroups(profile.cognitoID);
                          // Store user's roles in state
                          setUserRoles(prev => ({
                              ...prev,
                              [profile.id]: userGroups
                          }));
                          // Return profile if they have the selected role
                          if (userGroups.includes(roleFilter)) {
                              return profile;
                          }
                      } catch (err) {
                          console.error(`Error getting groups for user ${profile.id}:`, err);
                      }
                  }
                  return null;
              })
          );
            
          // Filter out null values
          const filteredProfiles = profilesWithRoles.filter(profile => profile !== null);
          setSearchResults(filteredProfiles);
      } catch (err) {
          console.error('Error searching by role:', err);
          setError('Error searching by role');
      } finally {
          setLoading(false);
      }
  };

  // Function to search users by email or name
  const handleSearch = async () => {
      if (!searchTerm) {
          setError('Search term is required');
          return;
      }
      setLoading(true);
      setError('');
      try {
          let response;
          if (searchType === 'email') {
              response = await searchByEmail({
                  variables: { email: searchTerm }
              });
              setSearchResults(response.data?.profileByEmail?.items || []);
          } else if (searchType === 'name') {
              response = await searchByName({
                  variables: { name: searchTerm }
              });
              setSearchResults(response.data?.profileByName?.items || []);
          }
            
          // Get roles for each user
          const profiles = response.data?.profileByEmail?.items || response.data?.profileByName?.items || [];
          await Promise.all(
              profiles.map(async (profile) => {
                  if (profile.cognitoID) {
                      try {
                          const userGroups = await getUserGroups(profile.cognitoID);
                          setUserRoles(prev => ({
                              ...prev,
                              [profile.id]: userGroups
                          }));
                      } catch (err) {
                          console.error(`Error getting groups for user ${profile.id}:`, err);
                      }
                  }
              })
          );
      } catch (err) {
          console.error('Search error:', err);
          setError('Error performing search');
      } finally {
          setLoading(false);
      }
  };

  // Function to get user groups from Cognito using fetch
  const getUserGroups = async (userId) => {
      try {
          // Get the current session
          const session = await fetchAuthSession();
            
          // Extract the JWT token
          const idToken = session.tokens.idToken.toString();
            
          // Call the API Gateway endpoint directly with fetch
          const response = await fetch(`${API_ENDPOINT}/cognitoGroups`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': idToken
              },
              body: JSON.stringify({ userId })
          });
            
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API error: ${response.status} - ${errorText}`);
          }
            
          const data = await response.json();
          return data.groups || [];
      } catch (err) {
          console.error('Error getting user groups:', err);
          return [];
      }
  };

  // Function to add user to a group using fetch
  const addUserToGroup = async (userId, groupName) => {
      if (!isPresident) {
          setNotificationMessage("Only the President can manage board roles");
          setShowNotification(true);
          return;
      }
        
      try {
          // Get the current session
          const session = await fetchAuthSession();
            
          // Extract the JWT token
          const idToken = session.tokens.idToken.toString();
            
          // Call the API Gateway endpoint directly with fetch
          const response = await fetch(`${API_ENDPOINT}/addUserToGroup`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': idToken
              },
              body: JSON.stringify({ userId, groupName })
          });
            
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API error: ${response.status} - ${errorText}`);
          }
            
          const data = await response.json();
            
          // Update local state with the returned groups
          setUserRoles(prev => ({
              ...prev,
              [userId]: data.groups || []
          }));
            
          setNotificationMessage(`User added to ${groupName} successfully`);
          setShowNotification(true);
      } catch (err) {
          console.error('Error adding user to group:', err);
          setNotificationMessage(`Error adding user to group: ${err.message}`);
          setShowNotification(true);
      }
  };

  // Function to remove user from a group using fetch
  const removeUserFromGroup = async (userId, groupName) => {
      if (!isPresident) {
          setNotificationMessage("Only the President can manage board roles");
          setShowNotification(true);
          return;
      }
        
      // Prevent removing the last President
      if (groupName === PRESIDENT_GROUP) {
          const presidentsCount = Object.values(userRoles).filter(
              groups => groups.includes(PRESIDENT_GROUP)
          ).length;
          if (presidentsCount <= 1) {
              setNotificationMessage("Cannot remove the last President. Assign another President first.");
              setShowNotification(true);
              return;
          }
      }
        
      try {
          // Get the current session
          const session = await fetchAuthSession();
            
          // Extract the JWT token
          const idToken = session.tokens.idToken.toString();
            
          // Call the API Gateway endpoint directly with fetch
          const response = await fetch(`${API_ENDPOINT}/removeUserFromGroup`, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': idToken
              },
              body: JSON.stringify({ userId, groupName })
          });
            
          if (!response.ok) {
              const errorText = await response.text();
              throw new Error(`API error: ${response.status} - ${errorText}`);
          }
            
          const data = await response.json();
            
          // Update local state with the returned groups
          setUserRoles(prev => ({
              ...prev,
              [userId]: data.groups || []
          }));
            
          setNotificationMessage(`User removed from ${groupName} successfully`);
          setShowNotification(true);
      } catch (err) {
          console.error('Error removing user from group:', err);
          setNotificationMessage(`Error removing user from group: ${err.message}`);
          setShowNotification(true);
      }
  };

  // Render role badges for a user
  const renderRoleBadges = (userId) => {
      const groups = userRoles[userId] || [];
      return (
          <div className="role-badges">
              {ROLES.map(role => {
                  const hasRole = groups.includes(role.value);
                  return (
                      <div key={role.value} className={`role-badge ${hasRole ? 'active' : 'inactive'}`}>
                          <span>{role.label}</span>
                          {isPresident && (
                              hasRole ? (
                                  <button
                                      className="role-action-btn remove"
                                      onClick={() => removeUserFromGroup(userId, role.value)}
                                  >
                                      Remove
                                  </button>
                              ) : (
                                  <button
                                      className="role-action-btn add"
                                      onClick={() => addUserToGroup(userId, role.value)}
                                  >
                                      Add
                                  </button>
                              )
                          )}
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
      <>
          <div className="board-tool">
              <h2 className="section-title">Board Role Manager</h2>
              {!isPresident && (
                  <div className="permission-warning">
                      Note: Only the President can modify board roles. You can view roles but not change them.
                  </div>
              )}
              <div className="search-controls">
                  <div className="search-section">
                      <select
                          value={searchType}
                          onChange={(e) => setSearchType(e.target.value)}
                          className="search-type"
                      >
                          <option value="email">Email</option>
                          <option value="name">Name</option>
                      </select>
                      <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                  handleSearch();
                              }
                          }}
                          className="search-input"
                      />
                      <button onClick={handleSearch}>Search</button>
                  </div>
                  <div className="search-section">
                      <label>List by Role:</label>
                      <select
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="role-filter"
                      >
                          <option value="">Select Role</option>
                          {ROLES.map(role => (
                              <option key={role.value} value={role.value}>
                                  {role.label}
                              </option>
                          ))}
                      </select>
                  </div>
              </div>
              {error && <div className="error-message">{error}</div>}
              {loading && <div className="loading-indicator">Loading...</div>}
              <div className="results-grid">
                  {searchResults.map(person => (
                      <BoardCard
                          key={person.id}
                          header={
                              <div className="person-header">
                                  <h3>{person.name}</h3>
                              </div>
                          }
                          content={
                              <>
                                  <div>Profile ID: {person.id}</div>
                                  <div>Cognito ID: {person.cognitoID}</div>
                                  <div>Email: {person.email}</div>
                                  <div>Phone: {person.phone}</div>
                                  <div className="roles-section">
                                      <h4>Roles:</h4>
                                      {renderRoleBadges(person.id)}
                                  </div>
                              </>
                          }
                      />
                  ))}
              </div>
              {searchResults.length === 0 && !loading && (
                  <div className="no-results">No users found</div>
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