import React, { useState, useEffect } from 'react';
import { PageLayout } from '@voilajsx/uikit/page';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@voilajsx/uikit/card';
import { Button } from '@voilajsx/uikit/button';
import { Alert, AlertTitle, AlertDescription } from '@voilajsx/uikit/alert';
import { User, Mail, Shield, Settings, Phone, Edit3, Save, X, AlertTriangle, CheckCircle, Key, Lock, Eye, EyeOff } from 'lucide-react';
import { Header, Footer, SEO } from '../../../shared/components';
import { AuthGuard } from '../../auth';
import { useAuth } from '../../auth';
import { useUser } from '../context/UserContext';
import { USER_ROLES } from '../index';

const UserProfilePage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { user, updateProfile, isLoading, changePassword } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: (user || authUser)?.name || '',
    phone: (user || authUser)?.phone || ''
  });

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Consolidated password UI state
  const [passwordUIState, setPasswordUIState] = useState({
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false,
    validationErrors: {
      newPassword: '',
      confirmPassword: '',
      currentPassword: ''
    }
  });

  // Use user from UserContext if available, otherwise fallback to authUser
  const displayUser = user || authUser;

  // Update form data when user data changes
  useEffect(() => {
    if (displayUser) {
      setFormData({
        name: displayUser.name || '',
        phone: displayUser.phone || ''
      });
    }
  }, [displayUser]);

  if (!displayUser) {
    return null;
  }

  const handleEdit = () => {
    setIsEditing(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    setFormData({
      name: displayUser.name || '',
      phone: displayUser.phone || ''
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUpdateError(null);
    setUpdateSuccess(false);
    setFormData({
      name: displayUser.name || '',
      phone: displayUser.phone || ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null);
    setUpdateSuccess(false);

    if (isLoading) {
      return;
    }

    try {
      const result = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim()
      });

      if (result.success) {
        setUpdateSuccess(true);
        setIsEditing(false);
        setTimeout(() => setUpdateSuccess(false), 3000);
      } else {
        setUpdateError(result.error || 'Profile update failed');
      }
    } catch (error: any) {
      setUpdateError(error.message || 'Profile update failed');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Password change handlers
  const handlePasswordEdit = () => {
    setIsChangingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordUIState(prev => ({
      ...prev,
      validationErrors: {
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
      }
    }));
  };

  const handlePasswordCancel = () => {
    setIsChangingPassword(false);
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordUIState(prev => ({
      ...prev,
      validationErrors: {
        newPassword: '',
        confirmPassword: '',
        currentPassword: ''
      }
    }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear main password error when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }

    // Live validation
    const newValidationErrors = { ...passwordUIState.validationErrors };

    if (name === 'currentPassword') {
      newValidationErrors.currentPassword = value.length === 0 ? 'Current password is required' : '';
    }

    if (name === 'newPassword') {
      if (value.length === 0) {
        newValidationErrors.newPassword = 'New password is required';
      } else if (value.length < 8) {
        newValidationErrors.newPassword = 'Password must be at least 8 characters long';
      } else {
        newValidationErrors.newPassword = '';
      }

      // Also check confirm password if it has a value
      if (passwordData.confirmPassword) {
        if (value !== passwordData.confirmPassword) {
          newValidationErrors.confirmPassword = 'Passwords do not match';
        } else {
          newValidationErrors.confirmPassword = '';
        }
      }
    }

    if (name === 'confirmPassword') {
      if (value.length === 0) {
        newValidationErrors.confirmPassword = 'Please confirm your password';
      } else if (value !== passwordData.newPassword) {
        newValidationErrors.confirmPassword = 'Passwords do not match';
      } else {
        newValidationErrors.confirmPassword = '';
      }
    }

    setPasswordUIState(prev => ({ ...prev, validationErrors: newValidationErrors }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    // Check if there are any validation errors
    const hasValidationErrors = Object.values(passwordUIState.validationErrors).some(error => error !== '');
    if (hasValidationErrors) {
      setPasswordError('Please fix the validation errors above');
      return;
    }

    // Final validation check
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }

    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordLoading(true);

    try {
      const result = await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (result.success) {
        setPasswordSuccess(true);
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordUIState(prev => ({
          ...prev,
          validationErrors: {
            newPassword: '',
            confirmPassword: '',
            currentPassword: ''
          }
        }));
        setTimeout(() => setPasswordSuccess(false), 5000);
      } else {
        setPasswordError(result.error || 'Password change failed');
      }
    } catch (error: any) {
      setPasswordError(error.message || 'Password change failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <AuthGuard requiredRoles={USER_ROLES.PROFILE_ACCESS}>
      <PageLayout>
        <SEO
          title="Profile"
          description="User profile and account management"
        />
        <Header />

        <PageLayout.Content>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account information and settings
            </p>
          </div>

          {/* Success/Error Messages */}
          {updateSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Profile Updated</AlertTitle>
              <AlertDescription className="text-green-700">
                Your profile information has been updated successfully.
              </AlertDescription>
            </Alert>
          )}

          {passwordSuccess && (
            <Alert className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Password Changed</AlertTitle>
              <AlertDescription className="text-green-700">
                Your password has been changed successfully.
              </AlertDescription>
            </Alert>
          )}

          {updateError && (
            <Alert className="bg-destructive/10 border-destructive text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Update Failed</AlertTitle>
              <AlertDescription className="text-destructive/80">
                {updateError}
              </AlertDescription>
            </Alert>
          )}


          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <CardTitle>Account Information</CardTitle>
                </div>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEdit}
                    className="gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </Button>
                )}
              </div>
              <CardDescription>
                Your account details and current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      {/* Editable Name Field */}
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Enter your name"
                          />
                        </div>
                      </div>

                      {/* Editable Phone Field */}
                      <div className="space-y-2">
                        <label htmlFor="phone" className="text-sm font-medium">
                          Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                          <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="Enter your phone number"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Non-editable Email */}
                      <div className="flex items-center gap-3">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{displayUser.email}</p>
                        </div>
                      </div>

                      {/* Non-editable Role */}
                      <div className="flex items-center gap-3">
                        <Shield className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p className="font-medium">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              {displayUser.role}.{displayUser.level}
                            </span>
                          </p>
                        </div>
                      </div>

                      {/* Non-editable Status */}
                      <div className="flex items-center gap-3">
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-medium">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${displayUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {displayUser.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Name</p>
                        <p className="font-medium">{displayUser.name || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone</p>
                        <p className="font-medium">{displayUser.phone || 'Not set'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{displayUser.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Role</p>
                        <p className="font-medium">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {displayUser.role}.{displayUser.level}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Settings className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="font-medium">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${displayUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {displayUser.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Password Change Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  <CardTitle>Password</CardTitle>
                </div>
                {!isChangingPassword && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePasswordEdit}
                    className="gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </Button>
                )}
              </div>
              <CardDescription>
                Update your account password for security
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Password Error Message - Show above form */}
              {passwordError && (
                <Alert className="bg-red-50 border-red-200 text-red-800 mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Password Change Failed</AlertTitle>
                  <AlertDescription className="text-red-700">
                    {passwordError}
                  </AlertDescription>
                </Alert>
              )}

              {isChangingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label htmlFor="currentPassword" className="text-sm font-medium">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          id="currentPassword"
                          name="currentPassword"
                          type={passwordUIState.showCurrentPassword ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={handlePasswordInputChange}
                          className={`w-full pl-10 pr-12 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                            passwordUIState.validationErrors.currentPassword ? 'border-red-500' : 'border-input'
                          }`}
                          placeholder="Enter current password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordUIState(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordUIState.showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordUIState.validationErrors.currentPassword && (
                        <p className="text-sm text-red-600">{passwordUIState.validationErrors.currentPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="newPassword" className="text-sm font-medium">
                        New Password
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          id="newPassword"
                          name="newPassword"
                          type={passwordUIState.showNewPassword ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          className={`w-full pl-10 pr-12 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                            passwordUIState.validationErrors.newPassword ? 'border-red-500' : 'border-input'
                          }`}
                          placeholder="Enter new password (min 8 characters)"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordUIState(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordUIState.showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordUIState.validationErrors.newPassword && (
                        <p className="text-sm text-red-600">{passwordUIState.validationErrors.newPassword}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="confirmPassword" className="text-sm font-medium">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={passwordUIState.showConfirmPassword ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className={`w-full pl-10 pr-12 py-2 border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring ${
                            passwordUIState.validationErrors.confirmPassword ? 'border-red-500' : 'border-input'
                          }`}
                          placeholder="Confirm new password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setPasswordUIState(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {passwordUIState.showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {passwordUIState.validationErrors.confirmPassword && (
                        <p className="text-sm text-red-600">{passwordUIState.validationErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePasswordCancel}
                      disabled={passwordLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={passwordLoading}
                    >
                      {passwordLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                          Changing...
                        </div>
                      ) : (
                        <>
                          <Key className="h-4 w-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Your password was last changed on{' '}
                    {displayUser.updatedAt ? new Date(displayUser.updatedAt).toLocaleDateString() : 'Unknown'}
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Password is secure and encrypted
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Minimum 8 characters required
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageLayout.Content>

      <Footer />
      </PageLayout>
    </AuthGuard>
  );
};

export default UserProfilePage;