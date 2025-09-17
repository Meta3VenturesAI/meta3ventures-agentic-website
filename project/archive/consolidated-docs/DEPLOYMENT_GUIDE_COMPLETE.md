# 🚀 Meta3Ventures Production Deployment Guide

## **STEP 1: PREPARE YOUR ENVIRONMENT**

### **1.1 Environment Variables Setup**
Create a `.env` file in your project root with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://wnayfmkkfhmickinwvay.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InduYXlmbWtrZmhtaWNraW53dmF5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzNjM0MzEsImV4cCI6MjA2NjkzOTQzMX0.tayfOKqguML34MN5Q492i-R2akx8YpqYsypawjQQp-M

# Formspree Configuration (for contact forms)
VITE_FORMSPREE_CONTACT_KEY=mldbpggn
VITE_FORMSPREE_APPLY_KEY=myzwnkkp
VITE_FORMSPREE_NEWSLETTER_KEY=xdkgwaaa

# Environment
NODE_ENV=production
```

### **1.2 Build and Test Locally**
```bash
# Install dependencies
npm install

# Build for production
npm run build

# Test the production build
npm run preview
```

---

## **STEP 2: DEPLOY TO NETLIFY (RECOMMENDED)**

### **2.1 Prepare Git Repository**
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Production ready Meta3Ventures website"

# Create GitHub repository and push
git remote add origin https://github.com/yourusername/meta3ventures.git
git push -u origin main
```

### **2.2 Deploy to Netlify**

1. **Go to [netlify.com](https://netlify.com) and sign up/login**
2. **Click "Add new site" → "Import an existing project"**
3. **Choose GitHub and select your repository**
4. **Configure build settings:**
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 18
   ```
5. **Add Environment Variables in Netlify:**
   - Go to Site settings → Environment variables
   - Add all the variables from your `.env` file
6. **Click "Deploy site"**

### **2.3 Configure Custom Domain**

Since you already have `meta3ventures.com` in your domain management:

1. **In Netlify Dashboard:**
   - Go to "Domain settings"
   - Click "Add custom domain"
   - Enter: `meta3ventures.com`

2. **Update DNS Records in Your Domain Provider:**
   Based on your screenshots, you'll need to add these records:

   ```
   Type: A
   Name: @
   Value: 75.2.60.5

   Type: CNAME
   Name: www
   Value: your-netlify-site.netlify.app
   ```

---

## **STEP 3: ALTERNATIVE DEPLOYMENT OPTIONS**

### **Option A: Vercel**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Follow prompts to configure domain
```

### **Option B: Cloudflare Pages**
1. Connect GitHub repository at pages.cloudflare.com
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add environment variables
5. Configure custom domain

---

## **STEP 4: DNS CONFIGURATION**

### **For meta3ventures.com Domain**

Based on your current DNS setup, you'll need to update:

**For Netlify:**
```
A Record: @ → 75.2.60.5
CNAME: www → your-site.netlify.app
```

**For Vercel:**
```
A Record: @ → 76.76.19.61
CNAME: www → cname.vercel-dns.com
```

**For Cloudflare Pages:**
```
A Record: @ → 172.66.40.1
CNAME: www → your-site.pages.dev
```

---

## **STEP 5: POST-DEPLOYMENT VERIFICATION**

### **5.1 Test All Features**
- [ ] Visit https://meta3ventures.com
- [ ] Test contact form → Should receive email
- [ ] Test application form → Should receive submission
- [ ] Test newsletter signup → Should receive confirmation
- [ ] Check mobile responsiveness
- [ ] Verify dark mode toggle
- [ ] Test all navigation links
- [ ] Verify portfolio carousel
- [ ] Check blog functionality

### **5.2 Performance Check**
- [ ] Run Google PageSpeed Insights
- [ ] Check Core Web Vitals
- [ ] Verify PWA installation
- [ ] Test loading speeds

### **5.3 SEO Setup**
- [ ] Submit to Google Search Console
- [ ] Submit sitemap: meta3ventures.com/sitemap.xml
- [ ] Test social media sharing
- [ ] Verify meta tags

---

## **STEP 6: MONITORING & MAINTENANCE**

### **6.1 Set Up Monitoring**
1. **Google Analytics** (optional)
2. **Google Search Console** (recommended)
3. **Uptime monitoring** (UptimeRobot, Pingdom)

### **6.2 Regular Maintenance**
- Monitor form submissions
- Update dependencies monthly
- Check performance metrics
- Backup Supabase data

---

## **STEP 7: TROUBLESHOOTING**

### **Common Issues & Solutions**

**Forms not working:**
- Check environment variables are set correctly
- Verify Formspree keys are active
- Check browser console for errors

**Site not loading:**
- Verify DNS propagation (can take 24-48 hours)
- Check build logs in deployment platform
- Ensure all environment variables are set

**Performance issues:**
- Check image optimization
- Verify CDN is working
- Review bundle size

**Domain issues:**
- Verify DNS records are correct
- Check domain propagation status
- Ensure SSL certificate is active

---

## **STEP 8: PRODUCTION CHECKLIST**

### **Before Going Live:**
- [ ] All environment variables configured
- [ ] Build successful without errors
- [ ] All forms tested and working
- [ ] Images loading correctly
- [ ] Mobile responsiveness verified
- [ ] Dark mode functioning
- [ ] SEO meta tags in place
- [ ] SSL certificate active
- [ ] Domain pointing correctly

### **After Going Live:**
- [ ] Monitor form submissions
- [ ] Check analytics setup
- [ ] Verify search engine indexing
- [ ] Test from different devices/browsers
- [ ] Monitor performance metrics

---

## **🎉 SUCCESS METRICS**

Once deployed, your website should achieve:
- **Performance**: >90 Lighthouse score
- **Accessibility**: 100/100
- **SEO**: >95 score
- **Load Time**: <3 seconds
- **Uptime**: >99.9%

---

## **SUPPORT CONTACTS**

- **Netlify Support**: support@netlify.com
- **Vercel Support**: support@vercel.com
- **Cloudflare Support**: support@cloudflare.com
- **Supabase Support**: support@supabase.io
- **Formspree Support**: support@formspree.io

---

## **NEXT STEPS**

1. **Choose your deployment platform** (Netlify recommended)
2. **Set up your Git repository**
3. **Configure environment variables**
4. **Deploy and test**
5. **Configure your domain DNS**
6. **Monitor and maintain**

Your Meta3Ventures website is production-ready and will provide an excellent user experience for potential partners and clients!