# JavaScript Style Guide - LexHOA

## Naming Conventions

### Variables and Functions
- Use **camelCase** for variables and functions
- Use descriptive names that explain purpose
```javascript
const userProfile = getUserProfile();
const calculateTotalPrice = (items) => { ... };
```

### Constants
- Use **UPPER_SNAKE_CASE** for module-level constants
```javascript
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';
```

### Components (React)
- Use **PascalCase** for React components
- Use **camelCase** for component props
```javascript
const UserProfile = ({ userId, showAvatar }) => { ... };
```

### Files and Directories
- Use **PascalCase** for React component files: `UserProfile.js`
- Use **camelCase** for utility/service files: `apiClient.js`, `constants.js`
- Use **kebab-case** for directories: `user-management/`, `board-tools/`
- Use **.js** extension for all JavaScript files (not .jsx)

## Code Formatting

### Indentation
- Use **2 spaces** (never tabs)
- Consistent indentation for nested structures

### Strings
- Use **single quotes** for strings: `'Hello World'`
- Use **template literals** for interpolation: `` `Hello ${name}` ``
- Use **double quotes** only in JSX attributes

### Objects and Arrays
```javascript
// Objects - trailing commas, aligned formatting
const config = {
  apiUrl: 'https://api.example.com',
  timeout: 5000,
  retries: 3,
};

// Arrays - one item per line for readability when long
const menuItems = [
  'Home',
  'About', 
  'Contact',
];
```

## React-Specific Rules

### Component Structure
```javascript
// Function components (preferred)
const UserCard = ({ user, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  
  return (
    <div className="user-card">
      {/* Component JSX */}
    </div>
  );
};

export default UserCard;
```

### Hook Usage
- Group related state together
- Use custom hooks for reusable logic
- Place hooks at the top of component functions

### Event Handlers
- Prefix with `handle`: `handleClick`, `handleSubmit`
- Use arrow functions for inline handlers only when necessary

### Conditional Rendering
```javascript
// Preferred: Logical AND
{isLoading && <LoadingSpinner />}

// Preferred: Ternary for if/else
{user ? <UserProfile user={user} /> : <LoginForm />}
```

## Import/Export Rules

### Import Order
1. React and React-related imports
2. Third-party library imports  
3. AWS Amplify imports
4. Internal/local imports
5. Relative imports
6. CSS imports (at the end)

```javascript
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';

import { get } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';

import { listProfiles } from '../../queries/queries';
import { formatCurrency } from '../../utils/formatters';
import Button from '../shared/Button';

import './UserProfile.css';
```

### Named vs Default Exports
- Use **default exports** for React components
- Use **named exports** for utilities, hooks, and constants

## LexHOA-Specific Patterns

### GraphQL Queries
- Define all queries in `src/queries/queries.js`
- Import and use with Apollo Client hooks
```javascript
import { useQuery } from '@apollo/client';
import { listProfiles } from '../../queries/queries';

const { data, loading, error } = useQuery(listProfiles);
```

### Constants
- Store shared constants in `src/utils/constants.js`
- Use UPPER_SNAKE_CASE for constant names
```javascript
import { USER_ROLES, PROPERTY_TYPES } from '../../utils/constants';
```

### Component Organization
- Component file structure:
  - `ComponentName.js` - Component logic
  - `ComponentName.css` - Component styles
- Store shared components in `src/components/shared/`
- Group feature-specific components in feature folders

### CSS Class Naming
- Use **kebab-case** for CSS class names: `.user-profile-card`
- Prefix with component name for specificity
- Keep selectors simple and maintainable

### Responsive Design
- Mobile-first approach using CSS media queries
- Use CSS variables from `src/styles/variables.css`
- Test on mobile, tablet, and desktop breakpoints

## Code Comments
- Add brief comments above non-obvious business logic
- Document complex algorithms or calculations
- Explain the "why" behind implementation choices
- Never remove existing comments unless removing the associated code
- Update comments when modifying code to maintain accuracy
- Keep comments concise and relevant
