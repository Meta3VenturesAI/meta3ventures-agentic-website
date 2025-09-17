# Meta3Ventures Production Deployment Guide

## 🚀 Quick Deployment Checklist

### 1. Supabase Database Setup

**Create Supabase Project:**
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note down your `Project URL` and `anon public key`
3. Go to SQL Editor in Supabase Dashboard
4. Run the migration file: `supabase/migrations/004_complete_production_schema.sql`

**This single migration creates ALL required tables:**
- page_views, leads, blog_posts, form_submissions
- analytics_events, chat_conversations, application_submissions
- user_sessions, and all necessary indexes and policies

### 2. Environment Variables

**For Netlify Deployment, set these environment variables:**

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_FORMSPREE_FORM_ID=myzwnkkp
NODE_ENV=production
```

### 3. Netlify Deployment

**Connect GitHub Repository:**
1. Repository: `Meta3VenturesAI/meta3ventures-website-new`
2. Branch: `main`
3. Build command: `npm run build` (auto-detected)
4. Publish directory: `dist` (auto-detected)
5. Add environment variables
6. Deploy!

## 📊 Features Enabled After Database Setup

✅ **Real Analytics**: Live traffic and conversion tracking
✅ **Lead Management**: Actual lead capture and tracking  
✅ **Application Processing**: Funding application workflow
✅ **AI Chat History**: Conversation persistence
✅ **Admin Dashboard**: Real data instead of demo mode
✅ **Form Processing**: All contact forms working

## 🔧 Post-Deployment Verification

1. **Admin Login**: Use password `metaMETA1234!`
2. **Test Contact Form**: Should appear in Supabase `form_submissions`
3. **Test Apply Form**: Should appear in `application_submissions`
4. **Analytics**: Should show real data instead of demo mode

🎉 **Production Ready!**
