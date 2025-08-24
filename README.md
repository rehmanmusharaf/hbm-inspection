# Car Inspection System

A comprehensive MERN-stack application for managing car inspections, replicating and improving upon PakWheels-style inspection reports.

## 🚀 Features

### Core Functionality
- **JWT Authentication** with role-based access control (user, inspector, admin)
- **Car Management** - Register and manage vehicle information
- **Inspection Booking** - Schedule inspections with date/time slots
- **Detailed Inspection Reports** - Comprehensive vehicle condition assessments
- **Public Report Sharing** - Secure, tokenized links for report access
- **File Upload** - Cloudinary integration with watermarking support
- **Email Notifications** - Automated booking confirmations and updates

### Inspection Categories
- Engine/Transmission/Clutch analysis
- Interior & Electronics assessment
- Exterior & Body condition
- Suspension, Tires, and Brakes evaluation
- Road Test performance
- Visual damage mapping with annotations

### Advanced Features
- **Responsive Design** - Mobile-first UI with TailwindCSS
- **Real-time Updates** - React Query for efficient data management
- **Security** - Rate limiting, input validation, and secure file handling
- **Scalable Architecture** - Docker containerization ready
- **Professional Reports** - Watermarked images and detailed scoring

## 🛠 Tech Stack

### Backend
- **Node.js** + **Express.js** - RESTful API
- **MongoDB** + **Mongoose** - Database with optimized queries
- **JWT** + **bcrypt** - Authentication and security
- **Cloudinary** - Media storage and processing
- **Nodemailer** - Email notifications
- **Express-validator** - Input validation

### Frontend
- **React 18** + **Vite** - Modern development experience
- **TailwindCSS** - Utility-first styling
- **React Query** - Server state management
- **React Hook Form** - Efficient form handling
- **React Router** - Client-side routing
- **Recharts** - Data visualization

### Infrastructure
- **Docker** + **Docker Compose** - Containerization
- **MongoDB** - Primary database
- **Redis** - Caching layer
- **Nginx** - Production web server

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Cloudinary account (for image storage)
- Email service credentials (Gmail/SMTP)

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone <repository-url>
cd car-inspection-system
```

### 2. Environment Setup
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# - MongoDB credentials
# - JWT secret
# - Cloudinary credentials
# - Email service credentials
```

### 3. Docker Deployment (Recommended)

#### Production Deployment
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000
```

#### Development Deployment
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# Frontend development server (separate terminal)
cd frontend
npm install
npm run dev
# Access: http://localhost:3000
```

### 4. Manual Setup (Alternative)

#### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env file with your configurations
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

#### Database Setup
- Install MongoDB locally or use MongoDB Atlas
- Update connection string in .env files

## 📁 Project Structure

```
car-inspection-system/
├── backend/
│   ├── controllers/         # Route controllers
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   ├── utils/              # Utility functions
│   └── server.js           # Express server
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React Context
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── index.html          # Entry HTML
├── docker-compose.yml      # Production Docker setup
├── docker-compose.dev.yml  # Development Docker setup
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Password reset request
- `PUT /api/auth/reset-password/:token` - Reset password

### Cars
- `GET /api/cars` - List cars (filtered by user role)
- `POST /api/cars` - Register new car
- `GET /api/cars/:id` - Get car details
- `PUT /api/cars/:id` - Update car
- `DELETE /api/cars/:id` - Delete car

### Inspections
- `GET /api/inspections` - List inspection reports
- `POST /api/inspections` - Create inspection report
- `GET /api/inspections/:id` - Get inspection details
- `PUT /api/inspections/:id` - Update inspection
- `PUT /api/inspections/:id/publish` - Publish report
- `GET /api/inspections/public/:id/:token` - Public report access

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id/assign-inspector` - Assign inspector
- `PUT /api/bookings/:id/cancel` - Cancel booking

### File Upload
- `POST /api/upload/single` - Upload single image
- `POST /api/upload/multiple` - Upload multiple images
- `DELETE /api/upload/:publicId` - Delete image

## 👥 User Roles

### User (Vehicle Owner)
- Register and manage vehicles
- Schedule inspections
- View their inspection reports
- Access booking history

### Inspector
- View assigned inspections
- Create detailed inspection reports
- Upload and annotate images
- Publish completed reports

### Admin
- Full system access
- User management
- Assign inspectors to bookings
- System configuration

## 🔐 Security Features

- **JWT Authentication** with refresh tokens
- **Role-based Authorization** for API endpoints
- **Rate Limiting** to prevent abuse
- **Input Validation** using express-validator
- **Secure Headers** with Helmet.js
- **Image Watermarking** for report authenticity
- **Secure File Upload** with type validation

## 📱 Responsive Design

- **Mobile-first** approach with TailwindCSS
- **Progressive Web App** ready
- **Touch-friendly** interfaces
- **Optimized images** and fast loading

## 🚀 Deployment

### Docker Production
```bash
# Production deployment
docker-compose up -d

# Scale services if needed
docker-compose up -d --scale backend=2
```

### Manual Deployment
1. Build frontend: `cd frontend && npm run build`
2. Serve built files with Nginx
3. Run backend with PM2: `pm2 start server.js`
4. Configure reverse proxy for API

## 📊 Database Models

### User
- Authentication and profile information
- Role-based permissions (user/inspector/admin)
- Email verification and password reset

### Car
- Vehicle registration details
- Owner relationship
- Document and image storage

### InspectionReport
- Comprehensive inspection data
- Category-wise scoring and conditions
- Image annotations and damage mapping
- Secure public access tokens

### Booking
- Inspection scheduling
- Inspector assignment
- Payment tracking
- Status management

## 🔧 Configuration

### Environment Variables
- **Database**: MongoDB connection and credentials
- **Authentication**: JWT secrets and expiration
- **File Storage**: Cloudinary configuration
- **Email**: SMTP settings for notifications
- **Security**: Rate limiting and CORS settings

### Development vs Production
- Development includes hot reloading and debug logs
- Production optimized with compression and caching
- Different Docker configurations for each environment

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team

## 🎯 Future Enhancements

- **AI-powered damage detection** from uploaded images
- **Blockchain verification** for report authenticity
- **Mobile app** development (React Native)
- **Advanced analytics** dashboard
- **Integration** with insurance providers
- **Multi-language support**
- **Real-time chat** between users and inspectors