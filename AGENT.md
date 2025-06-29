# AGENT.md - LexHOA Development Guide

## Commands
- `npm start` - Start development server (port 3000)
- `npm run build` - Build for production 
- `npm test` - Run tests in watch mode
- `npm test -- --watchAll=false` - Run all tests once

## Architecture
- React 18 app using Create React App with AWS Amplify
- GraphQL API via AWS AppSync with Apollo Client
- Authentication via AWS Cognito
- Database: DynamoDB (via Amplify backend)
- REST API: Lambda functions at `/dev` endpoint
- File structure: `src/components/`, `src/pages/`, `src/utils/`, `src/services/`

## Code Style
- Use ES6+ imports/exports, React hooks, functional components
- CSS modules pattern: component-specific `.css` files alongside `.js` files
- Props destructuring in component params
- Named exports for utilities, default exports for components
- camelCase for variables/functions, PascalCase for components
- Store shared components in `src/components/shared/`
- Use constants from `src/utils/constants.js`
- GraphQL queries in `src/queries/queries.js`
