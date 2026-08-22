# MG PVT LTD Portal – Live Update Notes

This ZIP updates the portal workflow so service requests and wallet balances are handled by the backend database instead of browser-only localStorage.

## Main changes
- Retailer/distributor service requests are stored in the backend with real account name, mobile, email and role.
- Service price is deducted from the logged-in user's wallet when the request is submitted.
- Admin sees the actual submitted customer/service details.
- Aadhaar requests are available separately in Admin → Aadhaar Service Control.
- Admin Approve changes request status.
- Admin Reject automatically refunds the deducted service amount to the same retailer wallet.
- Wallet load requests are stored in the backend; Admin approval adds the requested amount to the retailer wallet.
- Admin can manually credit a user's wallet by mobile number.
- Profile name/mobile/email are loaded from the real account.
- Retailer can update profile and change password.
- Login now uses backend authentication; username/mobile/email can be used.
- Partner ID creation is role controlled: Master → Super/Distributor/Retailer; Super → Distributor/Retailer; Distributor → Retailer; Retailer → no ID creation.
- ID creation requests go to Admin → ID Creation Requests; approval creates the actual user account with the requested username/password.
- Admin dashboard stats can use live database totals.

## IMPORTANT: live deployment
1. Back up the live database before deploying.
2. Backend environment:
   - `DATABASE_URL=file:./prisma/dev.db` for the bundled SQLite setup, or your production database URL.
   - `AUTH_SECRET=<long-random-secret>`
   - `ADMIN_EMAIL=<your-admin-email>`
   - `ADMIN_PASSWORD=<strong-admin-password>`
   - optional `ADMIN_NAME`, `ADMIN_PHONE`
   - optional `ADMIN_RESET_PASSWORD=true` when you intentionally want the configured admin password reset.
3. Install backend dependencies and run:
   - `npm install`
   - `npm run generate`
   - `npm run db:push`
   - `npm run build`
   - `npm start`
4. Frontend environment:
   - `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN/api`
5. Build and restart the Next.js frontend.
6. Log in once through `/admin/login` using the admin account configured by `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

Do not use the old demo `admin/admin123` credentials in production.

## Note
The backend uses SQLite in this project. For a busy production portal, PostgreSQL/MySQL is recommended later, but the current update keeps the existing SQLite architecture to minimize live-site changes.
