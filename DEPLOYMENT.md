# Deployment Guide for HBM Inspection System

## Render Deployment

### Prerequisites
1. A Render account (https://render.com)
2. Your GitHub repository with the latest code
3. MongoDB Atlas database (or any MongoDB hosting service)
4. Cloudinary account for image storage

### Step-by-Step Deployment

#### 1. Prepare Your Repository
Make sure your repository has these files in the root directory:
- `package.json` (root level) - Already created
- `render.yaml` - Already created
- Backend code in `/backend` folder
- Frontend code in `/frontend` folder

#### 2. Configure Render

1. **Create New Web Service on Render:**
   - Go to your Render dashboard
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the branch to deploy (usually `main`)

2. **Configure Build Settings:**
   - **Name:** hbm-inspection (or your preferred name)
   - **Region:** Choose closest to your users
   - **Branch:** main (or your default branch)
   - **Root Directory:** Leave empty (we're using root)
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm start`

3. **Configure Environment Variables:**
   Add these environment variables in Render dashboard:

   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secure_jwt_secret_key
   JWT_EXPIRE=30d
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   EMAIL_FROM=your_email@gmail.com
   FRONTEND_URL=https://your-app-name.onrender.com
   ```

#### 3. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Wait for the build to complete (usually 5-10 minutes)
4. Your app will be available at: `https://your-app-name.onrender.com`

### Alternative: Manual Deployment Commands

If you prefer manual deployment or face issues with automatic deployment:

1. **Update root package.json build command:**
   ```json
   {
     "scripts": {
       "build": "cd frontend && npm ci && npm run build",
       "start": "node backend/server.js"
     }
   }
   ```

2. **Use these Render settings:**
   - Build Command: `npm run build`
   - Start Command: `npm start`

### Troubleshooting

#### Issue: "vite: not found"
**Solution:** This has been fixed by keeping vite in devDependencies and using proper build commands in root package.json.

#### Issue: "Cannot find module"
**Solution:** Ensure all dependencies are properly listed in package.json files.

#### Issue: "Build failed"
**Solution:** Check build logs in Render dashboard for specific errors.

### Post-Deployment Steps

1. **Create Admin Account:**
   ```bash
   # Connect to your deployed app's shell in Render
   # Run the admin seeder
   cd backend
   npm run seed:admin
   ```

2. **Test the Application:**
   - Navigate to your app URL
   - Login with admin credentials
   - Create an inspector account
   - Test all major features

3. **Configure Custom Domain (Optional):**
   - In Render dashboard, go to Settings
   - Add your custom domain
   - Follow DNS configuration instructions

### Environment Variables Explanation

- `NODE_ENV`: Set to "production" for production deployment
- `MONGODB_URI`: Your MongoDB connection string (from MongoDB Atlas or other provider)
- `JWT_SECRET`: A long, random string for JWT token signing (generate using: `openssl rand -base64 32`)
- `CLOUDINARY_*`: Get from your Cloudinary dashboard
- `EMAIL_*`: Gmail SMTP settings (use App Specific Password, not regular password)
- `FRONTEND_URL`: Your deployed app URL (update after deployment)

### Security Notes

1. Never commit `.env` files to version control
2. Use strong, unique values for JWT_SECRET
3. Enable 2FA on all service accounts (GitHub, Render, MongoDB, etc.)
4. Regularly update dependencies for security patches
5. Use MongoDB connection string with SSL enabled

### Monitoring

1. Enable Render's health checks
2. Set up alerts for deployment failures
3. Monitor application logs in Render dashboard
4. Consider adding application monitoring (e.g., Sentry)

### Scaling

Render's free tier limitations:
- Spins down after 15 minutes of inactivity
- Limited build minutes per month
- Consider upgrading for production use

For production deployment:
- Upgrade to paid Render plan
- Consider using MongoDB Atlas M10+ clusters
- Enable auto-scaling if needed
- Set up CDN for static assets