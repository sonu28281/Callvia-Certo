# Frontend - Callvia Certo

White-label React dashboard for the multi-tenant compliance & verification platform.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Axios** - HTTP client

## Features

✅ **Complete Dashboard Layout**
- Responsive sidebar navigation
- Header with wallet balance
- Mobile-friendly design

✅ **Core Pages**
- Dashboard (overview & stats)
- Wallet management & recharge
- KYC verification interface
- Voice verification interface
- Audit log viewer
- Tenant management
- Settings

✅ **White-Label Theming**
- CSS variable-based theming
- Dynamic color palette generation
- Custom branding support
- Favicon & logo customization

✅ **UI Components**
- Reusable button styles
- Card components
- Badge components
- Input components
- Modal dialogs
- Tables with hover states

## Project Structure

```
apps/frontend/
├── src/
│   ├── components/
│   │   ├── layouts/
│   │   │   └── DashboardLayout.tsx
│   │   ├── Header.tsx
│   │   └── Sidebar.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Wallet.tsx
│   │   ├── KYC.tsx
│   │   ├── Voice.tsx
│   │   ├── AuditLogs.tsx
│   │   ├── Tenants.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── utils/
│   │   └── theme.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

## Development

### Prerequisites
- Node.js 18+
- pnpm 8+

### Install Dependencies
```bash
pnpm install
```

### Start Dev Server
```bash
# From root
pnpm frontend:dev

# Or directly
cd apps/frontend
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
pnpm build
```

## White-Label Theming

The frontend supports complete white-label theming:

### 1. CSS Variables
Theme colors are defined using CSS variables in `src/index.css`:
```css
:root {
  --color-primary-500: #3b82f6;
  --color-accent-500: #22c55e;
  /* ... */
}
```

### 2. Dynamic Theme Application
Use the `applyTheme()` function in `src/utils/theme.ts`:
```typescript
import { applyTheme } from './utils/theme';

applyTheme({
  primaryColor: '#8b5cf6', // Purple
  accentColor: '#f59e0b', // Amber
  brandName: 'Your Brand',
  logoUrl: 'https://example.com/logo.png',
  faviconUrl: 'https://example.com/favicon.ico',
});
```

### 3. Tenant-Specific Themes
Themes can be fetched from the API per tenant:
```typescript
import { fetchTenantTheme } from './utils/theme';

const theme = await fetchTenantTheme('tenant_abc');
applyTheme(theme);
```

## API Integration

The frontend is configured to proxy API requests to the backend:

### Vite Proxy Configuration
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
});
```

### Making API Calls
```typescript
import axios from 'axios';

// All /api/* requests are proxied to backend
const response = await axios.get('/api/v1/wallet/balance', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## TODO: Backend Integration

The frontend currently uses **mock data**. To integrate with the backend:

1. **Authentication**
   - Implement JWT token management
   - Store token in localStorage/sessionStorage
   - Add token to all API requests
   - Handle token refresh

2. **API Service Layer**
   - Create API service files (e.g., `services/api.ts`)
   - Replace mock data with real API calls
   - Add error handling
   - Add loading states

3. **State Management** (Optional)
   - Consider React Context or Zustand for global state
   - Manage user session
   - Cache frequently accessed data

4. **Real-time Updates** (Optional)
   - WebSocket connection for live updates
   - Wallet balance changes
   - Verification status updates

## Design System

### Colors
- **Primary**: Brand color (default: Blue)
- **Accent**: Success/money color (default: Green)
- **Gray**: Neutral colors for text and backgrounds

### Typography
- Font: System font stack (antialiased)
- Sizes: Tailwind's default scale

### Spacing
- Consistent padding: 6-unit grid (1.5rem)
- Card spacing: p-6
- Section spacing: space-y-6

### Components
All components use Tailwind utility classes with custom component classes:
- `.btn` - Base button
- `.btn-primary`, `.btn-secondary`, etc.
- `.card` - White card with shadow
- `.input` - Form input
- `.badge` - Status badges

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- **Code Splitting**: React.lazy() for route-based splitting
- **Bundle Size**: < 500KB (gzipped)
- **Lighthouse Score**: 90+ (target)

## Accessibility

- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Focus states on interactive elements

## Security

- Input sanitization (TODO)
- XSS prevention via React
- CSRF token handling (TODO)
- Content Security Policy headers

## Next Steps

1. ✅ ~~Complete UI implementation~~
2. 🔄 Integrate with backend APIs
3. 🔄 Add loading states & error handling
4. 🔄 Implement authentication flow
5. 🔄 Add form validation
6. 🔄 Optimize bundle size
7. 🔄 Add unit tests (Jest + React Testing Library)
8. 🔄 Add E2E tests (Playwright/Cypress)

## License

Private - Callvia Certo Platform
