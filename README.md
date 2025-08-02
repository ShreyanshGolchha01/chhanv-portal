# 🏥 Chhānv Health Camp Admin Panel

A modern, comprehensive admin panel for managing government health camps and employee welfare schemes. Built with React, TypeScript, and Tailwind CSS.

## 🌟 Features

### 🔐 Authentication System
- Simple email/password login with form validation
- Demo credentials for testing
- Secure route protection
- Automatic session management

### 📊 Dashboard
- Real-time KPI cards (Total Camps, Users, Schemes, Beneficiaries)
- Interactive line charts showing camps vs beneficiaries trends
- Recent activity feed with live updates
- Quick action buttons for common tasks

### 🏕️ Health Camps Management
- Complete CRUD operations for health camps
- Camp scheduling with date, time, and location
- Doctor assignment and coordination
- Progress tracking with beneficiary counts
- Status management (Scheduled, Ongoing, Completed, Cancelled)

### 👨‍⚕️ Doctors Management
- Doctor profile management with specialties
- Experience and qualification tracking
- Camp assignment system
- Contact information management
- Performance analytics

### 👥 Users & Health Records
- Employee directory with department-wise organization
- Expandable health record timelines
- Blood pressure and sugar level tracking
- BMI calculations and health status indicators
- PDF export functionality for individual health reports

### 📄 Schemes Management
- Tabbed interface (Pending/Approved/Rejected)
- Document upload and verification system
- Approval workflow with comments
- Amount tracking and disbursement records
- Search and filter capabilities

### 📈 Reports & Analytics
- Interactive pie charts for scheme-wise participation
- Bar charts for health issue trends
- Monthly overview with multiple metrics
- Export functionality for all reports
- Performance metrics and KPI tracking

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS with custom design system
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **Routing**: React Router DOM v6
- **State Management**: React Hooks (useState, useEffect)
- **Data**: Mock JSON data (no backend required)

## 🎨 Design System

- **Primary Color**: #0E7DFF (Government health theme)
- **Typography**: Inter font family
- **Layout**: Card-based design with rounded corners
- **Responsive**: Mobile-first approach with sidebar collapse
- **Components**: Reusable component library

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd admin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Backend Integration Required
Connect your backend API for authentication and data management:
- Set up authentication API endpoints
- Configure data fetching from your backend services
- Replace mock data with real API calls

## 📱 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Sidebar.tsx     # Navigation sidebar
│   ├── Header.tsx      # Top header with search
│   ├── DataTable.tsx   # Sortable data table
│   └── ConfirmDialog.tsx # Modal confirmations
├── layouts/
│   └── AdminLayout.tsx # Main admin layout
├── pages/              # Route-level components
│   ├── Login.tsx       # Authentication page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Camps.tsx       # Health camps management
│   ├── Doctors.tsx     # Doctors management
│   ├── Users.tsx       # Users & health records
│   ├── Schemes.tsx     # Schemes management
│   └── Reports.tsx     # Analytics & reports
├── routes/
│   └── index.tsx       # Router configuration
├── types/
│   └── interfaces.ts   # TypeScript interfaces
├── data/
│   └── mockData.ts     # Mock data & utilities
└── main.tsx           # Application entry point
```

## 🎯 Key Features

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on smaller screens
- Adaptive layouts for all screen sizes

### Data Management
- Client-side search and filtering
- Sortable tables with pagination
- CRUD operations with form validation
- Export functionality for reports

### User Experience
- Intuitive navigation with active states
- Loading states and error handling
- Modal dialogs for actions
- Toast notifications (ready for implementation)

### Government Compliance
- Hindi language support for key elements
- Professional government branding
- Accessibility considerations
- SSIPMT, Raipur attribution

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📦 Build and Deploy

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Preview the build**
   ```bash
   npm run preview
   ```

3. **Deploy to any static hosting service**
   - Vercel, Netlify, GitHub Pages, etc.
   - Upload the `dist` folder contents

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is developed for government health services and educational purposes.

## 🙏 Acknowledgments

- **SSIPMT, Raipur** for project support and guidance
- **Ministry of Health & Family Welfare, Government of India**
- React and Vite communities for excellent tooling
- Tailwind CSS for the utility-first CSS framework

---

**Powered by Shri Shankaracharya Institute of Professional Management and Technology, Raipur | Version 1.0.0**

*For support and queries, please contact the development team.*
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
