'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Trophy,
  User,
  Sparkles,
  ShieldCheck,
  Check,
  Gamepad2,
  Flame,
  ArrowRight,
  Disc,
  Loader2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAccount, setIsAccount] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          const name = json.data.displayName || '';
          setDisplayName(name);
          setCurrentName(name);
          setIsAccount(json.data.kind === 'account');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim(), leaderboardOptIn: true }),
      });
      const json = await res.json();
      if (json?.success) {
        setStatusMsg({ type: 'success', text: 'Arcade Gamer Tag Saved! Entering Profile...' });
        setTimeout(() => {
          router.push('/profile');
        }, 800);
      } else {
        setStatusMsg({ type: 'error', text: json?.error || 'Failed to save login. Please try again.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Network connection failed. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleGuestContinue = () => {
    router.push('/music');
  };

  return (
    <div className="relative flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12 max-w-4xl mx-auto w-full space-y-10 z-10">
      {/* Floating green pixel background particles */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <span className="absolute top-24 left-[8%] text-2xl text-[#A8FF3E]/30 select-none animate-float-slow font-pixel">
          🎵
        </span>
        <span className="absolute top-44 right-[10%] text-2xl text-[#d7ff75]/30 select-none animate-float-delayed font-pixel">
          ★
        </span>
        <span className="absolute bottom-36 left-[12%] text-2xl text-[#22c55e]/30 select-none animate-float-delayed font-pixel">
          🎶
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
          href="/"
          className="inline-flex items-center gap-1.5 font-pixel text-xs text-slate-400 hover:text-[#A8FF3E] transition-colors uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>&lt; BACK TO HOME</span>
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
          <Gamepad2 className="w-3.5 h-3.5 text-[#A8FF3E]" />
          <span>ARCADE ID &bull; PLAYER PASSPORT</span>
        </div>

        <h1 className="font-pixel text-4xl sm:text-6xl uppercase tracking-tight leading-tight">
          <span className="pixel-title-guess">PLAYER </span>
          <span className="pixel-title-what">LOGIN</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
          Set your gamer handle to track daily streaks, log high scores across all stages, and climb the global arcade leaderboard.
        </p>
      </div>

      {/* Main Login / Handle Setup Card */}
      <div className="w-full max-w-lg mx-auto space-y-4 z-10">
        <div className="font-pixel text-xs uppercase tracking-wider text-[#A8FF3E] px-1 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-xs bg-[#A8FF3E] animate-pulse" />
          <span>&gt; AUTHENTICATION TERMINAL</span>
        </div>

        <div className="pixel-arcade-card p-6 sm:p-8 space-y-6 relative group">
          {/* Header Icon + Info */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#102417] border-2 border-[#22c55e] flex items-center justify-center text-2xl shadow-[0_0_14px_rgba(168,255,62,0.4)]">
              <User className="w-6 h-6 text-[#A8FF3E] stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-pixel text-xl sm:text-2xl text-white tracking-tight uppercase pixel-text-white">
                {isAccount ? 'WELCOME BACK' : 'CLAIM GAMER TAG'}
              </h2>
              <span className="font-pixel text-[11px] text-[#A8FF3E] uppercase tracking-wider">
                {isAccount ? `ACTIVE HANDLE: ${currentName}` : 'STAGE 01 • INSTANT ARCADE SYNC'}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#A8FF3E]" />
              <span className="font-pixel text-xs text-[#A8FF3E] uppercase tracking-wider">
                CHECKING ARCADE SESSION...
              </span>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label
                  htmlFor="gamerTag"
                  className="font-pixel text-xs text-[#d7ff75] uppercase tracking-wider flex items-center justify-between"
                >
                  <span>GAMER TAG / DISPLAY NAME</span>
                  <span className="text-[10px] text-slate-400 font-mono font-normal">MAX 24 CHARS</span>
                </label>
                <div className="relative">
                  <input
                    id="gamerTag"
                    type="text"
                    required
                    maxLength={24}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. NeonRider, SoundNinja"
                    className="w-full px-4 py-3.5 bg-[#060a08] border-2 border-[#22c55e]/60 focus:border-[#A8FF3E] rounded-xl text-white font-pixel text-base sm:text-lg tracking-wide placeholder:text-slate-600 focus:outline-none focus:shadow-[0_0_16px_rgba(168,255,62,0.3)] transition-all"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500 font-pixel text-xs">
                    🕹️
                  </div>
                </div>
              </div>

              {/* Status Alert */}
              {statusMsg && (
                <div
                  className={`p-3 rounded-xl text-xs font-pixel flex items-center gap-2 ${
                    statusMsg.type === 'success'
                      ? 'bg-[#102417] border border-[#22c55e] text-[#A8FF3E]'
                      : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
                  }`}
                >
                  {statusMsg.type === 'success' ? <Check className="w-4 h-4" /> : null}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Perks List */}
              <div className="pixel-arcade-inner p-3.5 rounded-xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Flame className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span>Permanent streak backup and multi-device continuity</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Trophy className="w-3.5 h-3.5 text-[#A8FF3E] flex-shrink-0" />
                  <span>Eligible for Global High Scores & Daily Hall of Fame</span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-[#d7ff75] flex-shrink-0" />
                  <span>No passwords or tedious verification required</span>
                </div>
              </div>

              {/* Submit & Secondary Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !displayName.trim()}
                  className="w-full py-4 px-6 arcade-btn-green font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Disc className="w-4 h-4 fill-[#06080d]" />
                  )}
                  <span>{saving ? 'SYNCING SESSION...' : 'SAVE & ENTER ARCADE'}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform stroke-[2.8]" />
                </button>

                <button
                  type="button"
                  onClick={handleGuestContinue}
                  className="w-full py-3 px-4 arcade-btn-dark font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>PLAY AS GUEST WITHOUT SAVING</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Profile Link if already logged in */}
          {isAccount && (
            <div className="pt-4 border-t border-[#1d3d28] flex items-center justify-between text-xs">
              <span className="text-slate-400 font-pixel">Already have stats?</span>
              <Link
                href="/profile"
                className="text-[#A8FF3E] hover:underline font-pixel font-bold flex items-center gap-1"
              >
                <span>VIEW PROFILE STATS</span>
                <span>&rarr;</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Security and Fair Play Footer */}
      <div className="w-full max-w-lg mx-auto p-4 rounded-2xl pixel-arcade-inner flex items-start gap-3 text-xs text-slate-300 border border-emerald-500/30 z-10">
        <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-300 font-pixel tracking-wide block mb-0.5">
            ★ INSTANT ARCADE SESSION ★
          </strong>
          <p className="text-slate-400 leading-relaxed">
            Your player ID is securely kept on this device using lightweight session tokens. You can change your name or clear your data at any time in Settings.
          </p>
        </div>
      </div>
    </div>
  );
}
