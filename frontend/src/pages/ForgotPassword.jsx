import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/ForgotPassword.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1 = request OTP, 2 = enter OTP and new password
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await axios.put('http://localhost:3000/api/auth/forgetPassword', {
        email
      });

      setSuccess(res.data.message || 'OTP sent to your email');
      setStep(2); // Move to step 2
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
      console.error('Request OTP error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp || !newPassword || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const res = await axios.put('http://localhost:3000/api/auth/resetPasswordWithOtp', {
        email,
        otp,
        newPassword
      });

      setSuccess(res.data.message || 'Password reset successfully');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
      console.error('Reset password error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-header">
          <h1>Reset Password</h1>
          <p className="step-indicator">
            {step === 1 ? 'Step 1: Request OTP' : 'Step 2: Reset Password'}
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        {step === 1 ? (
          // Step 1: Request OTP Form
          <form onSubmit={handleRequestOtp} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
              />
              <p className="helper-text">
                We'll send a 6-character OTP to this email address
              </p>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <div className="form-footer">
              <button 
                type="button" 
                onClick={() => navigate('/login')}
                className="back-link"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        ) : (
          // Step 2: Reset Password Form
          <form onSubmit={handleResetPassword} className="forgot-password-form">
            <div className="form-group">
              <label htmlFor="email-display">Email Address</label>
              <input
                type="email"
                id="email-display"
                value={email}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="otp">OTP Code</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-character OTP"
                maxLength="6"
                required
                disabled={loading}
              />
              <p className="helper-text">
                Check your email for the OTP code (valid for 15 minutes)
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                minLength="6"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                minLength="6"
                required
                disabled={loading}
              />
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Resetting Password...' : 'Reset Password'}
            </button>

            <div className="form-footer">
              <button 
                type="button" 
                onClick={() => {
                  setStep(1);
                  setOtp('');
                  setNewPassword('');
                  setConfirmPassword('');
                  setError('');
                  setSuccess('');
                }}
                className="back-link"
              >
                ← Request New OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
