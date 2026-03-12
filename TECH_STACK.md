# 🛡️ SecureVote - Technology Stack

Detailed overview of the technologies, frameworks, and libraries powering the **SecureVote** smart voting system.

---

## 🏗️ Core Architecture
SecureVote follows a **Microservices Architecture** to ensure scalability, security, and separation of concerns.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend** | React.js | Client-side interface & User Experience |
| **Backend** | Spring Boot | Core business logic, Security, & API Gateway |
| **ML Service** | Python (Flask) | High-performance Facial Recognition & Biometrics |
| **Database** | MySQL | Relational data storage for Voters & Candidates |

---

## 🌐 Frontend (React Client)
A modern, responsive dashboard built with **React 18**.

*   **Framework**: [React.js v18.2.0](https://reactjs.org/)
*   **Styling**: [Tailwind CSS v3.2.7](https://tailwindcss.com/) for a premium, custom UI.
*   **Routing**: [React Router v6.8.0](https://reactrouter.com/)
*   **API Client**: [Axios](https://axios-http.com/) for seamless backend communication.
*   **Hardware Integration**:
    *   `react-webcam`: Direct camera access for facial capture.
    *   `react-speech-recognition`: Voice-assisted accessibility features.
*   **Icons**: [Heroicons](https://heroicons.com/)

---

## ☕ Backend (Spring Boot Service)
Robust and secure heart of the system, handling authentication and data management.

*   **Language**: **Java 17** (LTS)
*   **Framework**: [Spring Boot v3.1.5](https://spring.io/projects/spring-boot)
*   **Security**:
    *   **Spring Security**: Role-based access control (Admin/Voter).
    *   **JWT (JJWT)**: Stateless authentication tokens for secure API access.
*   **Persistence**:
    *   **Spring Data JPA**: Abstraction over database operations.
    *   **Hibernate**: High-performance Object-Relational Mapping (ORM).
*   **Database**: [MySQL v8.0](https://www.mysql.com/)
*   **AI Integration**: [Groq Cloud API](https://groq.com/) (Llama 3.1 8B) for intelligent assistance.
*   **Build Tool**: [Apache Maven](https://maven.apache.org/)

---

## 🐍 Facial Recognition Service (Python)
Dedicated microservice for biometric verification using state-of-the-art ML models.

*   **Language**: **Python 3.10**
*   **Web Framework**: [Flask v3.1.2](https://flask.palletsprojects.com/)
*   **Computer Vision & ML**:
    *   `face-recognition`: High-accuracy face detection and encoding.
    *   `dlib`: C++ toolkit for machine learning (backend for face detection).
    *   `OpenCV`: Real-time image preprocessing.
    *   `scikit-image`: Advanced feature extraction (LBP - Local Binary Patterns).
*   **Data Science Stack**:
    *   `NumPy` & `SciPy`: Vectorized matrix operations for biometric comparison.
    *   `Pillow`: Image file manipulation.

---

## 🛠️ Infrastructure & Security
*   **Authentication Flow**: Aadhaar/EPIC Verification → OTP Validation → Facial Biometric Match.
*   **Data Protection**:
    *   Passord Hashing (BCrypt).
    *   Sensitive biometric data stored as 128-d vector embeddings (not raw images).
    *   CORS enabled for secure cross-origin resource sharing.
*   **Development Utilities**:
    *   `.venv` (Python Virtual Environment).
    *   Postman (API Testing).
    *   Git (Version Control).
