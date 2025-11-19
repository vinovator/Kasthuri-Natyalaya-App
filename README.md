# Kasthuri Natyalaya - The Digital Gurukulam

A comprehensive School Management System designed specifically for Classical Bharatanatyam Dance Schools. This application manages students, scheduling, fees, attendance, and communications with a culturally immersive UI.

## 🌟 Key Features

### 🎭 Role-Based Access Control
*   **Head Teacher / Admin:** Full access to configuration, financials, and student management.
*   **Teacher:** Manage assigned classes, mark attendance, and view relevant student profiles.
*   **Student/Parent:** View personal schedule, fee history, progress reports, and announcements. Includes **Sibling Support** (one parent login for multiple children).

### 📅 Smart Scheduling & Attendance
*   **Class Scheduling:** Schedule classes by Category (e.g., Beginner Adavus) and Location.
*   **Attendance:** Mark present/absent/late. Supports "Drop-in" students not formally enrolled.
*   **History:** Students can view their full attendance percentage and history.

### 💰 Fee Management (Dakshina)
*   **Auto-Calculation:** Fees are calculated based on class duration and category rates.
*   **Tracking:** Mark payments as Paid/Pending.
*   **Reminders:** Send AI-generated payment reminders via Email, SMS, or WhatsApp.

### 🤖 AI-Powered Communications
*   **Gemini Integration:** Draft professional announcements and event descriptions using Google Gemini AI.
*   **Multi-Channel:** Publish notifications via Email, SMS, or WhatsApp.

### 📊 Progress Tracking
*   **Digital Report Cards:** Grade students on Talam (Rhythm), Bhavam (Expression), Angashudhi (Form), and Memory.
*   **History:** View progress over time.

### ☁️ Data Persistence & Security
*   **Firebase Firestore:** Real-time cloud database.
*   **Backup:** JSON System Backup & Restore functionality.
*   **Security:** User authentication and data validation.

## 🛠️ Tech Stack
*   **Frontend:** React 19, TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Database:** Firebase Firestore
*   **AI:** Google Gemini API
*   **Deployment:** Firebase Hosting

## 🚀 Setup & Deployment

1.  **Install Dependencies:** `npm install`
2.  **Run Local:** `npm run dev`
3.  **Build:** `npm run build`
4.  **Deploy:** Pushing to the `main` branch triggers a GitHub Action to deploy to Firebase Hosting.
