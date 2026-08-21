# MG PVT LTD Premium Portal – Hostinger Deployment

## Included
- Role-based Partner ID creation:
  - Master Distributor ₹4,999
  - Super Distributor ₹2,999
  - Distributor ₹1,999
  - Retailer ₹999
- Hierarchy permissions:
  - Master → Super / Distributor / Retailer
  - Super → Distributor / Retailer
  - Distributor → Retailer
  - Retailer → no child creation
- Fixed amount UPI dynamic QR using `9661745173mktr-1@oksbi`
- UTR submission flow; payment is **not automatically verified**.
- PWA manifest + service worker + Install App button.
- Prisma schema updated for parent/child hierarchy.

## Important production note
The current front-end ID request screen stores request data in browser localStorage. For a real multi-user production portal, use the included Node/Prisma backend API and a server database so requests are shared across devices. Do not mark a payment as successful only because a UTR was entered; verify the transaction before activating an ID.

## Hostinger
If your Hostinger plan supports Node.js applications:
1. Upload the project.
2. Frontend: `cd frontend && npm install && npm run build && npm start`
3. Backend: `cd backend && npm install && npx prisma generate && npm run build && npm start`
4. Set environment variable `DATABASE_URL` for the production database.
5. Configure the domain/subdomain to the frontend app and API proxy/base URL as required by your Hostinger plan.

If your plan is PHP-only/shared hosting without Node.js app support, this Next.js + Express project cannot be run there directly. Use Hostinger Node.js hosting/VPS or another Node-compatible server.

## PWA
After HTTPS is enabled, supported browsers show `Install MG Portal App`. On Android Chrome, the browser may also show Install App from its menu.

## Aadhaar Correction quick links
Set these environment variables in the frontend deployment:
- NEXT_PUBLIC_REMOTE_VPN_LINK = your authorized Remote/VPN URL
- NEXT_PUBLIC_VHUI64_LINK = your authorized VHUI64 URL
These buttons appear only in the Aadhaar Correction section.
.