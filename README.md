# Employee Management System

A comprehensive Employee Management System designed to enhance organizational efficiency with features like role-based permissions, grievance handling, project management, and real-time updates.

## 🚀 Features

### 1. Employee Management
- Role-based permissions for performing actions.
- **Special Permissions** field allows employees to have additional permissions beyond their role.
- Dynamic role and department management.

### 2. Project Management
- Create projects with details: title, description, start date, due date, manager, and members.
- Project boards for task management with editable columns.
- Assign tasks to project members with attachments.
- Task progress: **Submitted** → **Finish** (manager approval).
- Personal boards for individual task tracking.
- 
### 3. Grievance Handling
- Employees can report issues with attachments (photos/videos), titles, and descriptions.
- User-friendly drag-and-drop grievance card interface for status updates and custom ordering.
- Grievance assignment permissions for assigning grievances to specific employees.

### 4. Real-Time Updates
- Live notifications and updates using **Socket.io** for all active employees.

---

## 🛠️ Tools & Technologies

### Backend:
- **Node.js** and **Express.js**: API development.
- **MongoDB**: Database.

### Frontend:
- **React.js**: User Interface.
- **Tailwind CSS** and **shadcn**: Styling.

### Additional Tools:
- **Socket.io**: Live updates and notifications.
- **RTK Query**: Client-side API management.
- **Redux**: State management.
- **JWT**: User authentication.
- **Nodemailer**: Email notifications.

---

## 📂 Project Structure

```plaintext
src/
├── backend/
│   ├── controllers/
│   ├── database/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validators/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── validators/
