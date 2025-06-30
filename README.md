# Lexington Commons HOA Management System

A comprehensive payment and profile management system designed specifically for Homeowners Association (HOA) administration at Lexington Commons.

## 🏠 Purpose

This application provides HOA board members and administrators with tools to:

- **Profile Management**: Create, edit, and manage homeowner and tenant profiles
- **Payment Tracking**: Record and track HOA dues, fees, and other payments
- **Property Management**: Maintain property records with owner/tenant relationships  
- **Board Tools**: Administrative functions with role-based permissions
- **Communication**: Bulletin board and ping messaging system
- **Authentication**: Secure access control via AWS Cognito

## 🛠 Technical Architecture

### Frontend
- **Framework**: React 18 with Create React App
- **UI**: Custom CSS with responsive design
- **State Management**: Apollo Client for GraphQL state management
- **Authentication**: AWS Amplify Auth (Cognito)
- **Routing**: React Router for SPA navigation

### Backend
- **API**: AWS AppSync (GraphQL)
- **Database**: Amazon DynamoDB
- **Authentication**: AWS Cognito User Pools
- **File Storage**: Amazon S3
- **Serverless Functions**: AWS Lambda
- **Infrastructure**: AWS Amplify for full-stack deployment

### Key Features
- **GraphQL API**: Efficient data fetching with relationships
- **Real-time Updates**: Subscriptions for live data updates
- **Role-based Access Control**: President, Secretary, Treasurer, Board member permissions
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Offline Support**: Progressive Web App capabilities

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- AWS Account (for backend services)
- Amplify CLI configured

### Installation

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd LexHOA
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure AWS Amplify**
   ```bash
   amplify configure
   amplify init
   ```

4. **Deploy backend resources**
   ```bash
   amplify push
   ```

5. **Start development server**
   ```bash
   npm start
   ```

The app will open at [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── board/          # Board management tools
│   ├── modals/         # Modal dialogs
│   ├── shared/         # Shared components
│   └── dev/            # Development utilities
├── pages/              # Main application pages
│   ├── dashboard/      # Dashboard components
│   ├── profile/        # Profile management
│   └── payments/       # Payment tracking
├── queries/            # GraphQL queries and mutations
├── utils/              # Utility functions
├── services/           # API service layers
└── styles/             # Global styles and themes
```

## 🔐 User Roles & Permissions

### President
- Full administrative access
- Create/edit/delete all profiles and properties
- Manage board member roles
- Access all financial data

### Secretary  
- Profile management (create/edit/merge)
- Property management
- Board communications
- Limited financial access

### Treasurer
- Payment management (create/edit/delete)
- Financial reporting
- Profile balance management
- Property financial data

### Board Member
- View and edit basic profile information
- Access property information
- View payment history
- Board communications

## 🏗 Available Scripts

### Development
- **`npm start`** - Start development server
- **`npm test`** - Run test suite in watch mode
- **`npm run build`** - Create production build

### AWS Amplify
- **`amplify status`** - Check backend resource status
- **`amplify push`** - Deploy backend changes
- **`amplify pull`** - Pull latest backend configuration

## 🗄 Database Schema

### Core Entities
- **Profile**: Homeowner/tenant information, contact details, balance
- **Property**: Physical property data with owner/tenant relationships
- **Payment**: Payment records with owner associations
- **Bulletin**: Board announcements and communications
- **Ping**: Internal messaging system

### Relationships
- **Profile** ↔ **Property**: Owner and tenant relationships
- **Profile** ↔ **Payment**: Payment ownership
- **Property** → **Profile**: Owner and tenant references

## 🔧 Configuration

### Environment Variables
Create a `.env` file with the following variables:
```
REACT_APP_PRESIDENT_GROUP_NAME=president
REACT_APP_SECRETARY_GROUP_NAME=secretary  
REACT_APP_TREASURER_GROUP_NAME=treasurer
REACT_APP_BOARD_GROUP_NAME=board
```

### AWS Services Configuration
- **Cognito**: User authentication and authorization
- **AppSync**: GraphQL API endpoint
- **DynamoDB**: Data storage with global secondary indexes
- **S3**: File storage for documents and images

## 📱 Progressive Web App

The application includes PWA capabilities:
- **Offline functionality**: Basic operations work without internet
- **Install prompt**: Can be installed on mobile devices
- **App-like experience**: Fullscreen mode on mobile
- **Custom app icon**: Lexington Commons HOA logo

## 🔍 Testing

The application includes comprehensive testing:
- **Unit tests**: Component and utility function testing
- **Integration tests**: User workflow testing
- **E2E tests**: Full application testing

Run tests with:
```bash
npm test                    # Interactive watch mode
npm test -- --watchAll=false   # Run all tests once
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Amplify Hosting
The application is configured for automatic deployment via AWS Amplify:
1. Connect repository to Amplify Console
2. Configure build settings
3. Deploy automatically on git push

## 🤝 Contributing

1. Create feature branch from `main`
2. Make changes following existing code style
3. Update tests as needed
4. Submit pull request for review

## 📄 License

Private software for Lexington Commons HOA use only.

## 📞 Support

For technical support or feature requests, contact the development team.

---

**Built with ❤️ for the Lexington Commons Community**
