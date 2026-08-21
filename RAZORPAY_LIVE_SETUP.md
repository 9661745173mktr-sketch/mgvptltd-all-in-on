# Razorpay Live + Wallet + Service Wallet Update

## Live environment variables (backend)
Set these on the backend server; never put the Secret in frontend code:

- `DATABASE_URL`
- `RAZORPAY_KEY_ID` = your live `rzp_live_...` key id
- `RAZORPAY_KEY_SECRET` = your live key secret
- `RAZORPAY_WEBHOOK_SECRET` = the secret configured in Razorpay webhook settings

Frontend:
- `NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-DOMAIN`

## Razorpay webhook
Create a webhook pointing to:
`https://YOUR-BACKEND-DOMAIN/api/payments/razorpay/webhook`

Enable `payment.captured`.

## Wallet rules in this update
- New user wallet starts at ₹0.
- Razorpay verified recharge credits the user's wallet automatically.
- Every service request checks the current service charge and debits the user wallet.
- The service charge is credited to the admin wallet ledger.
- Rejected service requests automatically refund the deducted service charge to the same user.
- Admin can change service charges from the existing service-control area; the configured amount is used for future requests.
- Admin can upload a service completion slip; user service history can view/download the uploaded document.

## Important
Take a database backup before applying the Prisma schema changes. Run Prisma migration/generate on the server using your normal deployment process.
