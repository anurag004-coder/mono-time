'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  checkAdminSessionApi,
  adminLogoutApi,
  fetchAdminAnalyticsApi,
  fetchAdminOrdersApi,
  fetchAdminPitchesApi,
} from '@/lib/api';
import { MerchantStats, PitchEvent } from '@/types';
import { ArrowLeft, LogOut, Download } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [stats, setStats] = useState<MerchantStats | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [pitches, setPitches] = useState<PitchEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Route Guard: verify session on server, redirect to /admin/login if unauthenticated
  useEffect(() => {
    let isMounted = true;
    async function verifyAuth() {
      const isAuthed = await checkAdminSessionApi();
      if (!isAuthed) {
        router.push('/admin/login');
      } else {
        if (isMounted) {
          setIsAuthenticated(true);
          loadAdminData();
        }
      }
    }
    verifyAuth();
    return () => {
      isMounted = false;
    };
  }, [router]);

  const loadAdminData = async () => {
    setIsLoading(true);
    const [statsData, ordersData, pitchesData] = await Promise.all([
      fetchAdminAnalyticsApi(),
      fetchAdminOrdersApi(),
      fetchAdminPitchesApi(),
    ]);
    if (statsData) setStats(statsData);
    if (ordersData) setOrders(ordersData);
    if (pitchesData) setPitches(pitchesData);
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await adminLogoutApi();
    router.push('/');
  };

  const handleExportCSV = () => {
    const headers = 'Event ID,Timestamp,Product,Gender,Trigger,Code,Clicked,Converted\n';
    const rows = pitches
      .map(
        (p) =>
          `"${p.id}","${p.timestamp}","${p.productName}","${p.gender}","${p.triggerType}","${p.code}","${p.clicked}","${p.converted}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `monotime_admin_pitches_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Show nothing while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-bg text-bone flex items-center justify-center font-mono text-xs text-faint">
        Authenticating session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-bone flex flex-col selection:bg-champagne selection:text-on-champagne">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Top Bar */}
      <header className="border-b border-hairline bg-surface py-4 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-muted hover:text-bone flex items-center gap-1.5 text-xs font-mono transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Storefront</span>
            </Link>
            <span className="text-hairline-strong">|</span>
            <div className="flex flex-col">
              <span className="font-display text-lg text-bone leading-tight">
                Mono Time Administration
              </span>
              <span className="font-mono text-[10px] text-champagne uppercase tracking-wider">
                Protected Merchant Operations
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAdminData}
              className="btn-secondary py-1.5 px-3 text-[11px]"
            >
              Refresh
            </button>
            <button
              onClick={handleSignOut}
              className="btn-secondary py-1.5 px-3 text-[11px] flex items-center gap-1 text-muted hover:text-bone"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface border border-hairline rounded-[4px] p-5 flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
              Client Sessions
            </span>
            <span className="font-display text-2xl text-bone font-normal">
              {stats?.totalSessions ?? '—'}
            </span>
            <span className="font-mono text-[10px] text-muted">Active Store Traffic</span>
          </div>

          <div className="bg-surface border border-hairline rounded-[4px] p-5 flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
              Pitches Triggered
            </span>
            <span className="font-display text-2xl text-bone font-normal">
              {stats?.pitchesTriggered ?? '—'}
            </span>
            <span className="font-mono text-[10px] text-muted">
              CTR: {stats?.ctrPercent ?? 0}%
            </span>
          </div>

          <div className="bg-surface border border-hairline rounded-[4px] p-5 flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
              Carts Recovered
            </span>
            <span className="font-display text-2xl text-oxide-text font-normal">
              {stats?.cartsRecovered ?? '—'}
            </span>
            <span className="font-mono text-[10px] text-muted">
              Conversion: {stats?.conversionRatePercent ?? 0}%
            </span>
          </div>

          <div className="bg-surface border border-hairline rounded-[4px] p-5 flex flex-col gap-1">
            <span className="font-mono text-[10px] uppercase tracking-wider text-faint">
              Recovered Revenue
            </span>
            <span className="font-display text-2xl text-champagne font-normal">
              ₹{(stats?.recoveredRevenueINR ?? 0).toLocaleString('en-IN')}
            </span>
            <span className="font-mono text-[10px] text-muted">Verified SQLite Ledger</span>
          </div>
        </div>

        {/* Verified Client Acquisitions (Direct Backend Database) */}
        <div className="bg-surface border border-hairline rounded-[4px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">
                Ledger
              </span>
              <h3 className="font-display text-lg text-bone font-normal">
                Verified Client Acquisitions
              </h3>
            </div>
            <span className="font-mono text-xs text-muted">
              {orders.length} Records Persisted
            </span>
          </div>

          {orders.length === 0 ? (
            <p className="text-xs text-muted py-6 text-center font-sans">
              No orders have been confirmed yet. Test placing an order through the storefront.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-hairline font-mono text-[10px] uppercase text-faint">
                    <th className="py-2.5 pr-4">Order Reference</th>
                    <th className="py-2.5 px-4">Client</th>
                    <th className="py-2.5 px-4">City</th>
                    <th className="py-2.5 px-4">Method</th>
                    <th className="py-2.5 px-4">Privilege</th>
                    <th className="py-2.5 pl-4 text-right">Settled Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-surface-2 transition-colors">
                      <td className="py-3 pr-4 font-mono text-champagne">{o.id}</td>
                      <td className="py-3 px-4 font-sans text-bone">
                        <div>{o.customer_name || 'Guest Client'}</div>
                        <div className="font-mono text-[10px] text-faint">{o.customer_email}</div>
                      </td>
                      <td className="py-3 px-4 text-muted">{o.shipping_city || '—'}</td>
                      <td className="py-3 px-4 font-mono uppercase text-muted">
                        {o.payment_method || 'Card'}
                      </td>
                      <td className="py-3 px-4 font-mono text-faint">
                        {o.discount_code || 'None'}
                      </td>
                      <td className="py-3 pl-4 text-right font-mono text-bone">
                        ₹{(o.amount_inr || 0).toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pitch Event Audit Trail */}
        <div className="bg-surface border border-hairline rounded-[4px] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">
                Observer
              </span>
              <h3 className="font-display text-lg text-bone font-normal">
                Exit-Intent &amp; Concierge Event Audit Trail
              </h3>
            </div>
            <button
              onClick={handleExportCSV}
              className="btn-secondary py-1 px-2.5 text-[10px] flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" />
              <span>Export CSV</span>
            </button>
          </div>

          {pitches.length === 0 ? (
            <p className="text-xs text-muted py-6 text-center font-sans">
              No observer events recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-hairline font-mono text-[10px] uppercase text-faint">
                    <th className="py-2.5 pr-4">Event ID</th>
                    <th className="py-2.5 px-4">Time</th>
                    <th className="py-2.5 px-4">Reference</th>
                    <th className="py-2.5 px-4">Trigger</th>
                    <th className="py-2.5 px-4">Voucher</th>
                    <th className="py-2.5 pl-4 text-right">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hairline">
                  {pitches.slice(0, 20).map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2 transition-colors">
                      <td className="py-3 pr-4 font-mono text-faint">{p.id}</td>
                      <td className="py-3 px-4 font-mono text-muted">{p.timestamp}</td>
                      <td className="py-3 px-4 text-bone font-sans truncate max-w-xs">
                        {p.productName}
                      </td>
                      <td className="py-3 px-4 font-mono text-faint uppercase text-[10px]">
                        {p.triggerType}
                      </td>
                      <td className="py-3 px-4 font-mono text-champagne">{p.code}</td>
                      <td className="py-3 pl-4 text-right font-mono text-[10px]">
                        {p.converted ? (
                          <span className="text-oxide-text">Converted</span>
                        ) : p.clicked ? (
                          <span className="text-champagne">Claimed</span>
                        ) : (
                          <span className="text-faint">Viewed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

