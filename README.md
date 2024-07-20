
# Backend Development Assignment

Developing a backend for a money lending application, similar to apps like Slice and KreditBee. Implement the following 4 APIs using MongoDB, Postman, and Node.js. Adding Comments to the logic is mandatory.

## Installation

To run the server first you need to the following programs installed on your machine.
1. Node.js
2. MongoDb
3. Postman

1. Clone the repository:
    ```bash
    git clone https://github.com/Bibhash844/money_lending_backend.git
    cd money_lending_backend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the server:
    ```bash
    npm start
    ```


    
## API Endpoints
#### SIGNUP
```http
  POST /signup
```

| Parameter       | Type     | Description                                      |
| :-------------- | :------- | :----------------------------------------------- |
| `email`         | `string` | **Required**. The email address of the user. Must be unique. |
| `password`      | `string` | **Required**. The password for the user account.  |
| `dob`           | `string` | **Required**. The date of birth of the user in `YYYY-MM-DD` format. |
| `monthlySalary` | `number` | **Required**. The monthly salary of the user in thousands (e.g., 3000 for 3000k). |

**Responses:**
- `200 OK`: User registered successfully.
- `400 Bad Request`: Email already exists, age is less than 20, or salary is less than 25k.


#### LOGIN
```http
  POST /login
```

| Parameter  | Type     | Description                              |
| :--------- | :------- | :--------------------------------------- |
| `email`    | `string` | **Required**. The email address of the user. |
| `password` | `string` | **Required**. The password for the user account. |

**Responses:**
- `200 OK`: User logged in successfully.
- `400 Bad Request`: User is already logged in.
- `404 Not Found`: Email not found.
- `401 Unauthorized`: Password doesn't match.


#### USER
```http
  GET /user
```

**Responses:**
- `200 OK`: Returns user details.
- `500 Internal Server Error`: Error in fetching user details.


#### BORROW
```http
    POST /borrow
```

| Parameter  | Type     | Description                              |
| :--------- | :------- | :--------------------------------------- |
| `amount`   | `number` | **Required**. The amount to borrow.      |
| `tenure`   | `number` | **Optional**. The tenure for repayment in months. Defaults to 12 months if not provided. |

**Responses:**
- `200 OK`: Borrow request successful.
- `400 Bad Request`: Invalid amount or insufficient purchase power.
- `500 Internal Server Error`: Error in borrow route.


#### LOGOUT
```http
    GET /logout
```

**Responses:**
- `200 OK`: User logged out successfully.
- `500 Internal Server Error`: Error in logout route.

## Middleware

### Auth Middleware

The `auth` middleware is used to authenticate users based on the token stored in cookies.

## Folder Structure
```http
money-lending/
├── config/
│ └── config.js
├── images/
│ ├── signup-request.png
│ ├── signup-correct-response.png
│ ├── signup-incorrect_age-response.png
│ ├── signup-incorrect_salary-response.png
│ ├── login-request.png
│ ├── login-correct-response.png
│ ├── login-incorrect_email-response.png
│ ├── login-incorrect_password-response.png
│ ├── login-again-response.png
│ ├── user-correct-request.png
│ ├── user-incorrect-response.png
│ ├── borrow-request.png
│ ├── borrow-correct-response.png
│ ├── borrow-incorrect_amount-response.png
│ ├── borrow-incorrect_tenure-response.png
│ └── logout_response.png
├── middlewares/
│ └── auth.js
├── models/
│ └── User.js
├── routes
│ ├── borrow.js
│ ├── login.js
│ ├── logout.js
│ ├── signup.js
│ └── user.js
├── index.js
├── package.json
└── README.md
```
## License

This project is not licensed. 
