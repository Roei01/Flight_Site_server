# Flight_Site Network Server

## Overview

Flight_Site Network Server is an Express.js application designed to manage user registration, authentication, and profile management. It uses MongoDB for data storage and integrates JWT for secure authentication.

## Features

- User Registration
- User Authentication (Login)
- Profile Management
- JWT-based Authentication
- ESLint for code quality
- Unit tests using Mocha and Chai
- CI/CD with GitHub Actions

## Prerequisites

- Node.js (v16.x or higher)
- MongoDB

## Getting Started

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/Flight_Site-network-server.git
cd Flight_Site-network-server
```

2. Install dependencies:

```bash
npm install
```

3. Set up MongoDB:

Make sure you have MongoDB installed and running on your local machine. By default, the server connects to `mongodb://localhost:27017/Flight_Site-network`.

### Running the Server

Start the server in development mode with Nodemon:

```bash
npm run dev
```

Start the server in production mode:

```bash
npm start
```

The server will run on `http://localhost:3000`.

## API Endpoints

### Register a new user

- **URL:** `/register`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "testuser",
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com",
    "password": "password123",
    "dateOfBirth": "1990-01-01"
  }
  ```

### Login

- **URL:** `/login`
- **Method:** `POST`
- **Body:**
  ```json
  {
    "username": "testuser",
    "password": "password123"
  }
  ```

### Get User Profile

- **URL:** `/profile`
- **Method:** `GET`
- **Headers:**
  ```json
  {
    "Authorization": "Bearer <token>"
  }
  ```

## Running Tests

Unit tests are written using Mocha and Chai. To run the tests:

```bash
npm run test
```

## Linting

ESLint is used to maintain code quality. To run the linter:

```bash
npm run lint
```

## Continuous Integration

This project uses GitHub Actions for CI. The workflow is defined in `.github/workflows/npm-publish.yml`.

### GitHub Actions Workflow

- **Build, Test, Lint and Deploy** workflow runs on every push or pull request to the `main` branch.
- It includes the following steps:
  - Check out the code
  - Set up Node.js
  - Wait for MongoDB to be ready
  - Install dependencies
  - Run tests
  - Run lint if tests pass
  - Deploy the app using a custom deployment script
