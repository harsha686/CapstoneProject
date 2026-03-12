import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuth } from '../contexts/AuthContext';
import Webcam from 'react-webcam';
import { EyeIcon, EyeSlashIcon, CameraIcon, LockClosedIcon, UserIcon } from '@heroicons/react/24/outline';
import { XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/outline";


const Login = () => {
  const navigate = useNavigate();
  const { verifyToken } = useAuth();
  const webcamRef = useRef(null);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [faceImage, setFaceImage] = useState(null);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtp, setShowOtp] = useState(false);
  const [voterId, setVoterId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef([]);

  useEffect(() => {
    // Auto-focus next OTP input
    otp.forEach((digit, index) => {
      if (digit && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    });
  }, [otp]);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        otpRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleInitiateLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isAdmin) {
        // Admin login
        const response = await authService.adminLogin(identifier, password);
        if (response.data.success) {
          localStorage.setItem('token', response.data.token);
          await verifyToken(response.data.token);
          navigate('/admin');
        } else {
          setError(response.data.message || 'Login failed');
        }
      } else {
        // Voter login - initiate with face verification
        const response = await authService.initiateLogin(identifier);
        if (response.data.success) {
          setVoterId(response.data.voterId);
          setShowOtp(true);
          const receivedOtp = response.data.otp;
          setSuccess(`OTP sent successfully. Your demo OTP is: ${receivedOtp}`);
          // console.log('Demo OTP:', receivedOtp);
        } else {
          setError(response.data.message || 'Login initiation failed');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLogin = async (e, capturedImage = null) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    const imageToUse = capturedImage || faceImage;
    if (!imageToUse) {
      setError('Please capture your photo first');
      setLoading(false);
      return;
    }

    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      // Convert base64 image to blob
      const response = await fetch(imageToUse);
      const blob = await response.blob();
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });

      const result = await authService.verifyLogin(identifier, file, otpString);

      if (result.data.success) {
        localStorage.setItem('token', result.data.token);
        await verifyToken(result.data.token);
        navigate('/vote');
      } else {
        setError(result.data.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      // console.log("Photo captured successfully");
      setFaceImage(imageSrc);
      setShowCamera(false);
      // Automatically trigger login verification after capture
      handleVerifyLogin(null, imageSrc);
    } else {
      setError("Failed to capture photo. Please try again.");
    }
  };

  const handleOtpSubmit = async (e) => {
    if (e) e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setShowCamera(true);
  };

  // Voter Login Form
  const VoterLoginForm = () => {
    const handleSubmit = (e) => {
      e.preventDefault();
      if (faceImage) {
        handleVerifyLogin(e);
      } else if (showOtp) {
        handleOtpSubmit(e);
      } else {
        handleInitiateLogin(e);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="form-label flex items-center">
            <UserIcon className="h-5 w-5 mr-2" />
            EPIC Number or Aadhaar Number
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="form-input w-full"
            placeholder="Enter your EPIC or Aadhaar number"
            disabled={showOtp}
            required
          />
        </div>

        {showOtp && (
          <div className="space-y-4">
            <div>
              <label className="form-label">Enter OTP</label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (otpRefs.current[index] = el)}
                    type="text"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="otp-input"
                    maxLength="1"
                    required
                  />
                ))}
              </div>
              <p className="text-sm text-indigo-600 text-center mt-2 font-medium">
                Enter the OTP shown in the success message above
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-white w-full py-3 rounded-lg font-semibold"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="loading-spinner mr-2"></div>
                  Verifying...
                </div>
              ) : (
                faceImage ? 'Verify & Login' : 'Verify OTP'
              )}
            </button>
          </div>
        )}

        {!showOtp && (
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-white w-full py-3 rounded-lg font-semibold"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="loading-spinner mr-2"></div>
                Sending OTP...
              </div>
            ) : (
              'Send OTP'
            )}
          </button>
        )}
      </form>
    );
  };

  // Admin Login Form
  const AdminLoginForm = () => (
    <form onSubmit={handleInitiateLogin} className="space-y-6">
      <div>
        <label className="form-label flex items-center">
          <UserIcon className="h-5 w-5 mr-2" />
          Username
        </label>
        <input
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          className="form-input w-full"
          placeholder="Enter admin username"
          required
        />
      </div>

      <div>
        <label className="form-label flex items-center">
          <LockClosedIcon className="h-5 w-5 mr-2" />
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input w-full pr-12"
            placeholder="Enter password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="btn-secondary text-white w-full py-3 rounded-lg font-semibold"
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="loading-spinner mr-2"></div>
            Logging in...
          </div>
        ) : (
          'Login as Admin'
        )}
      </button>
    </form>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-saffron via-white to-green">
      <div className="app-container w-full max-w-md p-8 mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {isAdmin ? 'Admin Login' : 'Voter Login'}
          </h1>
          <p className="text-gray-600">
            {isAdmin
              ? 'Access election management dashboard'
              : 'Login with facial recognition and OTP'
            }
          </p>
        </div>

        {/* Toggle Login Type */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-200 rounded-lg p-1 flex">
            <button
              onClick={() => setIsAdmin(false)}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${!isAdmin
                ? 'bg-saffron text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Voter
            </button>
            <button
              onClick={() => setIsAdmin(true)}
              className={`px-4 py-2 rounded-md font-semibold transition-colors ${isAdmin
                ? 'bg-deep-blue text-white'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              Admin
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-error mb-6 flex items-center">
            <XCircleIcon className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success mb-6 flex items-center">
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {isAdmin ? <AdminLoginForm /> : <VoterLoginForm />}

        {!isAdmin && (
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-2">New user?</p>
            <Link
              to="/register"
              className="text-saffron font-semibold hover:underline"
            >
              Register here
            </Link>
          </div>
        )}
      </div>

      {/* Camera Modal for Face Capture */}
      {showCamera && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Capture Your Photo</h3>
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full rounded-lg mb-4"
            />
            <div className="flex space-x-4">
              <button
                onClick={capturePhoto}
                className="btn-primary text-white px-4 py-2 rounded-lg font-semibold flex-1"
              >
                Capture
              </button>
              <button
                onClick={() => setShowCamera(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;