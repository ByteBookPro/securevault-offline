# SecureVault Offline - Setup Guide

This comprehensive setup guide will help you get SecureVault Offline running in your development environment, whether you're contributing to the project or setting it up for your own use.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Detailed Installation](#detailed-installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Development Tools](#development-tools)
- [Production Deployment](#production-deployment)
- [Docker Setup](#docker-setup)
- [Browser Extension](#browser-extension)
- [Troubleshooting](#troubleshooting)
- [Next Steps](#next-steps)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Git**: Version 2.20.0 or higher ([Download](https://git-scm.com/))
- **Modern Browser**: Chrome 80+, Firefox 75+, Safari 14+, or Edge 80+

### Development Environment (Recommended)

- **Visual Studio Code** with the following extensions:
  - TypeScript and JavaScript Language Features
  - ES7+ React/Redux/React-Native snippets
  - Tailwind CSS IntelliSense
  - Prettier - Code formatter
  - ESLint
  - GitLens
- **Terminal**: Use your preferred terminal or VS Code's integrated terminal

### Verify Prerequisites

Run these commands to verify your setup:

```bash
# Check Node.js version
node --version
# Should output v18.0.0 or higher

# Check npm version  
npm --version
# Should output 8.0.0 or higher

# Check Git version
git --version
# Should output 2.20.0 or higher
```

## Quick Start

Get up and running in 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/securevault-offline.git
cd securevault-offline

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open your browser
# Navigate to http://localhost:5000
```

That's it! Your SecureVault should now be running locally. 🎉

## Detailed Installation

### Step 1: Clone the Repository

```bash
# Clone via HTTPS
git clone https://github.com/yourusername/securevault-offline.git

# Or clone via SSH (if you have SSH keys set up)
git clone git@github.com:yourusername/securevault-offline.git

# Navigate to project directory
cd securevault-offline
```

### Step 2: Install Dependencies

SecureVault uses npm for dependency management:

```bash
# Install all dependencies (client, server, and shared)
npm install

# This will install:
# - React and related libraries
# - TypeScript and build tools
# - UI components (shadcn/ui, Radix UI)
# - Styling (Tailwind CSS)
# - Backend dependencies (Express, etc.)
```

**Note**: The installation may take 2-5 minutes depending on your internet connection.

### Step 3: Environment Setup

Create environment files for configuration:

```bash
# Copy the example environment file
cp .env.example .env

# Edit the environment file
nano .env  # or use your preferred editor
```

### Step 4: Verify Installation

```bash
# Check if all dependencies installed correctly
npm list --depth=0

# Run type checking
npm run type-check

# Run linting
npm run lint
```

### Step 5: Start Development Server

```bash
# Start the development server
npm run dev

# You should see output similar to:
# > rest-express@1.0.0 dev
# > NODE_ENV=development tsx server/index.ts
# 3:40:15 PM [express] serving on port 5000
```

Open your browser and navigate to `http://localhost:5000` to see SecureVault running.

## Environment Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Development Configuration
NODE_ENV=development
PORT=5000

# Session Management
SESSION_SECRET=your-secure-random-session-secret-min-32-chars

# Database Configuration (Optional)
# Uncomment if you want to use PostgreSQL for user accounts
# DATABASE_URL=postgresql://username:password@localhost:5432/securevault

# Security Settings
ENCRYPTION_ITERATIONS=100000
AUTO_LOCK_MINUTES=15

# Development Settings
ENABLE_LOGGING=true
LOG_LEVEL=info

# PWA Settings
PWA_ENABLED=true
OFFLINE_ENABLED=true
```

### Generating Secure Session Secret

For production or secure development, generate a proper session secret:

```bash
# Generate a secure random string (32+ characters)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Use this output as your SESSION_SECRET
```

### Environment-Specific Configurations

#### Development (.env.development)
```env
NODE_ENV=development
PORT=5000
ENABLE_LOGGING=true
LOG_LEVEL=debug
```

#### Production (.env.production)
```env
NODE_ENV=production
PORT=5000
ENABLE_LOGGING=false
LOG_LEVEL=error
SESSION_SECRET=your-production-secret-here
```

## Database Setup

SecureVault primarily uses IndexedDB for client-side storage, but you can optionally set up PostgreSQL for user account management.

### IndexedDB (Default - No Setup Required)

IndexedDB is automatically available in modern browsers and requires no setup. SecureVault will:

- Create the database on first use
- Handle all encryption/decryption client-side
- Store data only in the user's browser

### PostgreSQL Setup (Optional)

If you want to enable user accounts and server-side features:

#### Using Local PostgreSQL

1. **Install PostgreSQL** on your system
2. **Create a database**:
   ```sql
   CREATE DATABASE securevault;
   CREATE USER securevault_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE securevault TO securevault_user;
   ```
3. **Update your .env file**:
   ```env
   DATABASE_URL=postgresql://securevault_user:secure_password@localhost:5432/securevault
   ```

#### Using Neon Database (Cloud)

1. **Sign up** at [Neon](https://neon.tech)
2. **Create a new project** and database
3. **Copy the connection string** to your `.env`:
   ```env
   DATABASE_URL=postgresql://username:password@ep-cool-cloud-123456.us-east-1.aws.neon.tech/dbname?sslmode=require
   ```

#### Database Schema Setup

Run database migrations to set up the schema:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# Open database studio (optional)
npm run db:studio
```

## Development Tools

### Code Quality Tools

SecureVault includes several tools to maintain code quality:

```bash
# Linting with ESLint
npm run lint          # Check for issues
npm run lint:fix      # Automatically fix issues

# Code formatting with Prettier
npm run format        # Format all code

# TypeScript type checking
npm run type-check    # Verify types across the project

# Run all quality checks
npm run check-all     # Lint, format, and type-check
```

### Testing Setup

Install and run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run specific test file
npm test -- PasswordGenerator.test.ts
```

### Building for Production

Test the production build locally:

```bash
# Create production build
npm run build

# Start production server
npm start

# Or build and start in one command
npm run build && npm start
```

## Production Deployment

### Building for Production

```bash
# Install production dependencies only
npm ci --only=production

# Build the application
npm run build

# Start the production server
NODE_ENV=production npm start
```

### Environment Configuration for Production

Create a `.env.production` file:

```env
NODE_ENV=production
PORT=5000
SESSION_SECRET=your-very-secure-session-secret-here
DATABASE_URL=your-production-database-url
ENABLE_LOGGING=false
LOG_LEVEL=error
```

### Deployment Platforms

#### Vercel Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod
```

#### Railway Deployment
1. Connect your GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy automatically on push

#### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure build and run commands:
   - Build Command: `npm run build`
   - Run Command: `npm start`
3. Set environment variables

## Docker Setup

Run SecureVault in a Docker container:

### Using Docker Compose (Recommended)

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  securevault:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - SESSION_SECRET=your-session-secret
      - DATABASE_URL=postgresql://user:pass@db:5432/securevault
    depends_on:
      - db
    volumes:
      - ./data:/app/data

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=securevault
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

Run with Docker Compose:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Using Docker Only

```bash
# Build the Docker image
docker build -t securevault-offline .

# Run the container
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e SESSION_SECRET=your-session-secret \
  securevault-offline
```

## Browser Extension

The SecureVault browser extension provides auto-fill functionality:

### Building the Extension

```bash
# Navigate to extension directory
cd extension

# Install extension dependencies
npm install

# Build the extension
npm run build

# The built extension will be in the `build` directory
```

### Installing in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `extension/build` directory

### Installing in Firefox

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to `extension/build` and select `manifest.json`

## Troubleshooting

### Common Issues

#### Port 5000 Already in Use

```bash
# Kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=3000 npm run dev
```

#### Node Version Issues

```bash
# Update Node.js using nvm (recommended)
nvm install 18
nvm use 18

# Verify version
node --version
```

#### Database Connection Issues

```bash
# Test database connection
node -e "
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
pool.query('SELECT NOW()', (err, res) => {
  console.log(err ? err.message : 'Database connected successfully');
  process.exit();
});
"
```

#### Dependency Installation Issues

```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Update npm to latest version
npm install -g npm@latest
```

#### Build Issues

```bash
# Clear TypeScript cache
npx tsc --build --clean

# Remove build artifacts
rm -rf dist build

# Rebuild everything
npm run build
```

### Performance Issues

#### Slow Development Server

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Use faster build tool settings
export NODE_ENV=development
npm run dev
```

#### Large Bundle Size

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for unnecessary dependencies
npm run bundle-analyzer
```

### Getting Help

If you encounter issues not covered here:

1. **Check the logs** for detailed error messages
2. **Search existing issues** on GitHub
3. **Create a new issue** with:
   - Your operating system and version
   - Node.js and npm versions
   - Complete error messages
   - Steps to reproduce the problem

## Next Steps

Now that you have SecureVault running:

### For Users
1. **Import your data** using the CSV files in the repository
2. **Set up your vault** with a strong master password
3. **Explore all features**: passwords, subscriptions, notes, expenses
4. **Install the browser extension** for auto-fill functionality

### For Developers
1. **Read the [Architecture Guide](ARCHITECTURE.md)** to understand the codebase
2. **Review [Contributing Guidelines](CONTRIBUTING.md)** for development practices
3. **Set up your development environment** with linting and formatting
4. **Run the test suite** to ensure everything works correctly
5. **Start contributing** by picking up a "good first issue"

### Security Considerations
1. **Use HTTPS** in production (required for PWA features)
2. **Set secure session secrets** (32+ random characters)
3. **Keep dependencies updated** regularly
4. **Enable CSP headers** for additional security
5. **Regular security audits** with `npm audit`

---

**Need more help?** Check out our other documentation files:
- [README.md](README.md) - Project overview and features
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [CONTRIBUTING.md](CONTRIBUTING.md) - Development guidelines

**Have questions?** Join our community:
- [GitHub Discussions](https://github.com/yourusername/securevault-offline/discussions)
- [Discord Server](discord-invite-link)
- Email: support@securevault.app

---

*Last updated: September 2024*