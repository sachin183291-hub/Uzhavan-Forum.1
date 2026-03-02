#!/bin/bash
# Smart Irrigation System - Quick Start Script

echo "╔════════════════════════════════════════════════════════════╗"
echo "║     Smart Irrigation System - Quick Setup Script           ║"
echo "║     React + Node.js + ESP32 IoT Platform                   ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}STEP 1: Checking Node.js installation...${NC}"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓ Node.js ${NODE_VERSION} found${NC}"
else
    echo -e "${RED}✗ Node.js not found! Please install Node.js 16+${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}STEP 2: Installing dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
else
    echo -e "${RED}✗ Failed to install dependencies${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}STEP 3: Configuration files${NC}"
echo -e "${YELLOW}Files created:${NC}"
echo "  • pages/SmartIrrigation.tsx         - React UI component"
echo "  • server.js                         - Node.js API server"
echo "  • utils/smartIrrigationApi.ts       - API client library"
echo "  • ESP32_SENSOR_CODE_ENHANCED.ino    - Arduino firmware"
echo "  • SMART_IRRIGATION_SETUP.md         - Full setup guide"
echo "  • INTEGRATION_GUIDE.md              - Integration instructions"

echo ""
echo -e "${BLUE}STEP 4: Checking .env.local configuration${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✓ .env.local exists${NC}"
    grep "GEMINI_API_KEY" .env.local > /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}  ✓ GEMINI_API_KEY configured${NC}"
    else
        echo -e "${YELLOW}  ⚠ GEMINI_API_KEY not set${NC}"
    fi
else
    echo -e "${YELLOW}⚠ .env.local not found - creating template...${NC}"
    cat > .env.local << 'EOF'
GEMINI_API_KEY=your_api_key_here
VITE_API_URL=http://localhost:5000/api
VITE_HARDWARE_IP=10.57.97.215
NODE_ENV=development
EOF
    echo -e "${YELLOW}  Please add your GEMINI_API_KEY to .env.local${NC}"
fi

echo ""
echo -e "${BLUE}STEP 5: Hardware configuration${NC}"
echo -e "${YELLOW}Before starting, configure:${NC}"
echo "  1. ESP32 WiFi credentials in ESP32_SENSOR_CODE_ENHANCED.ino"
echo "  2. Hardware IP: 10.57.97.215 (update in server.js if different)"
echo "  3. Relay GPIO pin: 26 (update in .ino file if different)"
echo "  4. Soil sensor pin: 34 (update in .ino file if different)"

echo ""
echo -e "${GREEN}✓ Setup complete!${NC}"
echo ""
echo -e "${BLUE}NEXT STEPS:${NC}"
echo ""
echo "1. Start the development servers:"
echo -e "   ${YELLOW}npm run dev:all${NC}              (Frontend + Backend)"
echo "   or"
echo "   ${YELLOW}npm run dev${NC}                   (Frontend only on port 3000)"
echo "   ${YELLOW}npm run dev:server${NC}            (Backend only on port 5000)"
echo ""
echo "2. Access the application:"
echo -e "   ${YELLOW}http://localhost:3000/axis-login${NC}     - AXIS Login"
echo -e "   ${YELLOW}http://localhost:3000/smart-irrigation${NC} - Smart Irrigation Dashboard"
echo ""
echo "3. Upload Arduino firmware:"
echo -e "   ${YELLOW}ESP32_SENSOR_CODE_ENHANCED.ino${NC}"
echo ""
echo "4. Test the APIs:"
echo -e "   ${YELLOW}curl http://localhost:5000/api/health${NC}"
echo ""
echo "5. Read the documentation:"
echo -e "   ${YELLOW}SMART_IRRIGATION_SETUP.md${NC}    - Complete setup guide"
echo -e "   ${YELLOW}INTEGRATION_GUIDE.md${NC}        - Integration with your app"
echo ""
echo -e "${GREEN}For detailed setup instructions, see SMART_IRRIGATION_SETUP.md${NC}"
