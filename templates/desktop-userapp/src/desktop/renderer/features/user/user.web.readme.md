# User Feature - Frontend Developer Reference

## Overview

The User Feature provides comprehensive user profile management capabilities with React Context API integration, real-time form validation, and secure password management. Built with TypeScript and feature-based component architecture (FBCA) for maintainable user management interfaces.

## Architecture

```
src/web/features/user/
├── components/
│   ├── ErrorBoundary.tsx       # Error boundary for user features
│   └── index.ts                # Component exports
├── context/
│   └── UserContext.tsx         # User state management and API calls
├── pages/
│   ├── index.tsx               # User profile page with editing
│   └── admin/
│       ├── index.tsx           # Admin dashboard for user management
│       ├── create.tsx          # Create new user form
│       ├── edit.tsx            # Edit user form
│       └── show.tsx            # View user details
├── types/
│   └── index.ts                # TypeScript interfaces
├── index.ts                    # Feature exports
└── user.web.readme.md          # This documentation
```

## Core Components

### 1. UserContext (`context/UserContext.tsx`)

**Primary Functions:**
- `getProfile()` - Fetch current user profile data
- `updateProfile()` - Update user profile information
- `changePassword()` - Secure password change with validation
- `refreshProfile()` - Reload profile data from server
- `makeAuthenticatedRequest()` - Generic authenticated API wrapper

**State Management:**
- React Context API with authentication integration
- Cross-context synchronization with AuthContext
- Custom event dispatching for real-time updates
- Automatic profile loading on authentication

### 2. Profile Page (`pages/index.tsx`)

**Features:**
- **Inline Editing** - Edit profile fields without navigation
- **Password Change** - Secure password update with live validation
- **Real-time Validation** - Client-side validation with error feedback
- **Success Notifications** - User-friendly feedback on actions
- **Loading States** - Visual feedback during API calls

**Form Capabilities:**
```typescript
// Profile editing
{
  name: string;     // Editable display name
  phone: string;    // Editable phone number
  email: string;    // Read-only email address
  role: string;     // Read-only user role
  level: string;    // Read-only permission level
}

// Password change
{
  currentPassword: string;  // Current password verification
  newPassword: string;      // New password (8+ characters)
  confirmPassword: string;  // Password confirmation
}
```

### 3. Admin Components (`pages/admin/`)

**Admin Dashboard Features:**
- User list with search and filtering
- Pagination support for large datasets
- Role-based access control
- User management actions (view, edit, delete)
- Admin-only permissions verification

## User Profile Management

### **Profile Update Flow**
1. User clicks "Edit" button on profile
2. Form enters edit mode with current values
3. User modifies name and/or phone fields
4. Client-side validation on input changes
5. Form submission with optimistic updates
6. Success → Update both UserContext and AuthContext
7. Cross-tab synchronization via localStorage events

### **Password Change Flow**
1. User clicks "Change Password" button
2. Password form appears with validation
3. Live validation for:
   - Current password required
   - New password 8+ characters
   - Password confirmation match
4. Secure API call with current password verification
5. Success → Clear form and show confirmation

## Cross-Context Synchronization

### **UserContext ↔ AuthContext Integration**
```typescript
// Update profile in UserContext
const result = await updateProfile(data);

// Sync with AuthContext localStorage
localStorage.setItem(config.auth.storage.user, JSON.stringify(updatedUser));

// Notify AuthContext of changes (same tab)
window.dispatchEvent(new CustomEvent('userUpdated', {
  detail: { user: updatedUser }
}));
```

### **Multi-tab Synchronization**
- Storage events automatically sync profile changes
- Custom events handle same-tab updates
- Consistent user data across all contexts

## Type Definitions

### **Core Types** (`types/index.ts`)
```typescript
interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  level?: string;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserProfile {
  name: string;
  phone?: string;
}

interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  getProfile: () => Promise<User | null>;
  updateProfile: (data: UserProfile) => Promise<{ success: boolean; error?: string }>;
  changePassword: (data: ChangePasswordData) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}
```

## Validation Rules

### **Profile Validation**
- **Name**: Optional string, trimmed on submission
- **Phone**: Optional string, basic format validation
- **Email**: Read-only, managed by authentication system

