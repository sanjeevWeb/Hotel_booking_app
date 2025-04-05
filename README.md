# Hotel Booking Application

This is a full-stack hotel booking application that allows users to search for hotels, book rooms, and manage their bookings. It also provides functionality for hotel owners to manage their properties. The application is built using modern web technologies, including **React**, **TypeScript**, **Node.js**, **Express**, **MongoDB**, and **Playwright** for end-to-end testing.

---

## Features

### User Features
- **User Authentication**: Register, log in, and log out securely.
- **Hotel Search**: Search for hotels by location, type, and other filters.
- **Hotel Details**: View detailed information about hotels, including images, descriptions, and pricing.
- **Booking**: Book rooms and view a summary of the total cost, including taxes and charges.
- **My Bookings**: View and manage your bookings.

### Hotel Owner Features
- **Add Hotels**: Add new hotels with details such as name, location, description, price per night, and star rating.
- **Edit Hotels**: Update hotel details.
- **Manage Hotels**: View and manage all hotels owned by the user.

### Payment Integration
- **Stripe**: Integrated for secure payment processing.
- **Razorpay**: Razorpay script is included for potential future integration.

### Admin Features
- **User Management**: Admins can manage user accounts (future scope).

### End-to-End Testing
- **Playwright**: Comprehensive E2E tests for critical workflows, including user registration, login, and booking.

---

## Tech Stack

### Frontend
- **React**: For building the user interface.
- **TypeScript**: For type-safe development.
- **Vite**: For fast builds and development.
- **TailwindCSS**: For styling.
- **React Query**: For data fetching and caching.
- **React Hook Form**: For form handling and validation.

### Backend
- **Node.js**: For server-side development.
- **Express**: For building RESTful APIs.
- **MongoDB**: For database storage.
- **Mongoose**: For object data modeling (ODM).
- **Cloudinary**: For image uploads and storage.
- **JWT**: For secure authentication.

### Testing
- **Playwright**: For end-to-end testing.

---

## Project Structure



---

## Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or cloud instance)
- **Stripe Account** (for payment integration)
- **Cloudinary Account** (for image uploads)

### Backend Setup
1. Navigate to the `backend` directory:
   ```sh
   cd backend

   
### Scripts

Backend
npm run dev: Start the backend server in development mode.
npm run build: Build the backend for production.
npm start: Start the backend server in production mode.

Frontend
npm run dev: Start the frontend development server.
npm run build: Build the frontend for production.
npm run preview: Preview the production build.
npm run lint: Run ESLint to check for code quality issues.

E2E Tests
npx playwright test: Run all end-to-end tests.
npx playwright show-report: View the test report.

### API Endpoints
**Authentication**

- POST /api/auth/login: Log in a user.
- POST /api/auth/logout: Log out a user.
- GET /api/auth/validate-token: Validate the user's authentication token.

**Users**
- POST /api/users/register: Register a new user.
- GET /api/users/me: Get the current user's details.

**Hotels**
- GET /api/hotels: Search for hotels.
- GET /api/hotels: Search for hotels.
- GET /api/hotels/:id: Get details of a specific hotel.

**My Hotels (For Owners)**
- POST /api/my-hotels: Add a new hotel.
- PUT /api/my-hotels/:id: Update hotel details.
- DELETE /api/my-hotels/:id: Delete a hotel.

**Bookings**
- POST /api/my-bookings: Create a new booking.
- GET /api/my-bookings: Get all bookings for the current user.

### Deployement:

Deployed on render.com with database on mongodb atlas
- [Hotel booking app deployed link](https://hotel-booking-app-yy0y.onrender.com/)


### License
This project is licensed under the MIT License.