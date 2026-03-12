# SecureVote - Indian Smart Voting System Architecture

## System Overview
A comprehensive web-based voting system with facial recognition authentication, designed specifically for Indian elections with constituency-based voting and NOTA options.

## Architecture Components

### 1. Backend Layer (Spring Boot)
- **Authentication Service**: JWT-based authentication with facial recognition
- **Voter Service**: Registration, profile management, voting eligibility
- **Candidate Service**: Candidate management, constituency mapping
- **Vote Service**: Secure vote casting and tallying
- **Admin Service**: Election management, results calculation
- **Face Recognition Service**: Biometric inference microservice with LBP liveness
- **Voice Assistant Service**: Multilingual accessibility layer with fuzzy matching

### 2. Database Layer
- **SQLite**: Primary persistent relational storage
- **Tables**: Voters, Candidates, Parties, Constituencies, Votes, Face Encodings

### 3. Frontend Layer (React + Tailwind CSS)
- **Registration Component**: User signup with webcam integration
- **Authentication Component**: Face-based login with OTP verification
- **Voting Interface**: Ballot display with candidate selection
- **Admin Dashboard**: Election management and results

### 4. AI/ML Integration
- **LBP Liveness Detection**: Texture-based anti-spoofing logic
- **Face Encoding Storage**: 128-dimensional dlib vector storage in database
- **Quality Guard**: CLAHE enhancement and Laplacian blur detection
- **Voice Integration**: Web Speech API with Levenshtein fuzzy logic

## Security Features
- Password hashing with BCrypt
- JWT token-based authentication
- Facial recognition biometric verification
- OTP-based two-factor authentication
- Session management with secure logout
- Vote immutability and audit trail

## Data Flow
1. User Registration → Face Capture → Encoding Storage
2. Login → Face Verification → OTP → JWT Token
3. Voting → Eligibility Check → Ballot Display → Vote Cast → Logout
4. Admin Login → Dashboard → Election Management → Results

## Indian Election Compliance
- 18+ age validation
- Constituency-based voting restrictions
- NOTA option implementation
- Single vote per voter enforcement
- Immutable vote recording