### **Password Validation**
- **Current Password**: Required for verification
- **New Password**:
  - Minimum 8 characters (matches backend requirement)
  - Real-time validation feedback
  - Must differ from current password
- **Confirm Password**: Must match new password exactly

**Live Validation Implementation:**
```typescript
// Real-time password validation
if (name === 'newPassword') {
  if (value.length === 0) {
    newValidationErrors.newPassword = 'New password is required';
  } else if (value.length < 8) {
    newValidationErrors.newPassword = 'Password must be at least 8 characters long';
  } else {
    newValidationErrors.newPassword = '';
  }
}
```

## API Integration

### **Authenticated Requests**
```typescript
const makeAuthenticatedRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${config.api.baseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      [config.auth.headers.frontendKey]: config.auth.headers.frontendKeyValue,
      [config.auth.headers.auth]: `Bearer ${token}`,
      ...options.headers,
    },
  });

  // Handle errors and parse response
  return response.json();
};
```

### **API Endpoints**
```typescript
// Profile management
GET /api/user/profile          // Get current user profile
PUT /api/user/profile          // Update profile information
POST /api/user/change-password // Change user password

// Admin endpoints (role-based access)
GET /api/user/admin/users      // List all users
POST /api/user/admin/users     // Create new user
PUT /api/user/admin/users/:id  // Update user
DELETE /api/user/admin/users/:id // Delete user
```

## Usage Examples

### **Basic Profile Management**
```typescript
import { useUser } from '../features/user';

const ProfileComponent: React.FC = () => {
  const { user, updateProfile, isLoading, error } = useUser();

  const handleUpdate = async (data: UserProfile) => {
    const result = await updateProfile(data);
    if (result.success) {
      console.log('Profile updated successfully');
    } else {
      console.error('Update failed:', result.error);
    }
  };

  return (
    <div>
      {user && (
        <form onSubmit={(e) => {
          e.preventDefault();
          handleUpdate(formData);
        }}>
          <input
            value={user.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </form>
      )}
    </div>
  );
};
```

### **Password Change Component**
```typescript
const PasswordChange: React.FC = () => {
  const { changePassword } = useUser();
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const result = await changePassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });

    if (result.success) {
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }
  };
};
```

### **Admin User Management**
```typescript
import { hasRole } from '../../shared/utils';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  // Check admin permissions
  if (!hasRole(user, ['admin.tenant', 'admin.system'])) {
    return <div>Access denied</div>;
  }

  return (
    <div>
      <h1>User Management</h1>
      {/* Admin functionality */}
    </div>
  );
};
```

## Error Handling

### **Standard Error Response**
```typescript
interface UserResponse {
  success: boolean;
  error?: string;
}

// Error handling pattern
const result = await updateProfile(data);
if (!result.success) {
  setError(result.error || 'Operation failed');
}
```

### **Common Error Scenarios**
- **Authentication expired** - Automatic logout and redirect
- **Network connectivity** - Retry mechanisms and user feedback
- **Validation errors** - Real-time field validation
- **Permission denied** - Role-based access control
- **Server errors** - Graceful error handling with user-friendly messages

## Security Features

### **Profile Security**
- Authentication required for all operations
- JWT token validation on every request
- Current password verification for password changes
- Role-based access control for admin functions

### **Input Validation**
- Client-side validation with server-side verification
- Password strength requirements (8+ characters)
- Input sanitization and XSS protection
- CSRF protection via frontend key validation

## Performance Optimizations

### **Context Optimizations**
- `useCallback` for all API functions with proper dependencies
- Minimal re-renders with selective state updates
- Efficient form state management with consolidated state objects
- Conditional component rendering
- Error boundary protection for graceful error handling

### **Form Performance**
- Debounced validation for real-time feedback
- Optimistic UI updates for better UX
- Loading states prevent double submissions
- Consolidated state management reduces re-renders
- Form state isolation from global context

### **Admin Dashboard Performance**
- **Debounced Search** - 300ms debounce prevents excessive filtering on every keystroke
- **Memoized Filtering** - useMemo for expensive filter operations
- **Type-safe State** - Proper TypeScript interfaces prevent runtime errors
- **Efficient Pagination** - Client-side pagination with optimized rendering

