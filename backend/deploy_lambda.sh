#!/bin/bash

# Deploy script for AWS Lambda with Docker
# This script uses Docker to build a Lambda-compatible deployment package
# that will work on Linux x86_64 architecture

set -e  # Exit on error

echo "🚀 Starting Lambda deployment package build..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
PACKAGE_DIR="$BUILD_DIR/package"
ZIP_FILE="$SCRIPT_DIR/lambda-deployment.zip"

# Clean up old build artifacts
echo "🧹 Cleaning up old build artifacts..."
rm -rf "$BUILD_DIR"
rm -f "$ZIP_FILE"
mkdir -p "$PACKAGE_DIR"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Error: Docker is not running or not installed${NC}"
    echo "Please start Docker Desktop and try again."
    exit 1
fi

echo -e "${GREEN}✅ Docker is running${NC}"
echo ""

# Use Docker to install dependencies in a Linux environment
echo "🐳 Using Docker to install dependencies in Linux x86_64 environment..."
echo ""

# Build a temporary directory in the container and install dependencies
CONTAINER_NAME="lambda-build-$(date +%s)"

docker run \
    --platform linux/amd64 \
    --name "$CONTAINER_NAME" \
    -v "$SCRIPT_DIR:/work" \
    -w /work \
    python:3.12-slim \
    sh -c "
        pip install --no-cache-dir -r requirements.txt -t /work/build/package &&
        echo 'Dependencies installed successfully'
    " || {
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    docker rm "$CONTAINER_NAME" 2>/dev/null || true
    exit 1
}

# Remove the container
docker rm "$CONTAINER_NAME" > /dev/null

echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Copy your application Python files
echo "📝 Copying application code..."
cp "$SCRIPT_DIR"/*.py "$PACKAGE_DIR/"

echo -e "${GREEN}✅ Application code copied${NC}"
echo ""

# Clean up unnecessary files
echo "🧹 Cleaning up unnecessary files..."
cd "$PACKAGE_DIR"

# Remove test files, cache directories, and binaries not needed
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.so" -path "*/cpython-3*darwin.so" -delete 2>/dev/null || true

# Remove unnecessary binaries for Mac (keep Linux binaries)
find . -type d -name "bin" -not -path "*/.*" | while read -r bindir; do
    # Keep only essential binaries or remove the whole bin directory
    if [ -d "$bindir" ]; then
        rm -rf "$bindir"
    fi
done

# Remove development files
rm -f *.py.bak *.py~ *.orig 2>/dev/null || true

cd "$SCRIPT_DIR"

echo ""

# Create the zip file
echo "📦 Creating deployment zip file..."
cd "$PACKAGE_DIR"
zip -r "$ZIP_FILE" . > /dev/null
cd "$SCRIPT_DIR"

echo -e "${GREEN}✅ Deployment package created${NC}"
echo ""

# Display package size
PACKAGE_SIZE=$(du -h "$ZIP_FILE" | cut -f1)
echo "📊 Package size: $PACKAGE_SIZE"
echo "📍 Location: $ZIP_FILE"
echo ""

# Show what's included (top level only for a summary)
echo "📋 Top-level files in package:"
ls -lh "$PACKAGE_DIR" | grep "^-" | head -20 | awk '{print "   "$9, "("$5")"}'
if [ "$(ls -lh "$PACKAGE_DIR" | grep "^-" | wc -l)" -gt 20 ]; then
    echo "   ... and more files"
fi
echo ""

# Clean up build directory
echo "🧹 Cleaning up build directory..."
rm -rf "$BUILD_DIR"

echo ""
echo -e "${GREEN}🎉 Deployment package ready!${NC}"
echo ""
echo "📋 Next steps:"
echo "   1. Go to AWS Lambda Console"
echo "   2. Create a new function (Python 3.12, x86_64)"
echo "   3. Upload lambda-deployment.zip"
echo "   4. Set handler to: lambda_handler.handler"
echo "   5. Configure environment variables (OPENAI_API_KEY, DASHSCOPE_API_KEY, etc.)"
echo "   6. Set timeout to 30 seconds"
echo "   7. Set memory to 512 MB"
echo "   8. Create Function URL"
echo ""
