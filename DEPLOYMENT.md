# Deployment Guide for Code Battle Backend

This guide explains how to deploy the Code Battle backend to Render using the provided `render.yaml` blueprint.

## Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com)
2. **GitHub Repository**: Your code should be in a GitHub repository
3. **MongoDB Atlas**: Set up a MongoDB Atlas cluster (or use existing one)
4. **OAuth Applications**: Set up Google and GitHub OAuth applications

## Pre-Deployment Setup

### 1. MongoDB Atlas Setup
1. Create a MongoDB Atlas account at [mongodb.com](https://www.mongodb.com/atlas)
2. Create a new cluster (M0 free tier is fine for testing)
3. Create a database user with read/write permissions
4. Whitelist IP addresses (0.0.0.0/0 for all IPs or specific Render IPs)
5. Get your connection string: `mongodb+srv://<username>:<password>@cluster.mongodb.net/codebattle?retryWrites=true&w=majority`

### 2. OAuth Application Setup

#### Google OAuth:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Set authorized redirect URIs:
   - `https://your-backend-domain.onrender.com/api/auth/google/callback`
6. Note down Client ID and Client Secret

#### GitHub OAuth:
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Set Authorization callback URL: `https://your-backend-domain.onrender.com/api/auth/github/callback`
4. Note down Client ID and Client Secret

## Deployment Steps

### 1. Connect Repository to Render
1. Log in to Render Dashboard
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will automatically detect the `render.yaml` file

### 2. Configure Environment Variables
During the blueprint setup, you'll be prompted for these secrets:

#### Required Secrets:
- **MONGODB_URI**: Your MongoDB Atlas connection string
- **GOOGLE_CLIENT_ID**: From Google OAuth setup
- **GOOGLE_CLIENT_SECRET**: From Google OAuth setup  
- **GITHUB_CLIENT_ID**: From GitHub OAuth setup
- **GITHUB_CLIENT_SECRET**: From GitHub OAuth setup

#### Auto-Generated:
- **JWT_SECRET**: Render will generate this automatically
- **SESSION_SECRET**: Render will generate this automatically

### 3. Update Domain References
After deployment, update these values in the Render Dashboard:

1. **FRONTEND_URL**: Update with your actual frontend domain
2. **GOOGLE_REDIRECT_URI**: Update with your actual backend domain
3. **GITHUB_REDIRECT_URI**: Update with your actual backend domain
4. **CORS_ORIGIN**: Update with your actual frontend domain

### 4. Verify OAuth Settings
Update your OAuth application settings with the actual deployed URLs:
- Google: Update authorized redirect URIs
- GitHub: Update authorization callback URL

## What Gets Deployed

The blueprint creates three services:

### 1. Main Web Service (`codebattle-backend`)
- **Type**: Web Service
- **Plan**: Starter (can be upgraded)
- **Purpose**: Main API server
- **Health Check**: Enabled on `/` endpoint
- **Auto Deploy**: On every commit to main branch

### 2. Background Worker (`codebattle-daily-monitor`)
- **Type**: Background Worker
- **Purpose**: Monitors daily challenges continuously
- **Auto Deploy**: On relevant file changes

### 3. Cron Job (`codebattle-daily-cron`)
- **Type**: Cron Job
- **Schedule**: Daily at 00:01 UTC
- **Purpose**: Updates daily challenges automatically

## Post-Deployment Configuration

### 1. Frontend Integration
Update your frontend configuration to point to the deployed backend:
```javascript
// In your frontend API configuration
const API_BASE_URL = 'https://your-backend-domain.onrender.com';
```

### 2. OAuth Redirect URIs
Ensure your OAuth applications are configured with the correct redirect URIs:
- Google: `https://your-backend-domain.onrender.com/api/auth/google/callback`
- GitHub: `https://your-backend-domain.onrender.com/api/auth/github/callback`

### 3. CORS Configuration
The backend is configured to accept requests from your frontend domain. Make sure the `FRONTEND_URL` environment variable is set correctly.

## Monitoring and Maintenance

### 1. Logs
- Access logs through Render Dashboard
- Monitor all three services (web, worker, cron)

### 2. Environment Variables
- Update environment variables through Render Dashboard
- Changes will trigger automatic redeployment

### 3. Scaling
For production, consider upgrading:
- **Plan**: From Starter to Standard/Pro for better performance
- **Auto Scaling**: Enable autoscaling for the web service
- **Database**: Upgrade MongoDB Atlas plan if needed

### 4. Custom Domains
1. Add custom domain in Render Dashboard
2. Update DNS records as instructed
3. Update OAuth redirect URIs with new domain

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Failed**
   - Verify MongoDB Atlas connection string
   - Check IP whitelist settings
   - Ensure database user has correct permissions

2. **OAuth Not Working**
   - Verify OAuth client IDs and secrets
   - Check redirect URI configuration
   - Ensure OAuth applications are approved/published

3. **CORS Errors**
   - Verify FRONTEND_URL environment variable
   - Check CORS_ORIGIN configuration
   - Ensure frontend domain is correct

4. **Build Failures**
   - Check build logs in Render Dashboard
   - Verify package.json dependencies
   - Ensure Node.js version compatibility

### Environment Variables Checklist:
- [ ] MONGODB_URI (with correct credentials)
- [ ] GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
- [ ] GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET
- [ ] FRONTEND_URL (pointing to deployed frontend)
- [ ] JWT_SECRET and SESSION_SECRET (auto-generated)

## Security Best Practices

1. **Never commit secrets** to version control
2. **Use environment variables** for all sensitive data
3. **Regularly rotate** OAuth secrets and JWT keys
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated** regularly

## Cost Optimization

1. **Free Tier Limits**: Render free tier has limitations
2. **Upgrade Plan**: Consider paid plans for production use
3. **Resource Monitoring**: Monitor CPU and memory usage
4. **Database Costs**: MongoDB Atlas M0 is free, larger clusters cost money

## Support

- **Render Documentation**: [render.com/docs](https://render.com/docs)
- **MongoDB Atlas**: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)
- **OAuth Setup**: Google and GitHub developer documentation
