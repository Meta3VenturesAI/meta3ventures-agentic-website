# 🚀 Quick Deploy to Production

## **FASTEST PATH: Netlify Deploy**

### **1. Prepare Repository (5 minutes)**
```bash
git init
git add .
git commit -m "Production ready Meta3Ventures website"
git remote add origin https://github.com/yourusername/meta3ventures.git
git push -u origin main
```

### **2. Deploy to Netlify (5 minutes)**
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose GitHub → Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Click "Deploy site"

### **3. Add Environment Variables (2 minutes)**
In Netlify Dashboard → Site settings → Environment variables:
```
VITE_SUPABASE_URL = https://wnayfmkkfhmickinwvay.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYXlmbWtrZmhtaWNraW53dmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjM0MzEsImV4cCI6MjA2NjkzOTQzMX0.tayfOKqguML34MN5Q492i-R2akx8YpqYsypawjQQp-M
VITE_FORMSPREE_CONTACT_KEY = mldbpggn
VITE_FORMSPREE_APPLY_KEY = myzwnkkp
VITE_FORMSPREE_NEWSLETTER_KEY = xdkgwaaa
```

### **4. Configure Domain (3 minutes)**
1. In Netlify → Domain settings → Add custom domain: `meta3ventures.com`
2. Update DNS in your domain provider:
   ```
   A Record: @ → 75.2.60.5
   CNAME: www → your-site.netlify.app
   ```

### **🎉 DONE! Your site will be live at meta3ventures.com**

**Total time: ~15 minutes**