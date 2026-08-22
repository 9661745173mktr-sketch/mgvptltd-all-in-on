# MG-PVT-LTD Glossy Service Portal Upgrade

This version upgrades the retailer portal into a complete service hub with:

- Glossy dark/glass enterprise UI.
- 30+ active service cards grouped by category.
- Detailed Aadhaar correction/update forms matching the requested workflow style:
  Name, DOB, Gender, C/O Address, Mobile Update, Aadhaar PVC/Print and more.
- PAN, GST, AEPS, DMT, BBPS, recharge, certificates, passport, print portal, B2B, SaaS, affiliate and travel request forms.
- Required-field validation, file upload fields, preview/review step and request history.
- Admin Service Control Center with Enable/Disable and Enable All/Disable All.
- Retailer portal automatically respects the master service status stored in localStorage.
- Existing wallet request/history and support-chat workflow retained in the retailer dashboard.

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

For production:

```bash
cd frontend
npm install
npm run build
npm run start
```

## Run backend

```bash
cd backend
npm install
npm run build
npm start
```

> The supplied `.env` file is intentionally not copied into the clean delivery archive. Put your own environment values back before deployment.

## Important

The service forms in this upgrade are request/collection forms. They do not claim to be direct UIDAI, NSDL, UTI, GST, AEPS, DMT, BBPS or other government/provider API integrations. Connect your authorised provider APIs separately when credentials and endpoints are available.
