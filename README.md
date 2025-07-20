# Table of Contents

1. [Badminton Court Booking System](#badminton-court-booking-system)
   - [Project Overview](#project-overview)
   - [Commercial Value / Third-Party Integration](#commercial-value--third-party-integration)
     - [For Court Operators](#for-court-operators)
     - [For Players/Customers](#for-playerscustomers)
     - [Integration Potential](#integration-potential)
   - [System Architecture](#system-architecture)

2. [Backend Application](#backend-application)
   - [Technology Stack](#technology-stack)
   - [API Documentation](#api-documentation)
     - [Overview](#overview)
     - [Health Check](#health-check)
     - [Auth Endpoints](#auth-endpoints)
     - [Court Endpoints](#court-endpoints)
   - [Data Models](#data-models)
   - [Security](#security)

3. [Frontend Applications](#frontend-applications)
   - [Web Application](#web-application)
   - [Java Application](#java-application)

4. [Database Design](#database-design)

5. [Business Logic and Data Validation](#business-logic-and-data-validation)
   - [User Book Court Flow](#user-book-court-flow)
   - [User Cancel Booking Flow](#user-cancel-booking-flow)
   - [Admin Update Booking Flow](#admin-update-booking-flow)
   - [Data Validation](#data-validation)
     - [Frontend Validation](#frontend-validation)
     - [Backend Validation](#backend-validation)

---

# Badminton Court Booking System

## Project Overview

A comprehensive badminton court booking system designed to streamline and digitize the court reservation process. The platform enables users to view real-time court availability, make instant bookings, and manage their reservations efficiently through a modern web interface.

## Commercial Value / Third-Party Integration

This system addresses a significant market opportunity in the sports facility rental industry, where badminton court operators can modernize their booking operations. Key commercial benefits include:

### For Court Operators:
- Automated booking management reduces manual administrative overhead
- Real-time availability tracking minimizes double-bookings and scheduling conflicts
- Digital payment integration streamlines revenue collection
- Analytics and reporting capabilities provide insights into usage patterns and peak hours

### For Players/Customers:
- Eliminates the traditional hassle of calling or visiting facilities to check availability
- 24/7 booking capability allows reservations outside business hours
- Transparent pricing and instant confirmation improve user experience
- Digital booking history and receipt management

**Integration Potential:**

The system can be integrated with payment gateways, calendar systems, and facility management software, making it suitable for sports complexes, community centers, and commercial badminton facilities looking to enhance their operational efficiency and customer satisfaction.

## System Architecture

![System Architecture](https://github.com/afiqsuradi/bitp3123-project/raw/main/blobs/system_architecture.png)

## Backend Application

### Technology Stack:
1. **Node.js**: JavaScript runtime environment
2. **Express.js**: Minimal web framework for creating REST API
3. **Prisma**: Tools for database migration and Object Relation Mapping (ORM)
4. **Zod**: Data validation and sanitization
5. **TypeScript**: Strongly typed language built on top of JavaScript

### API Documentation

#### Overview

**Base URL:** `https://your-api-domain.com/api`

**Authentication:** JWT (JSON Web Token) based authentication with cookies

The API uses JWT tokens for authentication. After login, the JWT token is stored as an HTTP-only cookie named `jwt` and is automatically included in subsequent requests. For other devices, the token can be added to the Authorization header as follows: `'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE'`.

**Protected Routes:** Routes marked with 🔒 require authentication

---

#### Health Check

**GET /**

Check API health status.

```http
GET /
```

**Success Response (200):**
```json
{
  "message": "API Testing.. OK",
  "environment": "development",
  "timestamp": "2025-07-20T10:30:00.000Z"
}
```

---

#### Auth Endpoints

**POST /api/auth/register**

Register a new user account.

**Request Body Parameters:**
- `name` (string, required): User's full name (4-50 characters)
- `email` (string, required): Valid email address
- `password` (string, required): Password (5-100 characters)

```json
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "password": "password123"
}
```

**Success Response (201):**
```json
{
  "status": "success",
  "message": "User created successfully"
}
```

**POST /api/auth/login**

Login with email and password.

**Request Body Parameters:**
- `email` (string, required): User's email address
- `password` (string, required): User's password

```json
{
  "email": "john.doe@example.com",
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
      "name": "John Doe",
      "email": "john.doe@example.com",
      "role": "USER",
      "createdAt": "2025-07-18T06:34:54.000Z",
      "updatedAt": "2025-07-20T10:30:00.000Z",
      "refresh_token": "jwt_token_here"
    }
  }
}
```

**POST /api/auth/logout 🔒**

Logout the current user.

**GET /api/auth/me 🔒**

Get current authenticated user information.

---

#### Court Endpoints

**GET /api/courts**

Get all available courts with today's bookings.

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
        "createdAt": "2025-07-18T06:34:54.000Z",
        "updatedAt": "2025-07-18T06:34:54.000Z",
        "bookings": [
          {
            "id": 1,
            "userId": 1,
            "courtId": 1,
            "startTime": "2025-07-20T14:00:00.000Z",
            "endTime": "2025-07-20T15:30:00.000Z",
            "status": "CONFIRMED",
            "createdAt": "2025-07-20T08:00:00.000Z",
            "updatedAt": "2025-07-20T08:00:00.000Z"
          }
        ]
      }
    ]
  }
}
```

**GET /api/courts/:courtId**

Get details of a specific court.

**POST /api/courts/:courtId/bookings 🔒**

Create a new booking for a specific court.

**Request Body Parameters:**
- `courtId` (integer, required): Must match URL parameter
- `date` (string, required): Booking date in YYYY-MM-DD format
- `time` (string, required): Booking start time in HH:mm format (24-hour)
- `duration` (integer, required): Booking duration in minutes (30-480, must be in 30-minute intervals)

```json
{
  "courtId": 1,
  "date": "2025-07-21",
  "time": "14:00",
  "duration": 90
}
```

**GET /api/courts/bookings/me 🔒**

Get all bookings for the current authenticated user.

**GET /api/courts/bookings 🔒 (Admin Only)**

Get all bookings with optional filtering (Admin only).

**PUT /api/courts/bookings/:bookingId 🔒**

Update booking status (User can update their own bookings, Admin can update any).

---

#### Data Models

**User:**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "USER", // "USER" | "ADMIN"
  "createdAt": "2025-07-18T06:34:54.000Z",
  "updatedAt": "2025-07-20T10:30:00.000Z"
}
```

**Court:**
```json
{
  "id": 1,
  "name": "Court A",
  "location": "Building 1, Floor 2",
  "status": "AVAILABLE", // "AVAILABLE" | "MAINTENANCE" | "CLOSED"
  "createdAt": "2025-07-18T06:34:54.000Z",
  "updatedAt": "2025-07-18T06:34:54.000Z"
}
```

**Booking:**
```json
{
  "id": 1,
  "userId": 1,
  "courtId": 1,
  "startTime": "2025-07-20T14:00:00.000Z",
  "endTime": "2025-07-20T15:30:00.000Z",
  "status": "PENDING", // "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED"
  "createdAt": "2025-07-20T08:00:00.000Z",
  "updatedAt": "2025-07-20T08:00:00.000Z"
}
```

### Security

JSON Web Token (JWT) is implemented for authentication. The token is signed when a user logs in and returned as part of the login request result. The payload of this JWT token contains user data so the backend system doesn't need to query the database for user data on every request. 

The token can be passed via cookie (httpOnly) or as an authorization header. A copy of the JWT token is also stored in the user database for token invalidation when users decide to logout before the token expires. The token validation middleware first checks if the token is valid, then verifies if the token exists in the database.

## Frontend Applications

### Web Application
**Purpose:** For customers to create accounts and reserve courts

**Technology Stack:**
1. TypeScript
2. React

**API Integration:** The frontend applications communicate with the backend through REST API endpoints using the fetch method. Cross Origin Resource Sharing (CORS) origin is set to the frontend's web IP address to allow cookie-based authentication.

### Java Application
**Purpose:** For administrators to update court booking data

**Technology Stack:**
1. Java
2. Maven
3. OkHttp

**API Integration:** Communicates with the backend through REST API endpoints with authorization headers for credential-based requests.

## Database Design

![Database Design](https://github.com/afiqsuradi/bitp3123-project/raw/main/blobs/erd_diagram.png)

The database schema is designed with three main entities:
- **Users**: Stores user account information and roles
- **Courts**: Manages court information and availability status
- **Bookings**: Handles reservation data with relationships to users and courts

## Business Logic and Data Validation

### User Book Court Flow
<img src="https://github.com/afiqsuradi/bitp3123-project/raw/main/blobs/fc_user_book_court.png" width="360">

### User Cancel Booking Flow
<img src="https://github.com/afiqsuradi/bitp3123-project/raw/main/blobs/fc_user_cancel_book.png" width="360">

### Admin Update Booking Flow
<img src="https://github.com/afiqsuradi/bitp3123-project/raw/main/blobs/fc_admin_update_court.png" width="360">

### Data Validation

Data validation is enforced on both frontend and backend to ensure data integrity and smooth user experience.

#### Frontend Validation
- **Required Fields**: Booking forms check that all required fields (date, time, duration) are filled
- **Time Slot Availability**: Users cannot select already booked time slots
- **Input Format**: Time inputs use 30-minute steps with valid duration options
- **Error Display**: Validation errors are shown directly in forms

#### Backend Validation
- **Schema Validation (Zod)**: All incoming requests validated using Zod schemas
- **Database Constraints (Prisma)**: Unique email, unique booking slots, court status validation
- **Service Layer Validation**: Time overlap checking, booking hours (6 AM - 10 PM), past date prevention

**Validation Rules:**
- **User Registration**: Name (4-50 chars), valid email, password (5-100 chars)
- **Booking**: Valid court ID, date format, time format (HH:mm), duration (30-480 minutes in 30-min intervals)
- **Business Rules**: No past bookings, no overlapping time slots, courts must be available

This multi-layered validation approach ensures robust data integrity and prevents invalid or conflicting bookings.
