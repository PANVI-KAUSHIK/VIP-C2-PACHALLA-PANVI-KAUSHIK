# Book a Doctor App

A full-stack MERN healthcare booking platform for patients, doctors, and administrators.

## Features

- Patient registration and login with JWT authentication
- Role-based access for patients, doctors, and admins
- Browse approved doctors by specialty, location, and availability
- Schedule appointments from live, conflict-free 30-minute availability slots
- Role-safe appointment confirmation, completion, and cancellation
- Upload and securely download medical documents for an appointment
- Doctor dashboard for appointment status updates and availability
- Admin dashboard for doctor verification and platform monitoring

## Tech Stack

- Frontend: React, React Router, Axios, Bootstrap
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Security: JWT, bcrypt, Helmet, role-based middleware
- Uploads: Multer local file storage

## Project Structure

```text
client/   React app
server/   Express API
```

## Setup

1. Install Node.js v16+ and MongoDB or create a MongoDB Atlas cluster.
2. Copy `server/.env.example` to `server/.env`.
3. Update `MONGO_URI` and `JWT_SECRET`.
4. Install dependencies:

```powershell
npm.cmd run install:all
```

5. Start both apps:

```powershell
npm.cmd run dev
```

The React app runs on `http://localhost:3000` and the API runs on `http://localhost:5000`.

## Demo Accounts

Use the seed script after setting `MONGO_URI`:

```powershell


HOW TO RUN:
Run it like this from PowerShell:

cd C:\Users\pc\OneDrive\Desktop\Doct-1
npm.cmd run dev

That starts both:
Frontend: http://localhost:3000
Backend: http://localhost:5000
If port 5000 is already busy, run:
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
npm.cmd run dev
Replace <PID_NUMBER> with the number shown at the end of the LISTENING line.
Success backend output:
MongoDB connected
API running on port 5000

3:09 PM









Add to chat
```

- Admin: `admin@bookdoctor.test` / `Admin@123`
- Patient: `patient@bookdoctor.test` / `Patient@123`
- Doctor: `doctor@bookdoctor.test` / `Doctor@123`
