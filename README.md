# FastAPI & React DebtApp Project

## Overview

This project is a FastAPI & React -based application that provides APIs for user management and debt tracking. It includes JWT-based authentication and supports CRUD operations for managing users and debts.

## Features

- **User Management**
  - Register users
  - Login with JWT-based authentication
  - Retrieve user information
- **Debt Management**
  - Add, retrieve, and delete debts
  - Calculate total debts per user
- **Group Managment**
  - Calculate and split-up debts automatically

## Prerequisites

- Python 3.9+
- A relational database (MySQL)
- XAMPP or Docker to connect to database website (PHPMyAdmin or other)
- Node.js for frontend part

## Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd <repository_name>
   ```

2. Create and activate a virtual environment:

   ```bash
   python -m venv env
   source env/bin/activate   # On Windows: .\env\Scripts\activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Configure the database:
   Update the `config/db_configuration.py` file with your database connection string.

   It is important for user to create his own .env file in Backend folder in order to
   correctly connect to database

   f.ex

   ```bash
   DATABASE_USERNAME=admin
   DATABASE_PASSWORD=admin
   DATABASE_NAME=DebtAppDB
   DATABASE_HOST=ip_address (localhost)
   DATABASE_PORT=port_to_use
   ```

   When using XAMPP it is also important to create databse with name included in DATABASE_NAME

5. Run the docker deamon/Run XAMPP Apache2 and MYSQL

6. Run the backend part of application (in Backend directory):

   ```bash
   uvicorn main:app --reload
   ```

7. Run the frontend part of application (in Frontend/dept-app directory):

```bash
npm install
npm update
(optional) npm audit fix --force
npm install @picocss/pico
npm start
```

## Project Structure

```
.
├── Backend
│   ├── config                      # Configuration files
│   │   └── db_configuration.py     # Database connection setup
│   ├── models                      # Database models
│   │   ├── debts.py                # Debt model and related methods
│   │   ├── debts_dto.py            # DTO for debts
│   │   ├── debts_dto_all.py        # DTO for all debts
│   │   ├── expense_request.py      # Expense request model
│   │   ├── group.py                # Group model
│   │   ├── user.py                 # User model and related methods
│   │   └── user_ids.py             # User IDs model
│   ├── routes                      # API routes
│   │   ├── debts_routes.py         # Routes for debt management
│   │   ├── group_routes.py         # Routes for group management
│   │   └── user_routes.py          # Routes for user management
│   ├── schemas                     # Pydantic schemas
│   │   ├── __init__.py             # Base schema and paginated schema
│   │   ├── debt_response.py        # Debt response schema
│   │   ├── debt_split_request.py   # Debt split request schema
│   │   └── user_schema.py          # User schemas
│   ├── services                    # Service layer
│   │   └── user_service.py         # User service methods
│   ├── utils                       # Utility functions
│   │   └── auth.py                 # Functions for password hashing and JWT
│   ├── docker-compose.yml          # Docker Compose configuration
│   ├── main.py                     # Entry point of the application
│   └── test_main.http              # HTTP tests for FastAPI endpoints
├── Frontend
│   └── debt-app                    # React application
│       ├── src
│       │   ├── App.css
│       │   ├── App.js
│       │   ├── App.test.js
│       │   ├── CustomAlert.css
│       │   ├── CustomAlert.js
│       │   ├── Dashboard.js
│       │   ├── index.css
│       │   ├── index.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   └── reportWebVitals.js
|       └──
├── .gitignore
├── README.md
└── requirements.txt
```

## API Endpoints

### User Endpoints

- **POST** `/register`

  - Register a new user.
  - **Request Body:**
    ```json
    {
      "username": "string",
      "email": "string",
      "password": "string"
    }
    ```
  - **Response:**
    ```json
    {
      "message": "User registered",
      "user": "string"
    }
    ```

- **POST** `/login`
  - Login and get a JWT token.
  - **Request Body:**
    ```json
    {
      "username": "string",
      "password": "string"
    }
    ```
  - **Response:**
    ```json
    {
      "access_token": "string",
      "token_type": "bearer"
    }
    ```

### Debt Endpoints

- **GET** `/debts`

  - Retrieve all debts.

- **POST** `/debts`

  - Add a new debt.
  - **Request Body:**
    ```json
    {
      "title": "string",
      "receiver": "string",
      "amount": "float",
      "user_id": "int"
    }
    ```
  - **Response:**
    ```json
    {
      "message": "Debt created",
      "debt": {
        "id": "int",
        "title": "string",
        "receiver": "string",
        "amount": "float",
        "user_id": "int"
      }
    }
    ```

- **DELETE** `/debts/{debt_id}`
  - Delete a debt by ID.

## Environment Variables

| Variable Name  | Description                |
| -------------- | -------------------------- |
| `SECRET_KEY`   | Secret key for JWT         |
| `DATABASE_URL` | Database connection string |

## Security

- Passwords are hashed using `bcrypt`.
- JWT tokens are used for authentication.

## License

This project is for educational purposes and is free to use and modify. Please credit the original creator if shared or published.
