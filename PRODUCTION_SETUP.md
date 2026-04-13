# 🚀 9 Nutzz Millets - Production Deployment Guide

This document contains everything you need to successfully deploy the platform to your production server (Vercel).

## 1. Environment Variables
You MUST add the following variables to your **Vercel Project Settings > Environment Variables** for the app to function:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `MONGODB_URI` | Your MongoDB Atlas Connection String | `mongodb+srv://...` |
| `EMAIL_USER` | The email used for sending OTPs | `9NUTZMILLETSGMD@gmail.com` |
| `EMAIL_PASSWORD` | The **App Password** for your email | `roam zvyv tukh ucvb` |
| `NEXT_PUBLIC_URL` | Your production URL | `https://9nutzz-millets.vercel.app` |

---

## 2. Final Deployment Steps
1.  **Git Push**: Ensure the latest code (including the new product photos) is pushed to GitHub.
    ```bash
    git push origin main
    ```
2.  **Vercel Build**: Check the Vercel dashboard. The build should trigger automatically and succeed.
3.  **Verify Catalog**: Once live, visit your Shop page. You should see the new professional photography for all categories (Laddus, Murukulu, etc.).

---

## 3. Post-Deployment Checklist
- [ ] Test **Order Tracking** with a sample Order ID.
- [ ] Test **Admin Login** and verify you can now directly "Add/Remove" product photos with previews.
- [ ] Confirm **Delivery Radius** works by trying to place an order from a dummy location.

---

**Support**: If you encounter any build errors, please contact your developer. Happy healthy selling! 🥜
