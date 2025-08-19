# HairCareLog Backend

This is the backend API for the HairCareLog application, built with Node.js, Express, and MongoDB.

## Features

- RESTful API endpoints for hair care logging
- User authentication and authorization
- Report generation
- Email notifications
- Scheduled jobs for reminders
- Stripe integration for payments

## Prerequisites

- Node.js (v16 or higher)
- MongoDB
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

- `GET /test` - Health check
- `GET /api/logs` - Get all logs
- `POST /api/logs` - Create a new log
- `GET /api/reports` - Generate reports

## Project Structure

```
backend/
├── config/          # Database and other configurations
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── models/          # MongoDB models
├── routes/          # API routes
├── services/        # Business logic services
├── utils/           # Utility functions
├── jobs/            # Scheduled jobs
├── templates/       # Email templates
├── app.js           # Express app configuration
└── index.js         # Server entry point
```

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon "# loggerbackend" 
