# 📖 SecureVote - Operation Guide (A to Z)

This guide provides step-by-step instructions on how to set up, run, and properly shut down the SecureVote system.

---

## 🏗️ Phase 1: Prerequisites
Ensure the following software is installed on your system:
1.  **Java 17 (LTS)**: To run the Spring Boot backend.
2.  **Node.js v18+**: To run the React frontend.
3.  **Python 3.10+**: To run the face recognition microservice.
4.  **MySQL Server 8.0**: To store voting data.
5.  **Maven**: For backend dependency management.

---

## 🛠️ Phase 2: One-Time Setup

### 1. Database Configuration
1.  Open your MySQL terminal or Workbench.
2.  Create a database named `securevote`:
    ```sql
    CREATE DATABASE securevote;
    ```
3.  (Optional) Run `models.sql` if you want to pre-load any schema, though Spring Boot's `ddl-auto=update` will handle table creation automatically.

### 2. Backend Configuration
1.  Navigate to `backend/src/main/resources/application.properties`.
2.  Update the `spring.datasource.password` and `spring.datasource.username` with your MySQL credentials.

---

## 🚀 Phase 3: Starting the Servers (The Order Matters)

Follow this sequence to ensure proper communication between services:

### Step 1: Start the Face Recognition Service
1.  Open a new terminal.
2.  Navigate to the `face_recognition/` directory.
3.  Activate the virtual environment:
    ```powershell
    .venv\Scripts\activate
    ```
4.  Run the service:
    ```powershell
    python face_service.py
    ```
    *   *Port: 5000*

### Step 2: Start the Backend (Spring Boot)
1.  Open a new terminal.
2.  Navigate to the `backend/` directory.
3.  Run the application using Maven:
    ```powershell
    mvn spring-boot:run
    ```
    *   Wait until you see `Started SecureVoteApplication` in the logs.
    *   *Port: 9090*

### Step 3: Start the Frontend (React)
1.  Open a new terminal.
2.  Navigate to the `frontend/` directory.
3.  Start the development server:
    ```powershell
    npm start
    ```
    *   This will automatically open your browser at [http://localhost:3000](http://localhost:3000).

---

## 🗳️ Phase 4: Using the Application
1.  **Admin Login**: Use `election_admin` / `admin123`.
2.  **Voter Registration**: Register a new voter via the Admin portal and capture their face data.
3.  **Voter Login**: Select "Voter" mode, enter EPIC Number, enter OTP (found in the backend console for demo), and complete facial verification.

---

## 🛑 Phase 5: Ending the Application (The Proper Way)

To stop the servers safely:

1.  **Stop Frontend**: Go to the frontend terminal and press `Ctrl + C`, then type `Y`.
2.  **Stop Backend**: Go to the backend terminal and press `Ctrl + C`. (It may take a few seconds to shut down gracefully).
3.  **Stop Face Service**: Go to the face service terminal and press `Ctrl + C`.

### ⚠️ Force Cleanup (If servers hang)
If you encounter "Port already in use" errors:
- **Windows**: Run this in PowerShell as Administrator:
  ```powershell
  Stop-Process -Name "java", "node", "python" -Force
  ```
- **Linux/Mac**:
  ```bash
  killall -9 java node python
  ```

---

## ✅ Troubleshooting Check
| Issue | Solution |
| :--- | :--- |
| **Port 9090 Busy** | Run the Force Cleanup command above. |
| **Face Service Fail** | Ensure `scikit-image` is installed in `.venv`. |
| **Login Error 500** | Check if MySQL is running and DB `securevote` exists. |
