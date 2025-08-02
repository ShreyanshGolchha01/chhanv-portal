# Cookie-Based Authentication System

## Overview
This application now uses a secure cookie-based authentication system with localStorage fallback for persistent login functionality.

## Features

### 🍪 Cookie Storage
- **Secure Cookies**: Uses HttpOnly, Secure, and SameSite attributes
- **Persistent Login**: "Remember Me" option for 30-day authentication
- **Automatic Expiry**: Cookies automatically expire for security
- **Cross-Tab Sync**: Authentication state synced across browser tabs

### 🔐 Security Features
- **Dual Storage**: Cookies + localStorage for redundancy
- **Token Refresh**: Automatic authentication state refresh
- **Secure Logout**: Complete cleanup of all authentication data
- **HTTPS Support**: Secure cookies when served over HTTPS

## Implementation

### Cookie Utilities (`CookieStorage.ts`)
```typescript
// Set authentication cookie with custom expiry
await AuthCookies.setAuthCookie('isAuthenticated', 'true', rememberMe);

// Get authentication cookie
const authStatus = await AuthCookies.getAuthCookie('isAuthenticated');

// Remove specific cookie
await AuthCookies.removeAuthCookie('isAuthenticated');

// Clear all auth cookies
await AuthCookies.clearAllAuthCookies();
```

### Authentication Hook (`useAuth.ts`)
```typescript
const { isAdmin, isDoctor, userInfo, login, logout } = useAuth();

// Login with remember me
await login(userData, 'admin', true);

// Logout (clears all data)
await logout();
```

### Login Component Usage
```typescript
// Remember Me checkbox
const [rememberMe, setRememberMe] = useState(false);

// Login with remember preference
if (data.role === 'admin') {
  await AuthCookies.setAuthCookie('isAuthenticated', 'true', rememberMe);
  // Additional user data storage...
}
```

## Cookie Configuration

### Default Settings
- **Path**: `/` (available site-wide)
- **SameSite**: `lax` (balanced security)
- **Secure**: `true` (HTTPS only in production)
- **MaxAge**: 
  - 30 days (with "Remember Me")
  - 1 day (without "Remember Me")

### Cookie Names
- `isAuthenticated` - Admin authentication status
- `isDoctorAuthenticated` - Doctor authentication status  
- `userInfo` - User profile data (JSON)
- `savedEmail` - Saved email for auto-fill
- `rememberMe` - Remember preference flag

## Migration Notes

### Backward Compatibility
- Existing localStorage data is preserved
- System checks cookies first, then localStorage
- Gradual migration to cookie-only system

### Updated Components
- ✅ `UnifiedLogin.tsx` - Cookie-based login
- ✅ `Sidebar.tsx` - Cookie-aware logout
- ✅ `DoctorSidebar.tsx` - Cookie-aware logout
- ✅ `DoctorHeader.tsx` - Cookie-aware user info
- ✅ `routes/index.tsx` - Cookie-based route protection

## Usage Examples

### Basic Authentication Check
```typescript
import { useAuth } from '../hooks/useAuth';

const MyComponent = () => {
  const { isAdmin, isDoctor, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  
  return (
    <div>
      {isAdmin && <AdminPanel />}
      {isDoctor && <DoctorPanel />}
    </div>
  );
};
```

### Protected Routes
```typescript
const ProtectedRoute = ({ children }) => {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) return <Loading />;
  if (!isAdmin) return <Navigate to="/login" />;
  
  return <>{children}</>;
};
```

### Manual Logout
```typescript
import { logout } from '../utils/authUtils';

const handleLogout = async () => {
  try {
    await logout();
    window.location.href = '/';
  } catch (error) {
    console.error('Logout failed:', error);
  }
};
```

## Security Considerations

### Production Setup
1. **HTTPS Required**: Secure cookies only work over HTTPS
2. **Domain Configuration**: Set appropriate domain for cookies
3. **CSP Headers**: Configure Content Security Policy
4. **Cookie Policy**: Display cookie usage notice to users

### Development
- Secure cookies disabled for HTTP localhost
- Debug logging available in development mode
- Fallback to localStorage if cookies fail

## Troubleshooting

### Common Issues
1. **Cookies Not Saving**: Check HTTPS requirement
2. **Auto-logout**: Verify cookie expiry settings
3. **Cross-domain**: Configure domain attribute properly
4. **localStorage Fallback**: Ensure backward compatibility

### Debug Commands
```javascript
// Check all auth cookies
document.cookie.split(';').filter(c => c.includes('Auth'));

// Clear all cookies manually
await AuthCookies.clearAllAuthCookies();

// Force auth refresh
const { refreshAuth } = useAuth();
await refreshAuth();
```

## Browser Support
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Safari 13+
- ✅ Edge 80+

## Future Enhancements
- [ ] JWT token integration
- [ ] Refresh token rotation
- [ ] Multi-device logout
- [ ] Session timeout warnings
- [ ] Enhanced security headers
