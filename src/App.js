import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signOut, signInWithRedirect, fetchAuthSession } from '@aws-amplify/auth';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import './styles/variables.css';
import './styles/global.css';
import hoaImage from './images/hoa-property.jpg';
import mapImage from './images/map-view.jpg';
import Amenities from './Amenities';
import Contact from './Contact';
import Login from './Login';
import Profile from './pages/profile/Profile';
import Board from './pages/board/Board';
import amplifyConfig from './services/amplify-config';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { ApolloLink } from '@apollo/client';
import { BULLETINS_BY_DATE, PROFILE_BY_COGNITO_ID } from './queries/queries';
import ReactQuill from 'react-quill';
import MenuState from './components/menu/MenuState';
import DatabaseReset from './components/dev/DatabaseReset'
import 'react-quill/dist/quill.bubble.css';

Amplify.configure({
  ...amplifyConfig,
  Auth: {
    region: 'us-east-1',
    mandatorySignIn: false
  }
});

const url = amplifyConfig.aws_appsync_graphqlEndpoint;
const region = amplifyConfig.aws_appsync_region;
const BOARD_GROUP = process.env.REACT_APP_BOARD_GROUP_NAME;

function App() {
  const [user, setUser] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const auth = {
    type: user ? amplifyConfig.aws_appsync_authenticationType : 'API_KEY',
    apiKey: process.env.REACT_APP_API_KEY,
    jwtToken: async () => {
      if (user) {
        const session = await fetchAuthSession();
        return session?.tokens?.idToken?.toString() || '';
      }
      return null;
    },
  };

  const authenticatedClient = new ApolloClient({
    link: ApolloLink.from([
      createAuthLink({ url, region, auth }),
      createSubscriptionHandshakeLink({ url, region, auth })
    ]),
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
    }
  });

  const publicClient = new ApolloClient({
    uri: url,
    cache: new InMemoryCache(),
    headers: {
      'x-api-key': process.env.REACT_APP_API_KEY
    }
  });

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const session = await fetchAuthSession();
          const groups = session.tokens.idToken.payload['cognito:groups'] || [];
          setUserGroups(groups);
        }
      } catch (error) {
        setUser(null);
        setUserGroups([]);
      }
    };

    handleRedirect();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setUserGroups([]);
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const renderMenuItems = () => {
    const menuItems = [
      { label: 'Profile', path: '/profile' },
      { label: 'Board', path: '/board', group: BOARD_GROUP },
      { label: 'Amenities', path: '/amenities' },
      { label: 'Contact', path: '/contact' }
    ];

    return menuItems
      .filter(item => !item.group || userGroups.includes(item.group))
      .map((item, index) => (
        <Link key={index} to={item.path} onClick={() => setIsMenuOpen(false)}>
          {item.label}
        </Link>
      ));
  };

  const HomePage = () => {
    // Determine user roles based on profile data and groups
    const { loading: profileLoading, error: profileError, data: profileData } = useQuery(PROFILE_BY_COGNITO_ID, {
      variables: { cognitoID: user?.username },
      skip: !user,
      client: authenticatedClient
    });

    // Get profile data
    const profile = profileData?.profileByCognitoID?.items[0];
    
    // Determine user roles based on profile data
    const isTenant = profile?.tenantAt !== null && profile?.tenantAt !== undefined;
    const isOwner = profile?.ownedProperties?.items?.length > 0;
    const isBoard = userGroups.includes(BOARD_GROUP);

    // Fetch all bulletins with a high limit
    const { loading: bulletinsLoading, error: bulletinsError, data: bulletinsData } = useQuery(BULLETINS_BY_DATE, {
      variables: {
        limit: 50, // High limit to ensure we get all relevant bulletins
        type: "BULLETIN",
        sortDirection: "DESC"
      },
      client: user ? authenticatedClient : publicClient
    });

    // Filter bulletins client-side based on user roles
    const filteredBulletins = useMemo(() => {
      const allBulletins = bulletinsData?.bulletinsByDate?.items || [];
      
      // For unauthenticated users, show only PUBLIC bulletins
      if (!user) {
        return allBulletins
          .filter(bulletin => bulletin.audience && bulletin.audience.includes("PUBLIC"))
          .slice(0, 3); // Limit to 3 for public users
      }
      
      // For board members, show all bulletins
      if (isBoard) {
        return allBulletins.slice(0, 10); // Limit to 10 for board members
      }
      
      // For other authenticated users, filter based on roles
      return allBulletins
        .filter(bulletin => {
          if (!bulletin.audience) return false;
          
          if (bulletin.audience.includes("PUBLIC")) return true;
          if (isTenant && bulletin.audience.includes("RESIDENTS")) return true;
          if (isOwner && bulletin.audience.includes("OWNERS")) return true;
          
          return false;
        })
        .slice(0, 10); // Limit to 10 for authenticated users
    }, [bulletinsData, user, isBoard, isTenant, isOwner]);

    const isLoading = bulletinsLoading || (user && !isBoard && profileLoading);

    return (
      <main className="content">
        <div className="main-content">
          <div className="image-map-container">
            <div className="hoa-image">
              <img src={hoaImage} alt="HOA Properties" />
            </div>
            <div className="map-placeholder">
              <img src={mapImage} alt="Map View" />
            </div>
          </div>
          <div className="bulletins">
            <h2>Recent Bulletins</h2>
            {isLoading && <p>Loading bulletins...</p>}
            {(bulletinsError || (user && !isBoard && profileError)) && (
              <div>
                <p>Error loading bulletins. Please try again later.</p>
                {bulletinsError && <p>Bulletin error: {bulletinsError.message}</p>}
                {profileError && <p>Profile error: {profileError.message}</p>}
              </div>
            )}
            {!isLoading && !bulletinsError && !(user && !isBoard && profileError) && (
              <ul className="bulletin-list">
                {filteredBulletins.length > 0 ? (
                  filteredBulletins.map(bulletin => (
                    <li key={bulletin.id} className="bulletin-card">
                      <h3>{bulletin.title}</h3>
                      <ReactQuill
                        value={bulletin.content}
                        readOnly={true}
                        theme="bubble"
                        modules={{ toolbar: false }}
                      />
                      <p className="bulletin-date">
                        {new Date(bulletin.createdAt).toLocaleDateString()}
                      </p>
                      {user && (
                        <p className="bulletin-audience" style={{ fontSize: '0.8em', color: '#666' }}>
                          Audience: {bulletin.audience.join(', ')}
                        </p>
                      )}
                    </li>
                  ))
                ) : (
                  <p>No bulletins to display</p>
                )}
              </ul>
            )}
          </div>
        </div>
      </main>
    );
  };

  return (
    <ApolloProvider client={user ? authenticatedClient : publicClient}>
      <BrowserRouter>
        <div className="App">
          <header className="top-bar">
            <Link to="/" className="site-title">
              <h1>Lexington Commons HOA</h1>
            </Link>
            {userGroups.includes(BOARD_GROUP) && <DatabaseReset />}
            {user ? (
              <MenuState
                userGroups={userGroups}
                onSignOut={handleSignOut}
                renderMenuItems={renderMenuItems}
              />
            ) : (
              <nav className="desktop-menu">
                <Link to="/amenities">Amenities</Link>
                <Link to="/contact">Contact</Link>
                <Login />
              </nav>
            )}
          </header>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/profile" element={<Profile cognitoId={user?.username} />} />
            <Route path="/amenities" element={<Amenities />} />
            <Route path="/board" element={<Board />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
          <footer className="bottom-bar">
            <nav className="mobile-menu">
              {user ? (
                <>
                  {renderMenuItems()}
                  <button onClick={handleSignOut}>Sign Out</button>
                </>
              ) : (
                <>
                  <Link to="/amenities">Amenities</Link>
                  <Link to="/contact">Contact</Link>
                  <Login />
                </>
              )}
            </nav>
          </footer>
        </div>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;