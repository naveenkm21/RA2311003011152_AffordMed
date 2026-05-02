# React-Based Frontend Setup Guide

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm start
   ```

3. **Build for production**
   ```bash
   npm build
   ```

## Project Structure

```
react-frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── MedicineCard.jsx
│   │   ├── MedicineList.jsx
│   │   ├── Cart.jsx
│   │   ├── Footer.jsx
│   │   └── Filters.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Checkout.jsx
│   │   ├── OrderHistory.jsx
│   │   └── NotFound.jsx
│   ├── services/
│   │   ├── api.js
│   │   ├── mockData.js
│   │   └── cartService.js
│   ├── hooks/
│   │   ├── useCart.js
│   │   ├── useAuth.js
│   │   └── useMedicines.js
│   ├── styles/
│   │   ├── App.css
│   │   ├── components.css
│   │   ├── responsive.css
│   │   └── variables.css
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## Key React Features

### State Management
- **React Hooks**: useState, useEffect, useContext
- **Custom Hooks**: useCart, useAuth, useMedicines
- **localStorage**: For cart and user persistence

### Component Structure
```
App
├── Header
│   ├── Navigation
│   ├── Search
│   └── AuthButtons
├── Router
│   ├── Home
│   │   ├── Hero
│   │   ├── Filters
│   │   ├── MedicineList
│   │   │   └── MedicineCard (multiple)
│   │   └── Cart
│   ├── Checkout
│   └── OrderHistory
└── Footer
```

### API Integration
- Mock API calls for development
- Easy switch to real API
- Error handling and loading states
- Response interceptors

## Development Workflow

1. **Component Development**
   - Create reusable components
   - Use props for data flow
   - Implement hooks for state

2. **Testing**
   - Test components in isolation
   - Mock API calls
   - Test user interactions

3. **Performance**
   - Code splitting with React.lazy
   - Memoization with React.memo
   - Optimize re-renders

## Deployment

### Netlify
```bash
npm run build
# Deploy build/ folder
```

### Vercel
```bash
vercel
```

### Docker
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Environment Variables

Create `.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_ENV=development
```

## Next Steps

1. Install dependencies: `npm install`
2. Start dev server: `npm start`
3. Build components incrementally
4. Connect to backend API when ready
5. Deploy to production
