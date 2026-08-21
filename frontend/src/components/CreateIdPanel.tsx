'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

/* =========================================================
   COMPANY PAYMENT DETAILS
========================================================= */

const COMPANY_UPI_ID = '9661745173mktr-1@oksbi';
const COMPANY_NAME = 'MG PVT LTD';

/* =========================================================
   ROLE TYPES
========================================================= */

type UserRole =
  | 'master_distributor'
  | 'super_distributor'
  | 'distributor'
  | 'retailer'
  | 'admin'
  | 'unknown';

type CreateRole =
  | 'master_distributor'
  | 'super_distributor'
  | 'distributor'
  | 'retailer';

type RoleConfig = {
  key: CreateRole;
  label: string;
  shortLabel: string;
  fee: number;
  icon: string;
  color: string;
};

/* =========================================================
   ID CREATION CHARGES
========================================================= */

const ROLE_CONFIGS: RoleConfig[] = [
  {
    key: 'master_distributor',
    label: 'Master Distributor',
    shortLabel: 'Master Dis.',
    fee: 4999,
    icon: '👑',
    color: '#f59e0b',
  },
  {
    key: 'super_distributor',
    label: 'Super Distributor',
    shortLabel: 'Super Dis.',
    fee: 2999,
    icon: '⭐',
    color: '#a855f7',
  },
  {
    key: 'distributor',
    label: 'Distributor',
    shortLabel: 'Distributor',
    fee: 1999,
    icon: '🏢',
    color: '#3b82f6',
  },
  {
    key: 'retailer',
    label: 'Retailer',
    shortLabel: 'Retailer',
    fee: 999,
    icon: '🛍️',
    color: '#10b981',
  },
];

/* =========================================================
   STORAGE KEY
========================================================= */

const ID_CREATION_DB_KEY = 'id_creation_requests_db';

/* =========================================================
   NORMALIZE ROLE
========================================================= */

function normalizeRole(value: any): UserRole {
  if (!value) {
    return 'unknown';
  }

  const role = String(value)
    .toLowerCase()
    .trim()
    .replace(/-/g, '_')
    .replace(/\s+/g, '_');

  if (
    role === 'master' ||
    role === 'master_distributor' ||
    role === 'masterdistributor' ||
    role === 'master_dis'
  ) {
    return 'master_distributor';
  }

  if (
    role === 'super' ||
    role === 'super_distributor' ||
    role === 'superdistributor' ||
    role === 'super_dis'
  ) {
    return 'super_distributor';
  }

  if (
    role === 'distributor' ||
    role === 'dis'
  ) {
    return 'distributor';
  }

  if (
    role === 'retailer' ||
    role === 'retailor' ||
    role === 'retail'
  ) {
    return 'retailer';
  }

  if (
    role === 'admin' ||
    role === 'super_admin' ||
    role === 'administrator'
  ) {
    return 'admin';
  }

  return 'unknown';
}

/* =========================================================
   GET CURRENT USER
========================================================= */

function getCurrentUser() {
  try {
    const possibleKeys = [
      'currentUser',
      'user',
      'loggedInUser',
      'current_user',
    ];

    for (const key of possibleKeys) {
      const raw = localStorage.getItem(key);

      if (!raw) {
        continue;
      }

      try {
        const parsed = JSON.parse(raw);

        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      } catch {
        // Continue
      }
    }

    return null;
  } catch {
    return null;
  }
}

/* =========================================================
   GET CURRENT ROLE
========================================================= */

function getCurrentRole(): UserRole {
  try {
    const user = getCurrentUser();

    if (!user) {
      return 'unknown';
    }

    const possibleRoleValues = [
      user.role,
      user.userRole,
      user.user_role,
      user.type,
      user.accountType,
      user.account_type,
      user.designation,
    ];

    for (const value of possibleRoleValues) {
      const normalized = normalizeRole(value);

      if (normalized !== 'unknown') {
        return normalized;
      }
    }

    return 'unknown';
  } catch {
    return 'unknown';
  }
}