## Admin Features

### **User Management Dashboard**
- **Advanced Search** - Debounced search by email, name, or role with instant results
- **Smart Filtering** - Filter by role (user/moderator/admin) and status (active/inactive)
- **Intelligent Pagination** - Efficient client-side pagination with smart page controls
- **Secure Delete Actions** - Confirmation modal with typed verification (must type exact name/email)
- **Role Management** - View and manage user roles with proper permissions
- **User Status Tracking** - Visual indicators for active/inactive and verified users
- **Responsive Design** - Mobile-friendly table with proper responsive breakpoints

### **Permission System**
```typescript
// Role-based access patterns
const adminRoles = ['admin.tenant', 'admin.org', 'admin.system'];
const moderatorRoles = [...adminRoles, 'moderator.review', 'moderator.manage'];

// Usage
{hasRole(user, adminRoles) && (
  <AdminUsersList />
)}
```

## Integration with Authentication

### **Seamless Auth Integration**
- Automatic profile loading on login
- Profile data synchronization across contexts
- Logout handling with context cleanup
- Token refresh integration

### **Cross-Feature Communication**
```typescript
// Profile updates notify AuthContext
useEffect(() => {
  if (isAuthenticated && token && !userState.user) {
    getProfile(); // Load profile on auth
  }
}, [isAuthenticated, token]);
```

## Testing Guidelines

### **Unit Testing**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserProvider } from '../context/UserContext';

test('should update profile successfully', async () => {
  render(
    <UserProvider>
      <ProfilePage />
    </UserProvider>
  );

  fireEvent.click(screen.getByText('Edit'));
  fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'New Name' } });
  fireEvent.click(screen.getByText('Save'));

  await waitFor(() => {
    expect(screen.getByText('Profile updated successfully')).toBeInTheDocument();
  });
});
```

### **Integration Testing**
- Test complete profile update flows
- Mock API responses for different scenarios
- Test cross-context synchronization
- Validate error handling paths

## Best Practices

### **Component Design**
- ✅ Single responsibility principle
- ✅ Proper TypeScript interfaces
- ✅ Accessible form design
- ✅ Consistent error handling

### **State Management**
- ✅ Context API for user-specific state
- ✅ Local state for form management
- ✅ Cross-context synchronization
- ✅ Optimistic updates for better UX

### **Security Practices**
- ✅ Authentication required for all operations
- ✅ Input validation and sanitization
- ✅ Role-based access control
- ✅ Secure password handling

## Troubleshooting

### **Common Issues**

1. **Profile not loading** - Check authentication token validity
2. **Cross-tab sync not working** - Verify localStorage event listeners
3. **Password change failing** - Ensure current password is correct
4. **Admin access denied** - Verify user roles and permissions

### **Debug Helpers**
```typescript
// Debug user context state
const { user, isLoading, error } = useUser();
console.log('User Context:', { user, isLoading, error });

// Debug authentication status
const { isAuthenticated, token } = useAuth();
console.log('Auth Status:', { isAuthenticated, hasToken: !!token });
```

## Recent Improvements (2025)

### **Performance & Reliability**
- **Debounced Search** - 300ms debounce for smooth admin dashboard search
- **Consolidated State Management** - Reduced re-renders with optimized state objects
- **Error Boundaries** - React error boundary protection for graceful error handling
- **Type Safety Improvements** - Better TypeScript interfaces and dependency management
- **Enhanced Delete Confirmation** - Typed verification modals requiring exact name/email match

## Future Enhancements

### **Potential Features**
- **Profile Picture Upload** - Avatar management with image processing
- **Notification Preferences** - User-configurable notification settings
- **Account Activity Log** - Track user actions and login history
- **Two-Factor Authentication** - Enhanced security options
- **Data Export** - Allow users to download their data

### **Admin Enhancements**
- **User Analytics** - Usage statistics and insights
- **Bulk User Import** - CSV/Excel user creation
- **Advanced Filtering** - Complex search and filter options
- **User Groups** - Organize users into manageable groups
- **Audit Trail** - Track admin actions and changes

---

**Note:** This user feature provides production-ready user management with comprehensive profile editing, secure password changes, and admin capabilities. Built with modern React patterns and excellent user experience design.