# SecureVote - Indian Smart Voting System

## Overview
SecureVote is a comprehensive web-based voting system designed specifically for Indian elections, featuring facial recognition authentication, constituency-based voting, and secure vote casting with immutable records.

## Features

### 🔐 Security Features
- **Facial Recognition (LBP Liveness)**: Biometric verification with LBP texture analysis to prevent spoofing
- **Multilingual Voice Assistant**: Accessibility layer supporting EN/HI/TE with fuzzy search
- **JWT Token Authentication**: Stateless session management with Spring Security
- **OTP Verification**: Multi-factor authentication via console-logged codes
- **Military-Grade Security**: CLAHE pre-processing and BCrypt hashing

### 🗳️ Voting System
- **Constituency-based Voting**: Voters can only vote for candidates in their registered constituency
- **NOTA Option**: None of the Above option as per Indian election rules
- **Single Vote Enforcement**: Prevents multiple voting by the same individual
- **Real-time Results**: Live vote counting and result display

### 👥 User Management
- **Voter Registration**: Complete registration with biometric data capture
- **Admin Dashboard**: Election commission management interface
- **Voter Verification**: Admin-controlled voter approval system
- **Comprehensive Audit Trail**: Complete logging of all voting activities

### 🎨 User Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Indian Flag Inspired Theme**: Saffron, white, and green color scheme
- **Intuitive Navigation**: User-friendly interface for all user types
- **Real-time Feedback**: Loading states and success/error messages

## 🛠️ Technology Stack

Detailed documentation is available in [TECH_STACK.md](./TECH_STACK.md).

### ☕ Backend (Service Layer)
- **Framework**: **Spring Boot 3.1.5** (Java 17)
- **Security**: Spring Security 6.0 (JWT/JJWT Stateless Auth)
- **Database**: **MySQL 8.0** (Relational Data Storage)
- **Persistence**: Spring Data JPA & Hibernate 6.2.13.Final
- **AI Integration**: Groq API (Llama 3.1 8B) for smart assistance
- **Build Tool**: Apache Maven

### ⚛️ Frontend (Client Layer)
- **Framework**: **React 18.2.0**
- **Styling**: Tailwind CSS 3.2.7 & PostCSS
- **Communication**: Axios 1.3.4 (REST API & Proxy Support)
- **Accessibility**: Voice assistant (Speech-to-Text) & Multilingual support
- **Camera**: WebRTC integration via `react-webcam`

### 🐍 Facial Recognition (ML Layer)
- **Environment**: **Python 3.10** (Flask Microservice)
- **Algorithms**: Local Binary Pattern (LBP) Histogram comparison
- **Computer Vision**: OpenCV 4.12.0 & dlib-bin 19.24.6
- **ML Models**: `face-recognition` (HOG/CNN based feature mapping)
- **Data**: Biometric vectors (128-d embeddings for identity match)

## Project Structure

```
SecureVote/
├── backend/                 # Spring Boot application
│   ├── src/main/java/com/securevote/
│   │   ├── models/         # JPA entities
│   │   ├── controllers/    # REST API endpoints
│   │   ├── services/       # Business logic
│   │   ├── repositories/   # Database access
│   │   ├── utils/          # Helper utilities
│   │   └── config/         # Configuration classes
│   └── resources/          # Application properties
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API service layer
│   │   ├── contexts/       # React contexts
│   │   └── App.js          # Main application
│   └── public/             # Static assets
├── face_recognition/       # Python face recognition service
│   ├── face_service.py     # Flask application
│   └── requirements.txt    # Python dependencies
├── database/               # Database scripts
│   └── models.sql         # Database schema
└── README.md              # This file
```

## Installation & Setup

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- Python 3.8+
- Node.js 16+
- SQLite (or PostgreSQL for production)
- Git

### Manual Tasks List (User Requirements)

1. **Install System Dependencies**:
   ```bash
   # Install CMake for dlib (face_recognition dependency)
   # Ubuntu/Debian:
   sudo apt-get install cmake
   
   # macOS:
   brew install cmake
   
   # Windows: Download from https://cmake.org/download/
   ```

2. **Create Project Directory**:
   ```bash
   mkdir securevote
   cd securevote
   ```

