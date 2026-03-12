import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Webcam from 'react-webcam';
import { CameraIcon, UserIcon, PhoneIcon, MapPinIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

const Registration = () => {
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    address: '',
    epicNumber: '',
    aadhaarNumber: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    constituencyId: 1
  });
  
  const [faceImage, setFaceImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [constituencies, setConstituencies] = useState([
    { id: 1, name: 'Mumbai South', state: 'Maharashtra' },
    { id: 2, name: 'New Delhi', state: 'Delhi' },
    { id: 3, name: 'Bangalore Central', state: 'Karnataka' },
    { id: 4, name: 'Chennai Central', state: 'Tamil Nadu' },
    { id: 5, name: 'Kolkata North', state: 'West Bengal' }
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 2) {
      setError('Name must be at least 2 characters long');
      return false;
    }
    
    if (!formData.age || parseInt(formData.age) < 18) {
      setError('Age must be 18 or above');
      return false;
    }
    
    if (!formData.epicNumber || !/^[A-Z]{3}[0-9]{7}$/.test(formData.epicNumber)) {
      setError('Invalid EPIC number format (e.g., ABC1234567)');
      return false;
    }
    
    if (!formData.aadhaarNumber || !/^[0-9]{12}$/.test(formData.aadhaarNumber)) {
      setError('Invalid Aadhaar number (12 digits required)');
      return false;
    }
    
    if (!formData.phoneNumber || !/^[0-9]{10}$/.test(formData.phoneNumber)) {
      setError('Invalid phone number (10 digits required)');
      return false;
    }
    
    if (!formData.password || formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (!faceImage) {
      setError('Please capture your face image');
      return false;
    }
    
    return true;
  };

  const capturePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFaceImage(imageSrc);
    setShowCamera(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Convert base64 image to blob
      const response = await fetch(faceImage);
      const blob = await response.blob();
      const file = new File([blob], 'face.jpg', { type: 'image/jpeg' });
      
      const voterData = {
        name: formData.name,
        age: parseInt(formData.age),
        address: formData.address,
        epicNumber: formData.epicNumber,
        aadhaarNumber: formData.aadhaarNumber,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        constituency: { id: formData.constituencyId }
      };
      
      const result = await authService.registerVoter(voterData, file);
      
      if (result.data.success) {
        setSuccess('Registration successful! Please wait for verification.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.data.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-saffron via-white to-green">
      <div className="app-container w-full max-w-4xl p-8 mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SecureVote Registration</h1>
          <p className="text-gray-600">Register to participate in India's secure digital voting system</p>
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <label className="form-label">Age</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="Enter your age"
                  min="18"
                  max="120"
                  required
                />
              </div>

              <div>
                <label className="form-label">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input w-full h-24 resize-none"
                  placeholder="Enter your complete address"
                  required
                />
              </div>

              <div>
                <label className="form-label">Constituency</label>
                <select
                  name="constituencyId"
                  value={formData.constituencyId}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  required
                >
                  {constituencies.map(constituency => (
                    <option key={constituency.id} value={constituency.id}>
                      {constituency.name}, {constituency.state}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Identification */}
            <div className="space-y-4">
              <div>
                <label className="form-label">EPIC Number</label>
                <input
                  type="text"
                  name="epicNumber"
                  value={formData.epicNumber}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="e.g., ABC1234567"
                  pattern="[A-Z]{3}[0-9]{7}"
                  required
                />
              </div>

              <div>
                <label className="form-label">Aadhaar Number</label>
                <input
                  type="text"
                  name="aadhaarNumber"
                  value={formData.aadhaarNumber}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="12 digit Aadhaar number"
                  pattern="[0-9]{12}"
                  required
                />
              </div>

              <div>
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="10 digit phone number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>

              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="Minimum 6 characters"
                  minLength="6"
                  required
                />
              </div>

              <div>
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="form-input w-full"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>
          </div>

          {/* Face Capture */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <CameraIcon className="h-6 w-6 mr-2 text-saffron" />
              Face Verification
            </h3>
            
            {!faceImage ? (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="btn-primary text-white px-6 py-3 rounded-lg font-semibold flex items-center mx-auto"
                >
                  <CameraIcon className="h-5 w-5 mr-2" />
                  Capture Face Image
                </button>
                <p className="text-sm text-gray-600 mt-2">
                  Please ensure your face is clearly visible and well-lit
                </p>
              </div>
            ) : (
              <div className="text-center">
                <img
                  src={faceImage}
                  alt="Captured face"
                  className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-saffron"
                />
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="btn-secondary text-white px-4 py-2 rounded-lg font-semibold"
                >
                  Retake Photo
                </button>
              </div>
            )}
          </div>

          {/* Camera Modal */}
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

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-white px-8 py-3 rounded-lg font-semibold text-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="loading-spinner mr-2"></div>
                  Registering...
                </div>
              ) : (
                'Register'
              )}
            </button>
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-saffron font-semibold hover:underline"
              >
                Login here
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registration;