/* =========================================================
   ROLE PERMISSIONS

   MASTER
   ↓
   SUPER + DISTRIBUTOR + RETAILER

   SUPER
   ↓
   DISTRIBUTOR + RETAILER

   DISTRIBUTOR
   ↓
   RETAILER

   RETAILER
   ↓
   NOTHING
========================================================= */

function getAllowedRoles(
  currentRole: UserRole
): RoleConfig[] {
  switch (currentRole) {
    case 'admin':
      return ROLE_CONFIGS;

    case 'master_distributor':
      return ROLE_CONFIGS.filter(
        (role) =>
          role.key === 'super_distributor' ||
          role.key === 'distributor' ||
          role.key === 'retailer'
      );

    case 'super_distributor':
      return ROLE_CONFIGS.filter(
        (role) =>
          role.key === 'distributor' ||
          role.key === 'retailer'
      );

    case 'distributor':
      return ROLE_CONFIGS.filter(
        (role) =>
          role.key === 'retailer'
      );

    case 'retailer':
    default:
      return [];
  }
}

/* =========================================================
   REQUEST TYPE
========================================================= */

type IdCreationRequest = {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorMobile: string;
  creatorRole: UserRole;

  requestedRole: CreateRole;
  requestedRoleLabel: string;

  amount: number;

  applicantName: string;
  applicantMobile: string;
  applicantEmail: string;

  username: string;
  password: string;

  utr: string;

  paymentStatus: 'Pending';
  status: 'Pending';

  createdAt: string;
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function CreateIdPanel() {
  /* =======================================================
     CURRENT USER
  ======================================================= */

  const [currentRole, setCurrentRole] =
    useState<UserRole>('unknown');

  const [currentUser, setCurrentUser] =
    useState<any>(null);

  /* =======================================================
     SELECTED ROLE
  ======================================================= */

  const [selectedRole, setSelectedRole] =
    useState<CreateRole | ''>('');

  /* =======================================================
     APPLICANT DETAILS
  ======================================================= */

  const [applicantName, setApplicantName] =
    useState('');

  const [applicantMobile, setApplicantMobile] =
    useState('');

  const [applicantEmail, setApplicantEmail] =
    useState('');

  const [username, setUsername] =
    useState('');

  const [password, setPassword] =
    useState('');

  /* =======================================================
     PAYMENT
  ======================================================= */

  const [utr, setUtr] =
    useState('');

  const [submitting, setSubmitting] =
    useState(false);

  const [successMessage, setSuccessMessage] =
    useState('');

  /* =======================================================
     LOAD USER
  ======================================================= */

  useEffect(() => {
    const user = getCurrentUser();

    const role = getCurrentRole();

    setCurrentUser(user);

    setCurrentRole(role);

    /*
     * Default applicant information
     */
    if (user) {
      if (user.name) {
        setApplicantName(
          String(user.name)
        );
      }

      if (user.phone) {
        setApplicantMobile(
          String(user.phone)
        );
      }

      if (user.mobile) {
        setApplicantMobile(
          String(user.mobile)
        );
      }

      if (user.email) {
        setApplicantEmail(
          String(user.email)
        );
      }
    }
  }, []);

  /* =======================================================
     ALLOWED ROLES
  ======================================================= */

  const allowedRoles = useMemo(() => {
    return getAllowedRoles(
      currentRole
    );
  }, [currentRole]);

  /* =======================================================
     SELECTED ROLE CONFIG
  ======================================================= */

  const selectedRoleConfig =
    useMemo(() => {
      if (!selectedRole) {
        return null;
      }

      return (
        ROLE_CONFIGS.find(
          (role) =>
            role.key ===
            selectedRole
        ) || null
      );
    }, [selectedRole]);

  /* =======================================================
     DYNAMIC UPI PAYMENT URL
  ======================================================= */

  const paymentAmount =
    selectedRoleConfig?.fee || 0;

  const upiPayload = useMemo(() => {
    const params = new URLSearchParams();

    params.set(
      'pa',
      COMPANY_UPI_ID
    );

    params.set(
      'pn',
      COMPANY_NAME
    );

    if (paymentAmount > 0) {
      params.set(
        'am',
        paymentAmount.toFixed(2)
      );
    }

    params.set(
      'cu',
      'INR'
    );

    return `upi://pay?${params.toString()}`;
  }, [paymentAmount]);

  /* =======================================================
     ROLE SELECT
  ======================================================= */

  const handleRoleSelect = (
    role: CreateRole
  ) => {
    setSelectedRole(role);

    setSuccessMessage('');

    /*
     * Reset payment details
     * when role changes
     */
    setUtr('');
  };

  /* =======================================================
     COPY UPI
  ======================================================= */

  const copyUpi = async () => {
    try {
      await navigator.clipboard.writeText(
        COMPANY_UPI_ID
      );

      alert(
        'UPI ID copied successfully.'
      );
    } catch {
      alert(
        'UPI ID copy नहीं हो पाया।'
      );
    }
  };

  /* =======================================================
     OPEN UPI APP
  ======================================================= */

  const openUpiApp = () => {
    if (!selectedRoleConfig) {
      alert(
        'पहले ID Role select करें।'
      );
      return;
    }

    window.location.href =
      upiPayload;
  };

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validateForm = () => {
    if (!selectedRoleConfig) {
      alert(
        'कृपया पहले ID Role select करें।'
      );

      return false;
    }

    if (!applicantName.trim()) {
      alert(
        'Applicant का नाम दर्ज करें।'
      );

      return false;
    }

    if (
      applicantMobile.trim().length <
      10
    ) {
      alert(
        'सही mobile number दर्ज करें।'
      );

      return false;
    }

    if (
      username.trim().length <
      4
    ) {
      alert(
        'Username कम से कम 4 characters का होना चाहिए।'
      );

      return false;
    }

    if (
      password.length <
      6
    ) {
      alert(
        'Password कम से कम 6 characters का होना चाहिए।'
      );

      return false;
    }

    if (
      utr.trim().length <
      6
    ) {
      alert(
        'Payment करने के बाद सही UTR / Transaction Reference डालें।'
      );

      return false;
    }

    return true;
  };

  /* =======================================================
     SUBMIT ID CREATION REQUEST
     
     IMPORTANT:
     यह payment को automatically verify नहीं करता।
     Request Pending रहेगी।
     Admin verification के बाद ID activate करनी चाहिए।
  ======================================================= */

  const submitRequest = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!selectedRoleConfig) {
      return;
    }

    setSubmitting(true);

    try {
      const creatorId =
        currentUser?.id ||
        currentUser?.userId ||
        currentUser?.retailerId ||
        currentUser?.phone ||
        localStorage.getItem(
          'retailer_id'
        ) ||
        'unknown';

      const creatorName =
        currentUser?.name ||
        currentUser?.fullName ||
        'Unknown User';

      const creatorMobile =
        currentUser?.phone ||
        currentUser?.mobile ||
        '';

      const request: IdCreationRequest =
        {
          id: `IDREQ-${Date.now()}`,

          creatorId:
            String(creatorId),

          creatorName:
            String(creatorName),

          creatorMobile:
            String(creatorMobile),

          creatorRole:
            currentRole,

          requestedRole:
            selectedRoleConfig.key,

          requestedRoleLabel:
            selectedRoleConfig.label,

          amount:
            selectedRoleConfig.fee,

          applicantName:
            applicantName.trim(),

          applicantMobile:
            applicantMobile.trim(),

          applicantEmail:
            applicantEmail.trim(),

          username:
            username.trim(),

          password:
            password,

          utr:
            utr.trim(),

          paymentStatus:
            'Pending',

          status:
            'Pending',

          createdAt:
            new Date().toISOString(),
        };

      /* ===============================================
         SAVE REQUEST
      =============================================== */

      const oldRaw =
        localStorage.getItem(
          ID_CREATION_DB_KEY
        );

      let oldRequests:
        IdCreationRequest[] = [];

      try {
        const parsed =
          JSON.parse(
            oldRaw || '[]'
          );

        if (
          Array.isArray(parsed)
        ) {
          oldRequests =
            parsed;
        }
      } catch {
        oldRequests = [];
      }

      localStorage.setItem(
        ID_CREATION_DB_KEY,
        JSON.stringify([
          request,
          ...oldRequests,
        ])
      );

      /* ===============================================
         ADMIN UPDATE EVENT
      =============================================== */

      window.dispatchEvent(
        new Event(
          'id_creation_updated'
        )
      );

      /* ===============================================
         SUCCESS
      =============================================== */

      setSuccessMessage(
        `₹${selectedRoleConfig.fee.toLocaleString(
          'en-IN'
        )} का ${selectedRoleConfig.label} creation request successfully submit हो गया है। Admin verification के बाद ID activate होगी।`
      );

      alert(
        'ID Creation Request Successfully Submitted! Admin verification के बाद ID activate होगी.'
      );

      /* ===============================================
         RESET PAYMENT
      =============================================== */

      setSelectedRole('');

      setUtr('');

      setUsername('');

      setPassword('');
    } catch (error) {
      console.error(
        'ID creation request error:',
        error
      );

      alert(
        'Request submit नहीं हुई। कृपया दोबारा प्रयास करें।'
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =======================================================
     NO PERMISSION
  ======================================================= */

  if (
    currentRole ===
    'retailer'
  ) {
    return (
      <div className="mx-auto max-w-3xl">

        <div className="rounded-3xl border border-amber-400/20 bg-gradient-to-br from-slate-900 via-[#0b1324] to-[#071020] p-8 text-center shadow-2xl">

          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-amber-400/10 text-4xl">
            🔒
          </div>

          <h2 className="mt-5 text-2xl font-black text-white">
            ID Creation Permission नहीं है
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-400">
            Retailer account से कोई नया
            Distributor / Retailer ID create
            नहीं किया जा सकता।
          </p>

          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">

            <div className="text-xs uppercase tracking-widest text-slate-500">
              Your Current Role
            </div>

            <div className="mt-2 text-lg font-black text-emerald-300">
              🛍️ Retailer
            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     UNKNOWN ROLE
  ======================================================= */

  if (
    currentRole ===
      'unknown' ||
    allowedRoles.length ===
      0
  ) {
    return (
      <div className="mx-auto max-w-3xl">

        <div className="rounded-3xl border border-rose-400/20 bg-gradient-to-br from-slate-900 to-[#071020] p-8 text-center">

          <div className="text-5xl">
            ⚠️
          </div>

          <h2 className="mt-4 text-2xl font-black">
            User Role नहीं मिला
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            Current login account में
            role information नहीं मिली।
            कृपया logout करके दोबारा login करें।
          </p>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-left">

            <div className="text-xs text-slate-500">
              Detected Role
            </div>

            <div className="mt-1 font-black text-rose-300">
              {currentRole}
            </div>

          </div>

        </div>

      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="mx-auto max-w-6xl">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-6 rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-blue-950/20 p-6 shadow-2xl">

        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div>

            <div className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-cyan-300">
              ID Creation Portal
            </div>

            <h1 className="mt-3 text-2xl font-black md:text-3xl">
              Create New ID
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              अपने permission level के अनुसार
              नया Master Distributor,
              Super Distributor, Distributor
              या Retailer ID creation request
              submit करें।
            </p>

          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-5 py-4">

            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Your Role
            </div>

            <div className="mt-1 text-lg font-black text-emerald-300">
              {currentRole ===
                'admin'
                ? '🛡️ Admin'
                : currentRole ===
                  'master_distributor'
                ? '👑 Master Distributor'
                : currentRole ===
                  'super_distributor'
                ? '⭐ Super Distributor'
                : currentRole ===
                  'distributor'
                ? '🏢 Distributor'
                : 'User'}
            </div>

          </div>

        </div>

      </div>

      {/* ===================================================
          ROLE HIERARCHY
      =================================================== */}

      <div className="mb-6 rounded-3xl border border-white/5 bg-slate-900/70 p-5">

        <div className="mb-4">

          <h2 className="text-lg font-black">
            ID Creation Charges
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Role के अनुसार creation fee
          </p>

        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {ROLE_CONFIGS.map(
            (role) => {

              const allowed =
                allowedRoles.some(
                  (x) =>
                    x.key ===
                    role.key
                );

              return (
                <div
                  key={
                    role.key
                  }
                  className={`rounded-2xl border p-4 transition ${
                    allowed
                      ? 'border-cyan-400/20 bg-slate-950/70'
                      : 'border-slate-800 bg-slate-950/30 opacity-50'
                  }`}
                >

                  <div className="flex items-center justify-between">

                    <div className="text-3xl">
                      {role.icon}
                    </div>

                    {allowed ? (
                      <span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-black text-emerald-300">
                        AVAILABLE
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-[9px] font-black text-slate-500">
                        LOCKED
                      </span>
                    )}

                  </div>

                  <div className="mt-3 text-sm font-black">
                    {role.label}
                  </div>

                  <div
                    className="mt-2 text-2xl font-black"
                    style={{
                      color:
                        role.color,
                    }}
                  >
                    ₹
                    {role.fee.toLocaleString(
                      'en-IN'
                    )}
                  </div>

                </div>
              );
            }
          )}

        </div>

      </div>

      {/* ===================================================
          CREATION FORM
      =================================================== */}

      <form
        onSubmit={
          submitRequest
        }
        className="grid gap-6 lg:grid-cols-[1.05fr_.95fr]"
      >

        {/* =================================================
            LEFT FORM
        ================================================= */}

        <div className="rounded-3xl border border-white/5 bg-slate-900/75 p-6 shadow-2xl">

          <h2 className="text-xl font-black">
            📝 Create ID Request
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            Applicant details भरें।
          </p>

          {/* ROLE */}

          <div className="mt-6">

            <label className="mb-2 block text-xs font-black text-cyan-300">
              Select ID Role *
            </label>

            <select
              value={
                selectedRole
              }
              onChange={(e) =>
                handleRoleSelect(
                  e.target
                    .value as CreateRole
                )
              }
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm font-bold outline-none focus:border-cyan-400"
            >

              <option value="">
                Select Role
              </option>

              {allowedRoles.map(
                (role) => (
                  <option
                    key={
                      role.key
                    }
                    value={
                      role.key
                    }
                  >
                    {role.label} — ₹
                    {role.fee.toLocaleString(
                      'en-IN'
                    )}
                  </option>
                )
              )}

            </select>

          </div>

          {/* SELECTED ROLE CARD */}

          {selectedRoleConfig && (
            <div
              className="mt-4 rounded-2xl border p-4"
              style={{
                borderColor:
                  `${selectedRoleConfig.color}55`,
                background:
                  `${selectedRoleConfig.color}0d`,
              }}
            >

              <div className="flex items-center justify-between">

                <div>

                  <div className="text-[10px] uppercase tracking-widest text-slate-500">
                    Selected ID
                  </div>

                  <div className="mt-1 text-lg font-black">
                    {
                      selectedRoleConfig.icon
                    }{' '}
                    {
                      selectedRoleConfig.label
                    }
                  </div>

                </div>

                <div className="text-right">

                  <div className="text-[10px] text-slate-500">
                    Creation Fee
                  </div>

                  <div className="text-2xl font-black text-emerald-300">
                    ₹
                    {selectedRoleConfig.fee.toLocaleString(
                      'en-IN'
                    )}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* NAME */}

          <div className="mt-5">

            <label className="mb-2 block text-xs font-black text-slate-300">
              Applicant Full Name *
            </label>

            <input
              value={
                applicantName
              }
              onChange={(e) =>
                setApplicantName(
                  e.target.value
                )
              }
              placeholder="Enter full name"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />

          </div>

          {/* MOBILE */}

          <div className="mt-4">

            <label className="mb-2 block text-xs font-black text-slate-300">
              Mobile Number *
            </label>

            <input
              type="tel"
              value={
                applicantMobile
              }
              onChange={(e) =>
                setApplicantMobile(
                  e.target.value
                )
              }
              placeholder="10 digit mobile number"
              maxLength={15}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />

          </div>

          {/* EMAIL */}

          <div className="mt-4">

            <label className="mb-2 block text-xs font-black text-slate-300">
              Email
            </label>

            <input
              type="email"
              value={
                applicantEmail
              }
              onChange={(e) =>
                setApplicantEmail(
                  e.target.value
                )
              }
              placeholder="example@email.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />

          </div>

          {/* USERNAME */}

          <div className="mt-4">

            <label className="mb-2 block text-xs font-black text-slate-300">
              Login Username / ID *
            </label>

            <input
              value={
                username
              }
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              placeholder="Create username"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />

          </div>

          {/* PASSWORD */}

          <div className="mt-4">

            <label className="mb-2 block text-xs font-black text-slate-300">
              Login Password *
            </label>

            <input
              type="password"
              value={
                password
              }
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              placeholder="Minimum 6 characters"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-cyan-400"
            />

          </div>

          {/* UTR */}

          <div className="mt-4">

            <label className="mb-2 block text-xs font-black text-cyan-300">
              UTR / Transaction Reference *
            </label>

            <input
              value={
                utr
              }
              onChange={(e) =>
                setUtr(
                  e.target.value
                )
              }
              maxLength={50}
              placeholder="Payment के बाद UTR डालें"
              className="w-full rounded-xl border border-emerald-400/20 bg-slate-800 px-4 py-3 text-sm font-bold outline-none focus:border-emerald-400"
            />

            <p className="mt-2 text-[10px] leading-5 text-slate-500">
              पहले QR से payment करें, फिर
              transaction का UTR यहाँ डालें।
            </p>

          </div>

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={
              submitting ||
              !selectedRoleConfig
            }
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 py-3.5 text-sm font-black shadow-lg shadow-cyan-500/20 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting
              ? 'Submitting...'
              : selectedRoleConfig
              ? `Submit ${selectedRoleConfig.label} Request ₹${selectedRoleConfig.fee.toLocaleString(
                  'en-IN'
                )}`
              : 'Select ID Role First'}
          </button>

          {/* SUCCESS */}

          {successMessage && (
            <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-xs leading-5 text-emerald-300">
              ✅ {successMessage}
            </div>
          )}

        </div>

        {/* =================================================
            RIGHT PAYMENT PANEL
        ================================================= */}

        <div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-slate-900 via-[#0b1324] to-[#071020] p-6 shadow-2xl">

          <div className="text-center">

            <div className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-300">
              Dynamic UPI Payment
            </div>

            <h2 className="mt-3 text-xl font-black">
              📱 Scan & Pay
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Selected ID के अनुसार amount
              automatically QR में आएगा।
            </p>

          </div>

          {/* QR */}

          <div className="mt-6 flex justify-center">

            <div className="rounded-3xl bg-white p-5 shadow-2xl">

              {selectedRoleConfig ? (
                <QRCodeSVG
                  value={
                    upiPayload
                  }
                  size={250}
                  level="M"
                  includeMargin
                />
              ) : (
                <div className="grid h-[250px] w-[250px] place-items-center bg-slate-100 text-center text-xs font-bold text-slate-500">
                  पहले ID Role
                  <br />
                  Select करें
                </div>
              )}

            </div>

          </div>

          {/* AMOUNT */}

          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-5 text-center">

            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Payable Amount
            </div>

            <div className="mt-1 text-4xl font-black text-emerald-300">
              ₹
              {paymentAmount
                ? paymentAmount.toLocaleString(
                    'en-IN'
                  )
                : '0'}
            </div>

            {selectedRoleConfig && (
              <div className="mt-1 text-xs text-slate-500">
                {
                  selectedRoleConfig.label
                } ID Creation Fee
              </div>
            )}

          </div>

          {/* UPI */}

          <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">

            <div className="text-[10px] uppercase tracking-widest text-slate-600">
              Pay To UPI ID
            </div>

            <div className="mt-2 break-all text-sm font-black text-cyan-300">
              {COMPANY_UPI_ID}
            </div>

            <div className="mt-1 text-[10px] text-slate-600">
              {COMPANY_NAME}
            </div>

            <button
              type="button"
              onClick={
                copyUpi
              }
              className="mt-3 w-full rounded-xl border border-cyan-400/20 bg-cyan-400/10 py-2.5 text-xs font-black text-cyan-300"
            >
              📋 Copy UPI ID
            </button>

          </div>

          {/* OPEN UPI */}

          <button
            type="button"
            onClick={
              openUpiApp
            }
            disabled={
              !selectedRoleConfig
            }
            className="mt-4 w-full rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            📲 Open UPI Payment App
          </button>

          {/* INSTRUCTIONS */}

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">

            <div className="text-xs font-black text-white">
              Payment Process
            </div>

            <div className="mt-3 space-y-3 text-[11px] leading-5 text-slate-400">

              <div className="flex gap-2">
                <span className="font-black text-cyan-300">
                  1.
                </span>
                <span>
                  ऊपर दिखाई दे रहे QR को
                  UPI app से scan करें।
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-black text-cyan-300">
                  2.
                </span>
                <span>
                  Selected ID के अनुसार
                  amount pay करें।
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-black text-cyan-300">
                  3.
                </span>
                <span>
                  Payment के बाद UTR /
                  Transaction Reference प्राप्त
                  करें।
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-black text-cyan-300">
                  4.
                </span>
                <span>
                  UTR को left side form में
                  डालकर request submit करें।
                </span>
              </div>

              <div className="flex gap-2">
                <span className="font-black text-emerald-300">
                  5.
                </span>
                <span>
                  Admin verification के बाद
                  ID activate की जाएगी।
                </span>
              </div>

            </div>

          </div>

        </div>

      </form>

      {/* ===================================================
          HIERARCHY INFO
      =================================================== */}

      <div className="mt-6 rounded-3xl border border-white/5 bg-slate-900/60 p-5">

        <div className="mb-4 text-sm font-black">
          🔐 ID Creation Hierarchy
        </div>

        <div className="flex flex-col items-center justify-center gap-2 md:flex-row">

          <HierarchyBox
            icon="👑"
            title="Master Distributor"
            fee="₹4,999"
          />

          <span className="hidden text-2xl text-cyan-400 md:block">
            →
          </span>

          <span className="text-2xl text-cyan-400 md:hidden">
            ↓
          </span>

          <HierarchyBox
            icon="⭐"
            title="Super Distributor"
            fee="₹2,999"
          />

          <span className="hidden text-2xl text-cyan-400 md:block">
            →
          </span>

          <span className="text-2xl text-cyan-400 md:hidden">
            ↓
          </span>

          <HierarchyBox
            icon="🏢"
            title="Distributor"
            fee="₹1,999"
          />

          <span className="hidden text-2xl text-cyan-400 md:block">
            →
          </span>

          <span className="text-2xl text-cyan-400 md:hidden">
            ↓
          </span>

          <HierarchyBox
            icon="🛍️"
            title="Retailer"
            fee="₹999"
          />

        </div>

      </div>

    </div>
  );
}

/* =========================================================
   HIERARCHY BOX
========================================================= */

function HierarchyBox({
  icon,
  title,
  fee,
}: {
  icon: string;
  title: string;
  fee: string;
}) {
  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-5 py-4 text-center md:w-[190px]">

      <div className="text-2xl">
        {icon}
      </div>

      <div className="mt-2 text-xs font-black">
        {title}
      </div>

      <div className="mt-1 text-sm font-black text-emerald-300">
        {fee}
      </div>

    </div>
  );
}
