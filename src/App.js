import React, { useEffect, useState, useRef } from 'react';
import { Amplify } from 'aws-amplify';
import { getCurrentUser, signOut, signInWithRedirect, fetchAuthSession } from '@aws-amplify/auth';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';
import './App.css';
import hoaImage from './images/hoa-property.jpg';
import mapImage from './images/map-view.jpg';
import Amenities from './Amenities';
import Contact from './Contact';
import Login from './Login';
import Profile from './pages/Profile';
import Board from './pages/Board';
import awsmobile from './aws-exports';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { ApolloLink } from '@apollo/client';
import { GET_LATEST_BULLETINS } from './queries/queries';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.bubble.css';

Amplify.configure({
  ...awsmobile,
  Auth: {
    region: 'us-east-1',
    mandatorySignIn: false
  }
});

const url = awsmobile.aws_appsync_graphqlEndpoint;
const region = awsmobile.aws_appsync_region;

function App() {
  const [user, setUser] = useState(null);
  const [userGroups, setUserGroups] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const auth = {
    type: user ? awsmobile.aws_appsync_authenticationType : 'API_KEY',
    apiKey: 'da2-a72v2rhxifbdvfaluuqhxiheaq',
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
      'x-api-key': 'da2-a72v2rhxifbdvfaluuqhxiheaq'
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
      { label: 'Profile', path: '/profile' }, // Move Profile first
      { label: 'Board', path: '/board', group: 'BOARD' },
      { label: 'Account', path: '/account', group: 'OWNERS' },
      { label: 'Property', path: '/property', group: 'RESIDENTS' },
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
    const { loading, error, data } = useQuery(GET_LATEST_BULLETINS, {
      client: user ? authenticatedClient : publicClient
    });

const BulletinSection = () => {
  if (loading) return <p>Loading bulletins...</p>;
  if (error) return <p>Error loading bulletins. Please try again later.</p>;
  if (!data || !data.listBulletins) return <p>No bulletins available</p>;

  return (
    <ul className="bulletin-list">
      {data.listBulletins.items.map(bulletin => (
        <li key={bulletin.id} className="bulletin-card">
          <h3>{bulletin.title}</h3>
          <ReactQuill 
            value={bulletin.content}
            readOnly={true}
            theme="bubble"
            modules={{ toolbar: false }}
          />
          <p className="bulletin-date">{new Date(bulletin.datePosted).toLocaleDateString()}</p>
        </li>
      ))}
    </ul>
  );
};
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
            <BulletinSection />
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
            {user ? (
              <div className="hamburger-menu" ref={menuRef}>
                <button onClick={toggleMenu}>☰</button>
                {isMenuOpen && (
                  <div className="dropdown-menu">
                    {renderMenuItems()}
                    <button onClick={handleSignOut}>Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <nav className="desktop-menu">
                <Link to="/amenities">Amenities</Link>
                <Link to="/contact">Contact</Link>
                <button onClick={() => signInWithRedirect()}>Login</button>
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