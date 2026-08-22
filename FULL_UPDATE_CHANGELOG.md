# Full requested update

- Retailer/distributor/super/master role hierarchy is preserved.
- New accounts start wallet at zero.
- Wallet recharge supports Razorpay Live Checkout from the user dashboard.
- Server verifies Razorpay signature before crediting wallet.
- Razorpay webhook endpoint is included for payment.captured reconciliation.
- Service charge is read from Admin service pricing override (`master_service_prices`) when configured; otherwise the catalog default is used.
- Service request deducts the exact configured charge from the requesting user's wallet.
- That charge is credited to the admin wallet ledger.
- Admin reject/refund returns the exact deducted amount to the original user and debits the admin wallet.
- Admin can upload a slip/document on service completion; it is saved with the request and user service history has View/Download.
- Existing menus/pages are retained; changes are additive.
- `RAZORPAY_LIVE_SETUP.md` contains environment/webhook deployment steps.
- Service requests and Admin Approve/Reject now use the server API/Prisma database path instead of browser `localStorage`.
- The live frontend expects `NEXT_PUBLIC_API_BASE_URL` to point at the deployed backend API.