3. **Install Python Dependencies**:
   ```bash
   cd face_recognition
   pip install -r requirements.txt
   # Note: dlib installation might take 10-15 minutes
   ```

4. **Create Uploads Directory**:
   ```bash
   mkdir -p backend/uploads
   mkdir -p images/party_symbols
   ```

5. **Allow Camera Permissions**:
   - When prompted by the browser, allow camera access for face capture
   - Test camera functionality before registration

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Maven dependencies**:
   ```bash
   mvn clean install
   ```

3. **Run the Spring Boot application**:
   ```bash
   mvn spring-boot:run
   ```

The backend will start on `http://localhost:8080`

### Face Recognition Service Setup

1. **In a new terminal, navigate to face_recognition directory**:
   ```bash
   cd face_recognition
   ```

2. **Run the Python Flask service**:
   ```bash
   python face_service.py
   ```

The face recognition service will start on `http://localhost:5000`

### Frontend Setup

1. **In a new terminal, navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the React development server**:
   ```bash
   npm start
   ```

The frontend will start on `http://localhost:3000`

### Database Setup

1. **Initialize the database**:
   ```bash
   # The database will be created automatically when Spring Boot starts
   # Located at: backend/securevote.db
   ```

2. **Verify database initialization**:
   - Check console logs for successful database connection
   - Sample data will be inserted automatically

## Usage Guide

### Admin Access
- **Username**: `election_admin`
- **Password**: `admin123`
- **Login URL**: `http://localhost:3000/login`

### Voter Registration
1. Navigate to `http://localhost:3000/register`
2. Fill in all required personal information
3. Capture face image using webcam
4. Submit registration form
5. Wait for admin verification

### Voter Login & Voting
1. Navigate to `http://localhost:3000/login`
2. Enter EPIC or Aadhaar number
3. Request OTP (check backend console for demo OTP)
4. Capture face for verification
5. Select candidate and cast vote
6. System auto-logs out after voting

### Admin Dashboard Features
- **Overview**: Real-time election statistics
- **Voter Management**: View and manage all voters
- **Verification**: Approve pending voter registrations
- **Results**: View live and final election results
- **Election Control**: Start/end election periods

## Security Considerations

### Production Deployment
1. **Change default credentials** immediately
2. **Use HTTPS** for all communications
3. **Configure proper CORS** settings
4. **Implement rate limiting** for API endpoints
5. **Use PostgreSQL** instead of SQLite for production
6. **Configure JWT secret** with strong random value
7. **Implement proper OTP delivery** (SMS/email service)
8. **Add input validation** and sanitization
9. **Configure firewall rules** for face recognition service
10. **Regular security audits** and dependency updates

### Data Privacy
- Face encodings are stored securely in database
- No raw biometric images stored permanently
- Audit logs maintained for compliance
- GDPR/privacy law compliance features included

## Troubleshooting

### Common Issues

1. **Face Recognition Service Not Starting**:
   - Ensure CMake is installed
   - Check Python dependencies
   - Verify port 5000 is available

2. **Camera Not Working**:
   - Check browser permissions
   - Ensure HTTPS for production
   - Test with different browsers

3. **Database Connection Issues**:
   - Verify SQLite JDBC driver
   - Check file permissions
   - Ensure database file is writable

4. **CORS Errors**:
   - Check backend CORS configuration
   - Verify frontend API URLs
   - Ensure proper headers are set

### Performance Optimization
- Use connection pooling for database
- Implement caching for frequently accessed data
- Optimize face recognition model loading
- Use CDN for static assets in production

## Future Enhancements
- Blockchain integration for vote immutability
- SMS gateway integration for real OTP delivery
## Accessibility Improvements
- **Multilingual Voice Widget**: Guided voting process for differently-abled/elderly users.
- **Regional Languages**: Support for Hindi and Telugu alongside English.
- **Fuzzy Search**: Voice commands are matched against candidate names using Levenshtein distance.

## License
This project is created for educational purposes. Please ensure compliance with local election laws and regulations before any production use.

## Support
For issues and questions:
1. Check the troubleshooting section
2. Review console logs for error messages
3. Verify all services are running
4. Check network connectivity between components

## Acknowledgments
- Indian Election Commission for guidelines
- Open source communities for libraries and tools
- Contributors and testers