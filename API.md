# PayChain API Documentation

Welcome to the PayChain API! This RESTful API allows you to programmatically interact with the PayChain payroll platform.

## Base URL

All endpoints are relative to the following base URL:

```text
http://localhost:4000/api
```
*(In production, this will be your deployed backend URL)*

## Authentication

Most endpoints require authentication. PayChain uses JSON Web Tokens (JWT).

> [!IMPORTANT]
> Include the token in the `Authorization` header as a Bearer token for protected routes.
> `Authorization: Bearer <your_token_here>`

---

## 1. Authentication (`/api/auth`)

### Register User
Create a new user and optionally a new company if the role is `ADMIN`.

**Request**
- **Method**: `POST`
- **Path**: `/auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "role": "ADMIN", // or "HR_MANAGER", "EMPLOYEE"
    "companyName": "Acme Corp" // Optional, required if role is ADMIN
  }
  ```

**Response** (201 Created)
- **Body**: `{ "success": true, "data": { "user": { ... }, "token": "ey..." }, "message": "Registration successful" }`

### Login
Authenticate an existing user.

**Request**
- **Method**: `POST`
- **Path**: `/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword123"
  }
  ```

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { "user": { ... }, "token": "ey..." }, "message": "Login successful" }`

### Get Current User
Retrieve the profile of the currently authenticated user.

**Request**
- **Method**: `GET`
- **Path**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { "id": "...", "name": "...", "email": "...", "role": "...", "company": { ... } } }`

---

## 2. Employees (`/api/employees`)

> [!NOTE]
> All employee endpoints require a valid Bearer token and an associated `companyId`.

### List Employees
Get a list of employees for the company.

**Request**
- **Method**: `GET`
- **Path**: `/employees`
- **Query Parameters**:
  - `search` (optional): Filter by name or email.
  - `status` (optional): Filter by status (e.g., `ACTIVE`, `SUSPENDED`, `TERMINATED`).

**Response** (200 OK)
- **Body**: `{ "success": true, "data": [ { ... } ] }`

### Create Employee
Add a new employee to the company. Requires `ADMIN` or `HR_MANAGER` role.

**Request**
- **Method**: `POST`
- **Path**: `/employees`
- **Body**: *(Matches employee schema)*
  ```json
  {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "salary": 5000,
    "walletAddress": "G...",
    "department": "Engineering"
  }
  ```

**Response** (201 Created)
- **Body**: `{ "success": true, "data": { ... } }`

### Get Employee
Retrieve details of a specific employee, including their 10 most recent payrolls.

**Request**
- **Method**: `GET`
- **Path**: `/employees/:id`

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { ..., "payrolls": [ ... ] } }`

### Update Employee
Update an employee's details. Requires `ADMIN` or `HR_MANAGER` role.

**Request**
- **Method**: `PUT`
- **Path**: `/employees/:id`
- **Body**: *(Partial employee schema)*

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { ... } }`

### Update Employee Status
Change an employee's employment status. Requires `ADMIN` or `HR_MANAGER` role.

**Request**
- **Method**: `PATCH`
- **Path**: `/employees/:id/status`
- **Body**:
  ```json
  { "status": "ACTIVE" } // or "SUSPENDED", "TERMINATED"
  ```

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { ... } }`

### Delete Employee
Remove an employee. Requires `ADMIN` role.

**Request**
- **Method**: `DELETE`
- **Path**: `/employees/:id`

**Response** (200 OK)
- **Body**: `{ "success": true, "message": "Employee removed" }`

---

## 3. Payroll (`/api/payroll`)

> [!NOTE]
> All payroll endpoints require a valid Bearer token and an associated `companyId`.

### List Payrolls
Retrieve all payroll entries for the company.

**Request**
- **Method**: `GET`
- **Path**: `/payroll`
- **Query Parameters**:
  - `status` (optional): Filter by `PENDING`, `APPROVED`, `EXECUTED`, or `CANCELLED`.
  - `employeeId` (optional): Filter by a specific employee.
  - `token` (optional): Filter by cryptocurrency token (e.g., `USDC`).

**Response** (200 OK)
- **Body**: `{ "success": true, "data": [ { ... } ] }`

### Create Payroll Entry
Create a pending payroll transaction. Requires `ADMIN` or `HR_MANAGER` role.

**Request**
- **Method**: `POST`
- **Path**: `/payroll`
- **Body**:
  ```json
  {
    "employeeId": "uuid-...",
    "amount": 1500.00,
    "token": "USDC",
    "paymentDate": "2026-05-31T00:00:00.000Z"
  }
  ```

**Response** (201 Created)
- **Body**: `{ "success": true, "data": { ... } }`

### Approve Payroll
Approve a pending payroll. Requires `ADMIN` role.

**Request**
- **Method**: `POST`
- **Path**: `/payroll/:id/approve`

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { "status": "APPROVED", ... } }`

### Execute Payroll
Execute an approved payroll on the blockchain. Requires `ADMIN` role.

**Request**
- **Method**: `POST`
- **Path**: `/payroll/:id/execute`

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { "txHash": "...", ... } }`

### Bulk Execute Payroll
Execute all eligible approved payrolls for the company. Requires `ADMIN` role.

**Request**
- **Method**: `POST`
- **Path**: `/payroll/bulk-execute`

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { "successful": [...], "failed": [...] } }`

### Cancel Payroll
Cancel a pending or approved payroll. Requires `ADMIN` or `HR_MANAGER` role.

**Request**
- **Method**: `POST`
- **Path**: `/payroll/:id/cancel`

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { "status": "CANCELLED", ... } }`

---

## 4. Analytics (`/api/analytics`)

### Get Overview
Retrieve high-level statistics and recent trends for the company dashboard.

**Request**
- **Method**: `GET`
- **Path**: `/analytics/overview`

**Response** (200 OK)
- **Body**:
  ```json
  {
    "success": true,
    "data": {
      "totalEmployees": 42,
      "activeEmployees": 40,
      "monthlyPayrollTotal": 125000,
      "totalPayrollSent": 1500000,
      "pendingPayrolls": 5,
      "trend": [
        { "month": "Jan", "total": 120000 },
        { "month": "Feb", "total": 125000 }
      ]
    }
  }
  ```

---

## 5. Wallets (`/api/wallets`)

> [!NOTE]
> All wallet endpoints require a valid Bearer token.

### Connect Wallet
Save or update the user's wallet address.

**Request**
- **Method**: `POST`
- **Path**: `/wallets/connect`
- **Body**:
  ```json
  {
    "address": "G...",
    "network": "STELLAR"
  }
  ```

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { ... } }`

### Get Wallet Balance
Fetch the current balance of a given Stellar address.

**Request**
- **Method**: `GET`
- **Path**: `/wallets/balance/:address`

**Response** (200 OK)
- **Body**: `{ "success": true, "data": [ { "balance": "100.0", "asset_type": "native" } ] }`

### Get My Wallet
Retrieve the currently connected wallet for the authenticated user.

**Request**
- **Method**: `GET`
- **Path**: `/wallets/me`

**Response** (200 OK)
- **Body**: `{ "success": true, "data": { "address": "...", "network": "STELLAR" } }`
