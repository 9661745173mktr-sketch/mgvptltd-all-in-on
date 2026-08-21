'use client';
import React, { useState, useEffect } from 'react';
import AdminDashboardStats from '../../components/sections/admin-sections/AdminDashboardStats';
export default function AdminPage() {
  const [mergedRequests, setMergedRequests] = useState<Array<any>>([]);

  useEffect(() => {
    const retailerReqs = JSON.parse(localStorage.getItem('adminServiceRequests') || '[]');
    const distributorReqs = JSON.parse(localStorage.getItem('distributorServiceRequests') || '[]');
    const superReqs = JSON.parse(localStorage.getItem('superDistributorRequests') || '[]');
    const masterReqs = JSON.parse(localStorage.getItem('masterDistributorRequests') || '[]');

    const allCombined = [...retailerReqs, ...distributorReqs, ...superReqs, ...masterReqs];
    setMergedRequests(allCombined);
  }, []);

  return <AdminDashboardStats requests={mergedRequests} />;
}