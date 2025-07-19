# Court Booking System

A REST API-based court booking system built with TypeScript, Express.js, Prisma ORM, and PostgreSQL. The system provides user authentication, court management, and booking functionality.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running the API](#running-the-api)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
    - [Authentication Endpoints](#authentication-endpoints)
    - [Court Endpoints](#court-endpoints)
- [Data Validation](#data-validation)
- [Error Handling](#error-handling)
- [Architecture](#architecture)

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- npm package manager

## Installation & Setup

### 1. Navigate to API directory
```
cd ~/apps/api
```
### 2. Install dependencies
```
npm install
```
### 3. Environment Configuration
Create a `.env` file in the `~/apps/api` directory with the following variables:
```
CORS_ORIGIN=
PORT=
DATABASE_URL=
JWT_SECRET=
```
### 4. Database Setup
Generate Prisma client:
```
npx prisma generate
```
Run database migrations:
```
npx prisma migrate dev
```
Seed the database:
```
npm run seed
```
## Running the API

### Development Mode
```
bash npm run dev
```
The API server will be running on `http://localhost:3000` (or the port specified in your environment variables).

## Database Schema

The system uses the following main entities:

### User
- **id**: Auto-increment primary key
- **name**: String (4-50 characters)
- **email**: Unique email address
- **password_hash**: Encrypted password
- **role**: USER | ADMIN (default: USER)
- **refresh_token**: JWT refresh token
- **bookings**: Relationship to user's bookings

### Court
- **id**: Auto-increment primary key
- **name**: Court name (max 100 characters)
- **location**: Court location (max 255 characters)
- **status**: AVAILABLE | MAINTENANCE | CLOSED (default: AVAILABLE)
- **bookings**: Relationship to court bookings

### Booking
- **id**: Auto-increment primary key
- **userId**: Foreign key to User
- **courtId**: Foreign key to Court
- **startTime**: Booking start datetime
- **endTime**: Booking end datetime
- **status**: PENDING | CONFIRMED | CANCELLED | COMPLETED (default: PENDING)

## API Documentation

### Authentication Endpoints

#### Register User
```
POST /auth/register
```


**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```


**Validation Rules:**
- `name`: 4-50 characters required
- `email`: Valid email format required
- `password`: 5-100 characters required

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User created successfully"
}
```


**Validation Error Response (400):**
```json
{
  "status": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be atleast 4 characters"
    }
  ]
}
```


#### Login User
```
POST /auth/login
```


**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```


**Success Response (200):**
```json
{
  "status": "success",
  "message": "User logged in successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "USER",
      "refresh_token": "jwt-token-here"
    }
  }
}
```


Sets an HTTP-only cookie named `jwt` with the authentication token.

#### Logout User
```
POST /auth/logout
```

**Authentication Required:** Bearer JWT token

**Success Response (200):**
```json
{}
```


Clears the `jwt` cookie.

#### Get Current User
```
GET /auth/me
```

**Authentication Required:** Bearer JWT token

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```


### Court Endpoints

#### Get All Courts
```
GET /courts
```


Returns all courts with today's bookings included.

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "courts": [
      {
        "id": 1,
        "name": "Court A",
        "location": "Building 1, Floor 2",
        "status": "AVAILABLE",
        "bookings": [
          {
            "id": 1,
            "userId": 1,
            "courtId": 1,
            "startTime": "2024-01-01T09:00:00.000Z",
            "endTime": "2024-01-01T10:00:00.000Z",
            "status": "CONFIRMED"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```


#### Get Single Court
```
GET /courts/:courtId
```


**Parameters:**
- `courtId`: Court ID (integer)

Returns a specific court with today's bookings included.

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "court": {
      "id": 1,
      "name": "Court A",
      "location": "Building 1, Floor 2",
      "status": "AVAILABLE",
      "bookings": [],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```


**Not Found Response (404):**
```json
{
  "status": "error",
  "message": "Court not found"
}
```


#### Get Court Bookings
```
GET /courts/:courtId/bookings?date=2024-01-01
```


**Parameters:**
- `courtId`: Court ID (integer)

**Query Parameters:**
- `date` (optional): Specific date in YYYY-MM-DD format. If not provided, returns all bookings.

**Success Response (200):**
```json
{
  "status": "success",
  "data": {
    "bookings": [
      {
        "id": 1,
        "userId": 1,
        "courtId": 1,
        "startTime": "2024-01-01T09:00:00.000Z",
        "endTime": "2024-01-01T10:00:00.000Z",
        "status": "CONFIRMED",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```


## Data Validation

The API uses Zod for request validation:

### User Registration Validation
- **name**: Required, 4-50 characters
- **email**: Required, valid email format
- **password**: Required, 5-100 characters

Validation errors return detailed field-specific error messages with HTTP status 400.

## Error Handling

### Common Error Response Format

```json
{
  "status": "error",
  "message": "Error description"
}
```


### HTTP Status Codes
- **200**: Success
- **201**: Created successfully
- **400**: Bad request / Validation error
- **401**: Unauthorized
- **404**: Resource not found
- **500**: Internal server error

## Architecture

### Project Structure
```
~/apps/api/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.ts      # Authentication logic
│   │   ├── court.controller.ts     # Court management logic
│   │   └── user.controller.ts      # User management logic
│   ├── routes/
│   │   ├── auth.router.ts          # Authentication routes
│   │   ├── court.router.ts         # Court routes
│   │   └── user.router.ts          # User routes
│   ├── services/
│   │   ├── court.service.ts        # Court business logic
│   │   └── user.service.ts         # User & auth business logic
│   ├── utils/
│   │   └── validation.ts           # Zod validation schemas
│   └── libs/
│       └── prisma/                 # Generated Prisma client
├── prisma/
│   └── schema.prisma               # Database schema
└── package.json
```


### Authentication
- JWT-based authentication with Passport.js
- HTTP-only cookies for token storage
- Refresh token system for persistent sessions
- Password hashing using bcrypt