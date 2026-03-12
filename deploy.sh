#!/bin/bash

echo "🗳️  SecureVote - Indian Smart Voting System Deployment"
echo "======================================================"

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command_exists java; then
    echo "❌ Java 17+ is required but not installed."
    echo "Please install Java 17 or higher and try again."
    exit 1
fi

if ! command_exists python3; then
    echo "❌ Python 3.8+ is required but not installed."
    echo "Please install Python 3.8 or higher and try again."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js 16+ is required but not installed."
    echo "Please install Node.js 16 or higher and try again."
    exit 1
fi

if ! command_exists mvn; then
    echo "❌ Maven is required but not installed."
    echo "Please install Maven and try again."
    exit 1
fi

echo "✅ All prerequisites are installed"

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p backend/uploads
mkdir -p images/party_symbols
mkdir -p logs

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
cd face_recognition
if [ -f "requirements.txt" ]; then
    echo "Installing Python packages (this may take 10-15 minutes)..."
    pip3 install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Python dependencies"
        echo "Please install manually: pip3 install -r requirements.txt"
        exit 1
    fi
    echo "✅ Python dependencies installed"
else
    echo "⚠️  requirements.txt not found in face_recognition directory"
fi
cd ..

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
cd frontend
if [ -f "package.json" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Node.js dependencies"
        echo "Please install manually: npm install"
        exit 1
    fi
    echo "✅ Node.js dependencies installed"
else
    echo "⚠️  package.json not found in frontend directory"
fi
cd ..

# Create database initialization script
echo "🗄️  Setting up database..."
if [ -f "database/models.sql" ]; then
    echo "Database schema ready for initialization"
    echo "The database will be created automatically when Spring Boot starts"
else
    echo "⚠️  Database schema file not found"
fi

# Create environment file
echo "⚙️  Creating environment configuration..."
cat > .env << EOF
# Backend Configuration
SPRING_PORT=8080
SPRING_PROFILES_ACTIVE=dev

# Face Recognition Service
FACE_SERVICE_PORT=5000

# Frontend Configuration
REACT_APP_API_URL=http://localhost:8080
REACT_APP_FACE_SERVICE_URL=http://localhost:5000

# Database Configuration
DB_URL=jdbc:sqlite:securevote.db
DB_DRIVER=org.sqlite.JDBC

# Security Configuration
JWT_SECRET=your-secret-key-change-this-in-production
JWT_EXPIRATION=86400000
EOF

echo "✅ Environment configuration created"

# Create startup scripts
echo "🚀 Creating startup scripts..."

# Backend startup script
cat > start-backend.sh << 'EOF'
#!/bin/bash
echo "Starting Spring Boot Backend..."
cd backend
mvn spring-boot:run > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid
echo "Backend started with PID: $BACKEND_PID"
echo "Backend logs: logs/backend.log"
cd ..
EOF

# Face recognition startup script
cat > start-face-service.sh << 'EOF'
#!/bin/bash
echo "Starting Face Recognition Service..."
cd face_recognition
python3 face_service.py > ../logs/face-service.log 2>&1 &
FACE_PID=$!
echo $FACE_PID > ../logs/face-service.pid
echo "Face service started with PID: $FACE_PID"
echo "Face service logs: logs/face-service.log"
cd ..
EOF

# Frontend startup script
cat > start-frontend.sh << 'EOF'
#!/bin/bash
echo "Starting React Frontend..."
cd frontend
npm start > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid
echo "Frontend started with PID: $FRONTEND_PID"
echo "Frontend logs: logs/frontend.log"
cd ..
EOF

# Make startup scripts executable
chmod +x start-backend.sh start-face-service.sh start-frontend.sh

# Create stop script
cat > stop-all.sh << 'EOF'
#!/bin/bash
echo "Stopping all services..."

if [ -f "logs/backend.pid" ]; then
    kill $(cat logs/backend.pid) 2>/dev/null
    echo "Backend stopped"
fi

if [ -f "logs/face-service.pid" ]; then
    kill $(cat logs/face-service.pid) 2>/dev/null
    echo "Face service stopped"
fi

if [ -f "logs/frontend.pid" ]; then
    kill $(cat logs/frontend.pid) 2>/dev/null
    echo "Frontend stopped"
fi

echo "All services stopped"
EOF

chmod +x stop-all.sh

# Create status check script
cat > status.sh << 'EOF'
#!/bin/bash
echo "Checking service status..."

echo "Backend:"
if pgrep -f "spring-boot" > /dev/null; then
    echo "  ✅ Running"
else
    echo "  ❌ Stopped"
fi

echo "Face Recognition Service:"
if pgrep -f "face_service.py" > /dev/null; then
    echo "  ✅ Running"
else
    echo "  ❌ Stopped"
fi

echo "Frontend:"
if pgrep -f "react-scripts" > /dev/null; then
    echo "  ✅ Running"
else
    echo "  ❌ Stopped"
fi
EOF

chmod +x status.sh

echo "✅ Startup scripts created"

# Create quick start script
cat > quick-start.sh << 'EOF'
#!/bin/bash
echo "🚀 Starting SecureVote System..."
echo "This will start all three services in the background"
echo ""

# Check if services are already running
if pgrep -f "spring-boot" > /dev/null || pgrep -f "face_service.py" > /dev/null || pgrep -f "react-scripts" > /dev/null; then
    echo "⚠️  Some services are already running."
    echo "Use ./status.sh to check status or ./stop-all.sh to stop all services first."
    exit 1
fi

# Start all services
./start-backend.sh &
sleep 10

./start-face-service.sh &
sleep 5

./start-frontend.sh &
sleep 5

echo ""
echo "🎉 SecureVote System is starting up!"
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8080"
echo "🤖 Face Service: http://localhost:5000"
echo ""
echo "📋 Default Admin Login:"
echo "   Username: election_admin"
echo "   Password: admin123"
echo ""
echo "📝 Use ./status.sh to check service status"
echo "🛑 Use ./stop-all.sh to stop all services"
echo "📜 Check logs/ directory for detailed logs"
EOF

chmod +x quick-start.sh

echo ""
echo "🎉 Deployment setup complete!"
echo ""
echo "📋 Quick Start Guide:"
echo "1. Run ./quick-start.sh to start all services"
echo "2. Open http://localhost:3000 in your browser"
echo "3. Register as a new voter or login as admin"
echo "4. Allow camera permissions when prompted"
echo ""
echo "🔧 Available Commands:"
echo "  ./quick-start.sh    - Start all services"
echo "  ./stop-all.sh       - Stop all services"
echo "  ./status.sh         - Check service status"
echo "  ./start-backend.sh  - Start only backend"
echo "  ./start-frontend.sh - Start only frontend"
echo "  ./start-face-service.sh - Start only face service"
echo ""
echo "📁 Important Files:"
echo "  logs/               - Service logs"
echo "  .env               - Environment configuration"
echo "  securevote.db      - SQLite database file"
echo ""
echo "⚠️  Important Notes:"
echo "- First time setup may take 10-15 minutes due to Python package installation"
echo "- Check console logs for OTP during voter login (demo mode)"
echo "- Ensure camera permissions are granted in browser"
echo "- Use admin credentials: election_admin / admin123"
echo ""
echo "🛠️  Troubleshooting:"
echo "- If face recognition fails, check that CMake is installed"
echo "- If services don't start, check logs in logs/ directory"
echo "- If camera doesn't work, check browser permissions"
echo "- For database issues, delete securevote.db and restart"
EOF

chmod +x deploy.sh

echo ""
echo "✅ Deployment script created successfully!"
echo ""
echo "🚀 To deploy and start the SecureVote system:"
echo "  1. Run: ./deploy.sh"
echo "  2. Follow the on-screen instructions"
echo "  3. Use ./quick-start.sh to start all services"
echo ""
echo "📖 For detailed instructions, see README.md"