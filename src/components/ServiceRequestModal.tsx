'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type { PortalService } from '../app/utils/serviceCatalog';

type Props = {
  service: PortalService | null;
  onClose: () => void;
  retailerName: string;
  retailerMobile: string;
  onSubmitted: () => void;
};

export default function ServiceRequestModal({
  service,
  onClose,
  retailerName,
  retailerMobile,
  onSubmitted,
}: Props) {
  const [step, setStep] = useState<'form' | 'preview'>('form');
  const [data, setData] = useState<Record<string, string>>({});

  useEffect(() => {
    setStep('form');
    setData({});
  }, [service?.id]);

  const fields = service?.fields || [];

  const requiredFields = useMemo(
    () => fields.filter((f) => f.required),
    [fields]
  );

  if (!service) return null;

  /* =========================================================
     UPDATE FORM DATA
  ========================================================= */
  const update = (name: string, value: string) => {
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /* =========================================================
     VALIDATION
  ========================================================= */
  const validate = () => {
    for (const field of requiredFields) {
      const value = data[field.name];

      if (!value || !value.trim()) {
        alert(`${field.label} is required.`);
        return false;
      }
    }

    return true;
  };

  /* =========================================================
     SUBMIT REQUEST
  ========================================================= */
  const submit = () => {
    if (!validate()) return;

    const item = {
      id: `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`,

      retailerName,
      mobile: retailerMobile,

      serviceId: service.id,
      serviceName: service.title,
      category: service.category,

      fee: service.fee.toFixed(2),
      commission: service.commission || 0,

      status: 'Pending',

      date: new Date().toLocaleDateString('en-IN'),
      timestamp: new Date().toISOString(),

      details: {
        ...data,
      },
    };

    try {
      /* =====================================================
         SERVICE REQUEST DATABASE
      ===================================================== */

      const existingRaw = localStorage.getItem(
        'service_requests_db'
      );

      let existing: any[] = [];

      try {
        const parsed = JSON.parse(existingRaw || '[]');

        if (Array.isArray(parsed)) {
          existing = parsed;
        }
      } catch {
        existing = [];
      }

      localStorage.setItem(
        'service_requests_db',
        JSON.stringify([item, ...existing])
      );

      /* =====================================================
         AADHAAR CORRECTION DATABASE
      ===================================================== */

      const aadhaarRaw = localStorage.getItem(
        'aadhaar_correction_db'
      );

      let aadhaarExisting: any[] = [];

      try {
        const parsed = JSON.parse(aadhaarRaw || '[]');

        if (Array.isArray(parsed)) {
          aadhaarExisting = parsed;
        }
      } catch {
        aadhaarExisting = [];
      }

      localStorage.setItem(
        'aadhaar_correction_db',
        JSON.stringify([item, ...aadhaarExisting])
      );

      /* =====================================================
         UPDATE EVENT
      ===================================================== */

      window.dispatchEvent(
        new Event('service_updated')
      );

      alert(
        'Request successfully submitted. It has been sent to the verification queue.'
      );

      onSubmitted();
      onClose();
    } catch (error) {
      console.error(
        'Service request save error:',
        error
      );

      alert(
        'Unable to save the request. Please try again.'
      );
    }
  };

  /* =========================================================
     COMMON INPUT STYLE
  ========================================================= */

  const baseClass =
    'w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3.5 py-3 text-sm text-slate-100 placeholder:text-slate-500 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15';

  /* =========================================================
     RENDER FIELD
     
     IMPORTANT:
     FILE INPUT ME VALUE PROP NAHI DENA HAI.
     
     यही आपके screenshot वाले error को fix करता है:
     Failed to set the 'value' property on 'HTMLInputElement'
  ========================================================= */

  const renderField = (field: any) => {
    /* =======================================================
       FILE INPUT
    ======================================================= */

    if (field.type === 'file') {
      return (
        <input
          type="file"
          required={field.required}
          accept={
            field.accept ||
            '.jpg,.jpeg,.png,.webp,.pdf'
          }
          onChange={(event) => {
            const file =
              event.target.files?.[0];

            update(
              field.name,
              file ? file.name : ''
            );
          }}
          className={
            baseClass +
            ' file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-3 file:py-2 file:font-semibold file:text-white hover:file:bg-cyan-400'
          }
        />
      );
    }

    /* =======================================================
       SELECT
    ======================================================= */

    if (field.type === 'select') {
      return (
        <select
          value={data[field.name] || ''}
          onChange={(event) =>
            update(
              field.name,
              event.target.value
            )
          }
          required={field.required}
          className={baseClass}
        >
          <option value="">
            Select {field.label}
          </option>

          {(field.options || []).map(
            (option: string) => (
              <option
                key={option}
                value={option}
              >
                {option}
              </option>
            )
          )}
        </select>
      );
    }

    /* =======================================================
       TEXTAREA
    ======================================================= */

    if (field.type === 'textarea') {
      return (
        <textarea
          value={data[field.name] || ''}
          onChange={(event) =>
            update(
              field.name,
              event.target.value
            )
          }
          required={field.required}
          rows={4}
          placeholder={
            field.placeholder ||
            `Enter ${field.label.toLowerCase()}`
          }
          className={
            baseClass + ' resize-none'
          }
        />
      );
    }

    /* =======================================================
       NORMAL INPUT
    ======================================================= */

    return (
      <input
        type={field.type || 'text'}
        value={data[field.name] || ''}
        onChange={(event) =>
          update(
            field.name,
            event.target.value
          )
        }
        required={field.required}
        placeholder={
          field.placeholder ||
          `Enter ${field.label.toLowerCase()}`
        }
        className={baseClass}
      />
    );
  };

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-3 backdrop-blur-md"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-5xl max-h-[94vh] overflow-hidden rounded-3xl border border-cyan-400/50 bg-[#0b1324] shadow-[0_30px_100px_rgba(0,0,0,.75),0_0_45px_rgba(14,165,233,.12)]">

        {/* ===================================================
            HEADER
        =================================================== */}

        <div className="relative border-b border-slate-700/80 bg-gradient-to-r from-[#101c33] via-[#0b1730] to-[#10152a] px-6 py-5">

          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-4">

              <div className="grid h-12 w-12 place-items-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10 text-2xl shadow-[0_0_25px_rgba(34,211,238,.12)]">
                {service.icon}
              </div>

              <div>
                <h2 className="text-xl font-black tracking-tight text-cyan-300">
                  {service.title}
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {service.description}
                </p>
              </div>

            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-2xl text-slate-400 hover:bg-white/5 hover:text-white"
            >
              ×
            </button>

          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">

            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1.5 font-bold text-emerald-300">
              ● Active Service
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-bold text-slate-300">
              Service Fee:{' '}
              <b className="text-emerald-300">
                ₹{service.fee.toFixed(2)}
              </b>
            </span>

            <span className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1.5 font-bold text-slate-300">
              {service.category}
            </span>

          </div>
        </div>

        {/* ===================================================
            BODY
        =================================================== */}

        <div className="max-h-[calc(94vh-155px)] overflow-y-auto px-6 py-6">

          {step === 'form' ? (
            <>
              {/* NOTE */}

              <div className="mb-5 rounded-2xl border border-cyan-400/25 bg-gradient-to-r from-cyan-400/10 to-slate-900/30 px-4 py-3 text-sm text-slate-300">

                <span className="font-bold text-cyan-300">
                  📌 Note:
                </span>{' '}
                Fill all required details carefully.
                Uploaded file names are stored with
                the request for admin verification.

              </div>

              {/* FORM */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {fields.map((field) => (
                  <label
                    key={field.name}
                    className={
                      field.col === 2
                        ? 'md:col-span-2'
                        : ''
                    }
                  >

                    <span className="mb-1.5 block text-xs font-bold text-cyan-300">

                      {field.label}

                      {field.required && (
                        <b className="ml-1 text-rose-400">
                          *
                        </b>
                      )}

                    </span>

                    {renderField(field)}

                  </label>
                ))}

              </div>

              {/* BUTTONS */}

              <div className="mt-7 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-600 bg-slate-800/80 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (validate()) {
                      setStep('preview');
                    }
                  }}
                  className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 text-sm font-black text-white shadow-lg shadow-cyan-500/20 hover:brightness-110"
                >
                  Preview / Check Details 👁
                </button>

              </div>
            </>
          ) : (
            <>
              {/* REVIEW */}

              <div className="mb-5 rounded-2xl border border-emerald-400/25 bg-emerald-400/5 p-5">

                <h3 className="text-lg font-black text-emerald-300">
                  Review Request
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  Please verify the details before
                  submitting.
                </p>

              </div>

              {/* DETAILS */}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">

                {fields
                  .filter(
                    (field) =>
                      data[field.name]
                  )
                  .map((field) => (
                    <div
                      key={field.name}
                      className="rounded-xl border border-slate-700/80 bg-slate-900/60 p-3"
                    >

                      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                        {field.label}
                      </div>

                      <div className="mt-1 break-words text-sm text-slate-100">
                        {data[field.name]}
                      </div>

                    </div>
                  ))}

              </div>

              {/* FEE */}

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/60 p-4">

                <div>

                  <div className="text-xs text-slate-500">
                    Total Service Fee
                  </div>

                  <div className="text-2xl font-black text-emerald-300">
                    ₹{service.fee.toFixed(2)}
                  </div>

                </div>

                <div className="text-right text-xs text-slate-400">

                  Retailer:{' '}

                  <b className="text-white">
                    {retailerName}
                  </b>

                  <br />

                  {retailerMobile}

                </div>

              </div>

              {/* ACTIONS */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={() =>
                    setStep('form')
                  }
                  className="rounded-xl border border-slate-600 bg-slate-800/80 px-5 py-3 text-sm font-bold text-slate-200 hover:bg-slate-700"
                >
                  ← Back
                </button>

                <button
                  type="button"
                  onClick={submit}
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-7 py-3 text-sm font-black text-white shadow-lg shadow-emerald-500/20 hover:brightness-110"
                >
                  Submit Request & Pay ₹
                  {service.fee.toFixed(2)} ✓
                </button>

              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}