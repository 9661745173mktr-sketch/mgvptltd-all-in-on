'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then((res) => res.json())
      .then((data) => setCategories(data));

    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', color: '#333', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f9fafb' }}>
      
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#0070f3', margin: 0, fontSize: '28px' }}>MG-PVT-LTD</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <Link href="/admin-products" style={{ textDecoration: 'none', background: '#28a745', color: '#fff', fontWeight: 'bold', padding: '10px 15px', borderRadius: '5px' }}>
            Manage Products
          </Link>
          <Link href="/auth" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold', padding: '10px 15px', border: '1px solid #0070f3', borderRadius: '5px' }}>
            Login / Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header style={{ textAlign: 'center', padding: '80px 20px', background: 'linear-gradient(135deg, #0070f3, #00c6ff)', color: 'white' }}>
        <h1 style={{ fontSize: '45px', marginBottom: '15px' }}>Welcome to MG-PVT-LTD Store</h1>
        <p style={{ fontSize: '20px', maxWidth: '600px', margin: '0 auto' }}>
          Your trusted multi-role B2B and retail shopping platform.
        </p>
      </header>

      {/* Categories Section */}
      <section style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Categories</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          {categories.map((cat: any) => (
            <div key={cat.id} style={{ background: '#fff', padding: '15px 25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontWeight: 'bold', color: '#0070f3' }}>
              {cat.name}
            </div>
          ))}
          {categories.length === 0 && <p style={{ color: '#666' }}>No categories added yet. Go to 'Manage Products' to add.</p>}
        </div>
      </section>

      {/* Products Grid */}
      <section style={{ padding: '20px 40px 60px 40px', maxWidth: '1200px', margin: '0 auto', width: '100%', flex: 1 }}>
        <h2 style={{ marginBottom: '20px', fontSize: '24px' }}>Featured Products</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
          {products.map((prod: any) => (
            <div key={prod.id} style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{prod.name}</h3>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '15px' }}>{prod.description}</p>
              </div>
              <div>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: '#0070f3', marginBottom: '15px' }}>₹{prod.price}</p>
                <button style={{ width: '100%', padding: '10px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
          {products.length === 0 && <p style={{ color: '#666' }}>No products available yet.</p>}
        </div>
      </section>

    </div>
  );
}