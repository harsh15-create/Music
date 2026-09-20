'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Download,
  Check,
  AlertTriangle,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Trophy,
  Sliders,
  FileJson,
  Trash2,
} from 'lucide-react';

export default function SettingsPage() {
  const [leaderboardOptIn, setLeaderboardOptIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deletedMsg, setDeletedMsg] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setLeaderboardOptIn(json.data.leaderboardOptIn || false);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleOptIn = async (newVal: boolean) => {
    setError(null);
    setLeaderboardOptIn(newVal);
    setSaving(true);
    try {
      const response = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leaderboardOptIn: newVal }),
      });
      if (!response.ok) throw new Error('Unable to save your leaderboard preference.');
    } catch {
      // Revert on error
      setLeaderboardOptIn(!newVal);
      setError('We could not save that preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async () => {
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/session');
      const json = await res.json();
      if (!res.ok || !json?.success) throw new Error('Export unavailable');
      const blob = new Blob([JSON.stringify(json.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `guesswhat-arcade-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setError('Your export could not be prepared. Please try again.');
    }
  };

  const handleDeleteAccount = async () => {
    setError(null);
    try {
      const res = await fetch('/api/v1/auth/session', { method: 'DELETE' });
      const json = await res.json();
      if (res.ok && json?.success) {
        setDeletedMsg(true);
        setLeaderboardOptIn(false);
        setDeleteConfirm(false);
      }
    } catch {
      setError('Your data was not deleted. Please try again before leaving this page.');
    }
  };

  return (
    <div className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-10 z-10">
      {/* Floating green pixel background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <span className="absolute top-24 left-[8%] text-2xl text-[#A8FF3E]/30 select-none animate-float-slow font-pixel">
          ⚙️
        </span>
        <span className="absolute top-44 right-[10%] text-2xl text-[#d7ff75]/30 select-none animate-float-delayed font-pixel">
          ★
        </span>
        <span className="absolute bottom-36 left-[12%] text-2xl text-[#22c55e]/30 select-none animate-float-delayed font-pixel">
          🛡️
        </span>
        <span className="absolute bottom-20 right-[15%] text-2xl text-[#A8FF3E]/30 select-none animate-float-slow font-pixel">
          🕹️
        </span>
        <div className="absolute top-1/3 left-1/4 w-1.5 h-1.5 bg-[#A8FF3E] animate-pixel-1 pointer-events-none rounded-xs shadow-[0_0_8px_#A8FF3E]" />
        <div className="absolute top-2/3 right-1/3 w-2 h-2 bg-[#d7ff75] animate-pixel-2 pointer-events-none rounded-xs shadow-[0_0_10px_#d7ff75]" />
      </div>

      {/* Top Navigation & Leaderboard Bar */}
      <div className="w-full flex items-center justify-between z-10">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 font-pixel text-xs text-slate-400 hover:text-[#A8FF3E] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&lt; BACK TO PROFILE</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/leaderboard"
            className="inline-flex items-center gap-1.5 font-pixel text-xs text-[#A8FF3E] bg-[#0c1811] hover:bg-[#12281a] border border-[#22c55e]/60 px-3.5 py-1.5 rounded-lg transition-all shadow-[0_0_10px_rgba(34,197,94,0.2)] uppercase"
          >
            <Trophy className="w-3.5 h-3.5 text-[#A8FF3E]" />
            <span>LEADERBOARD</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto z-10 select-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md arcade-badge text-xs font-bold">
          <Sliders className="w-3.5 h-3.5 text-[#A8FF3E]" />
          <span>SYSTEM CONTROLS &bull; PRIVACY &amp; DATA</span>
        </div>

        <h1 className="font-pixel text-4xl sm:text-6xl uppercase tracking-tight leading-tight">
          <span className="pixel-title-guess">ARCADE </span>
          <span className="pixel-title-what">SETTINGS</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
          Transparent data controls, leaderboard visibility preferences, and music licensing disclosures.
        </p>
      </div>

      {deletedMsg && (
        <div
          role="status"
          className="w-full max-w-2xl p-4 rounded-2xl bg-[#102417] border border-[#22c55e] text-[#A8FF3E] text-xs font-pixel flex items-center gap-2 z-10 uppercase"
        >
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>Your player records and arcade history have been purged.</span>
        </div>
      )}

      {error && (
        <p role="alert" className="w-full max-w-2xl text-xs font-pixel text-rose-400 z-10 uppercase">
          {error}
        </p>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-10 h-10 animate-spin text-[#A8FF3E]" />
          <span className="font-pixel text-xs text-[#A8FF3E] tracking-wider uppercase">
            LOADING SETTINGS...
          </span>
        </div>
      ) : (
        <div className="w-full max-w-2xl mx-auto space-y-6 z-10">
          {/* Leaderboard Privacy Toggle */}
          <div className="pixel-arcade-card p-6 sm:p-7 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <h3 className="font-pixel font-bold text-white text-lg sm:text-xl uppercase">
                  PUBLIC DAILY LEADERBOARD
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md">
                  Allow your completed Daily scores and display name to appear on the public Daily Leaderboard.
                  You may toggle this anytime.
                </p>
              </div>

              <button
                onClick={() => handleToggleOptIn(!leaderboardOptIn)}
                disabled={saving}
                aria-pressed={leaderboardOptIn}
                aria-label="Allow public Daily leaderboard listing"
                className={`w-14 h-7 rounded-full transition-colors relative flex items-center p-0.5 cursor-pointer border ${
                  leaderboardOptIn
                    ? 'bg-[#102417] border-[#22c55e] shadow-[0_0_12px_rgba(168,255,62,0.4)]'
                    : 'bg-[#121614] border-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full transition-all flex items-center justify-center text-[9px] font-bold ${
                    leaderboardOptIn
                      ? 'translate-x-7 bg-[#A8FF3E] text-black'
                      : 'translate-x-0 bg-slate-500 text-slate-900'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Data Export (GDPR / Transparency) */}
          <div className="pixel-arcade-card p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h3 className="font-pixel font-bold text-white text-lg sm:text-xl uppercase flex items-center gap-2">
                <FileJson className="w-5 h-5 text-[#A8FF3E]" />
                <span>EXPORT PLAYER ARCHIVE</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed max-w-md">
                Download a portable JSON archive of your streak records, session history, and preferences.
              </p>
            </div>

            <button
              onClick={handleExportData}
              className="px-5 py-3 rounded-xl arcade-btn-dark font-bold text-xs flex items-center justify-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#A8FF3E]" />
              <span>EXPORT JSON</span>
            </button>
          </div>

          {/* Audio Licensing & Terms Disclosure */}
          <div className="pixel-arcade-card p-6 sm:p-7 space-y-3 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-pixel font-bold text-white text-base uppercase">
              <ShieldCheck className="w-5 h-5 text-[#A8FF3E]" />
              <span>LAWFUL AUDIO &amp; CONTENT DISCLOSURE</span>
            </div>
            <p className="leading-relaxed font-medium">
              GuessWhat adheres strictly to music licensing laws. All audio samples provided in this application are certified Creative Commons (CC-BY 4.0), royalty-free, or licensed through approved provider integrations.
            </p>
            <p className="leading-relaxed font-medium text-slate-400">
              We never scrape, cache, host, or stream unlicensed commercial audio recordings. Audio playback is restricted to sub-second preview evaluation and cannot be downloaded or exported as full tracks.
            </p>
          </div>

          {/* Account / Session Deletion */}
          <div className="pixel-arcade-card p-6 sm:p-7 border-rose-500/50 bg-[#17090b]/90 space-y-4">
            <div className="flex items-center gap-2 font-pixel font-bold text-rose-400 text-base sm:text-lg uppercase">
              <AlertTriangle className="w-5 h-5" />
              <span>DANGER ZONE: DELETE PLAYER MEMORY</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Permanently delete your player profile, daily streak, and history from this device and our servers. This action cannot be undone.
            </p>

            {!deleteConfirm ? (
              <button
                onClick={() => setDeleteConfirm(true)}
                className="px-5 py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-500/60 text-rose-300 font-pixel font-bold text-xs uppercase transition-colors cursor-pointer flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>PURGE MY ARCADE DATA</span>
              </button>
            ) : (
              <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="delete-heading"
                aria-describedby="delete-description"
                className="rounded-2xl border border-rose-500/50 bg-[#0e0405] p-5 space-y-4"
              >
                <p id="delete-heading" className="text-sm font-pixel font-bold text-white uppercase">
                  PERMANENTLY DELETE YOUR PLAYER DATA?
                </p>
                <p id="delete-description" className="text-xs text-slate-400">
                  This removes your profile, game history, streak, leaderboard listing, and this device&apos;s player session.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDeleteAccount}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    CONFIRM PURGE
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-pixel text-xs font-bold uppercase hover:bg-slate-700 cursor-pointer"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
