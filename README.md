 
# Personal Notes & Bookmark Manager - Backend

This is the backend component for the Personal Notes & Bookmark Manager application, built with Node.js, Express, and Prisma (PostgreSQL). It provides a RESTful API for managing user authentication, notes, and bookmarks.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Contribution](#contribution)
- [License](#license)

## Features

- User Authentication (Register, Login, Profile Management) with JWT.
- CRUD operations for Notes (Create, Read, Update, Delete).
- CRUD operations for Bookmarks (Create, Read, Update, Delete).
- Search and filter notes/bookmarks by keywords and tags.
- Mark notes/bookmarks as favorites.
- Auto-fetch title for bookmarks from URLs (Bonus Feature).
- Robust validation and error handling.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Prisma ORM)
- **ORM**: Prisma
- **Authentication**: JSON Web Tokens (JWT), bcryptjs for password hashing.
- **Validation**: express-validator
- **Environment Management**: dotenv
- **Other Utilities**: CORS, Helmet (for security headers, if implemented), Axios (for URL metadata fetching).

## Getting Started

Follow these steps to get the backend up and running on your local machine.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm (Node Package Manager)
- A PostgreSQL instance 
### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd notes-bookmarks-backend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Environment Variables

Create a `.env` file in the root of the project and populate it with the following required environment variables:

