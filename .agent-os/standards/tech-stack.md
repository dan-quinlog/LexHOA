# Tech Stack - LexHOA

## Context

LexHOA-specific tech stack for Homeowners Association management system. This overrides global Agent OS defaults.

## Frontend Stack

- App Framework: React 18+ (Single Page Application)
- Language: JavaScript (ES6+)
- Build Tool: Create React App (react-scripts 5.0.1)
- Package Manager: npm
- Node Version: 16+
- CSS Approach: Custom CSS with CSS Variables
- CSS Modules: Component-specific .css files alongside .js files
- UI Components: Custom components (no external UI library)
- Font Provider: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, Roboto)
- Icons: Custom/inline SVG as needed
- Routing: React Router v6+ for client-side navigation

## Backend Stack

- Application Hosting: AWS Amplify
- API Backend: AWS AppSync (GraphQL API)
- GraphQL Frontend: Apollo Client with React hooks and caching
- GraphQL Backend: AWS AppSync with real-time subscriptions
- Database: Amazon DynamoDB
- Database Backups: AWS automated backups
- Asset Storage: Amazon S3
- CDN: AWS CloudFront
- Asset Access: Public with CloudFront, private with signed URLs
- Authentication: AWS Cognito User Pools
- Serverless Functions: AWS Lambda
- Environment Variables: .env files (local) + AWS Amplify environment variables
- REST API: AWS Lambda functions via @aws-amplify/api-rest

## Development & Testing

- CI/CD Platform: AWS Amplify Console
- CI/CD Trigger: Push to main/staging/dev branches
- Tests: Jest (via react-scripts) for unit tests
- Code Quality: ESLint (react-app config)
- State Management: Apollo Client cache + React useState/useContext
- Form Handling: Controlled components with React state
- Date/Time: Native JavaScript Date objects
- HTTP Client: Apollo Client (GraphQL) + @aws-amplify/api-rest (REST)
- Development Tools: React Developer Tools, Apollo Client DevTools

## Application Architecture

- SEO/Meta: Standard React head management
- Loading States: Conditional rendering with loading states
- Performance: React.memo, useMemo, useCallback for optimization
- Production Environment: main branch → AWS Amplify
- Staging Environment: staging branch → AWS Amplify staging
- Development Environment: dev branch → local development
- Monitoring: AWS CloudWatch
- Error Tracking: AWS CloudWatch Logs

## Project-Specific Patterns

- Authentication: AWS Cognito with group-based permissions (President, Secretary, Treasurer, Board)
- Real-time Updates: GraphQL subscriptions via AWS AppSync
- File Structure: `src/components/`, `src/pages/`, `src/utils/`, `src/services/`, `src/queries/`
- Constants: Centralized in `src/utils/constants.js`
- GraphQL Queries: Centralized in `src/queries/queries.js`
- Styling: CSS variables defined in `src/styles/variables.css`
- Global Styles: `src/styles/global.css`

## AWS Services Configuration

- Cognito: User authentication with custom groups
- AppSync: GraphQL API with resolvers
- DynamoDB: NoSQL database with GSI indexes
- S3: Document and image storage
- Lambda: Serverless functions for business logic
- Amplify: Full-stack deployment and hosting
