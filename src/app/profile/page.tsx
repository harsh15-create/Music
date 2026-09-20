'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Flame,
  Trophy,
  History,
  Check,
  Loader2,
  ArrowLeft,
  Settings,
  Sparkles,
  Gamepad2,
  Play,
  ArrowRight,
  ShieldCheck,
  Disc,
} from 'lucide-react';

interface SessionHistoryItem {
  id: string;
  mode: string;
  difficultyTier: string;
  status: string;
  score: number;
  skipsCount: number;
  startedAt: number;
  completedAt?: number;
}

interface ProfileData {
  playerId: string;
  kind: 'anonymous' | 'account';
  displayName: string;
  leaderboardOptIn: boolean;
  streak: {
    current: number;
    longest: number;
    lastCompletedDate?: string | null;
  };
  recentSessions: SessionHistoryItem[];
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/v1/auth/session')
      .then((res) => res.json())
      .then((json) => {
        if (json?.success && json?.data) {
          setProfile(json.data);
          setDisplayName(json.data.displayName || '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch('/api/v1/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });
      const json = await res.json();
      if (json?.success) {
        setSavedSuccess(true);
        if (profile) {
          setProfile({ ...profile, displayName: displayName.trim(), kind: 'account' });
        }
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
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
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 font-pixel text-xs text-slate-300 bg-[#0e1612] hover:bg-[#15221b] border border-white/10 px-3.5 py-1.5 rounded-lg transition-all uppercase"
          >
            <Settings className="w-3.5 h-3.5 text-slate-400" />
            <span>SETTINGS</span>
          </Link>
        </div>
      </div>

      {/* Hero Header */}
      <div className="text-center space-y-3 max-w-xl mx-auto z-10 select-none">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-md arcade-badge text-xs font-bold">
          <Gamepad2 className="w-3.5 h-3.5 text-[#A8FF3E]" />
          <span>PLAYER PASSPORT &bull; ARCADE PROFILE</span>
        </div>

        <h1 className="font-pixel text-4xl sm:text-6xl uppercase tracking-tight leading-tight">
          <span className="pixel-title-guess">PLAYER </span>
          <span className="pixel-title-what">PROFILE</span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
          Manage your gamer identity, view your daily winning streaks, and review your historical arcade achievements.
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 z-10">
          <Loader2 className="w-10 h-10 animate-spin text-[#A8FF3E]" />
          <span className="font-pixel text-xs text-[#A8FF3E] tracking-wider uppercase">
            LOADING ARCADE RECORD...
          </span>
        </div>
      ) : (
        <div className="w-full max-w-2xl mx-auto space-y-8 z-10">
          {/* Main Profile Passport Card */}
          <div className="space-y-3">
            <div className="font-pixel text-xs uppercase tracking-wider text-[#A8FF3E] px-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-[#A8FF3E] animate-pulse" />
              <span>&gt; ACTIVE PASSPORT ID</span>
            </div>

            <div className="pixel-arcade-card p-6 sm:p-8 space-y-6">
              {/* Profile Top Row */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
                <div className="w-16 h-16 rounded-2xl bg-[#102417] border-2 border-[#22c55e] flex items-center justify-center text-2xl shadow-[0_0_16px_rgba(168,255,62,0.4)] flex-shrink-0">
                  <User className="w-8 h-8 text-[#A8FF3E] stroke-[2.5]" />
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="font-pixel text-2xl sm:text-3xl font-bold text-white tracking-tight uppercase">
                      {profile?.displayName || 'ANONYMOUS SPRINTER'}
                    </h2>
                    <span className="font-pixel text-[10px] px-2.5 py-1 rounded bg-[#102417] text-[#A8FF3E] border border-[#22c55e]/50 uppercase self-center sm:self-auto font-bold shadow-[0_0_8px_rgba(168,255,62,0.2)]">
                      {profile?.kind === 'account' ? '★ REGISTERED ID' : 'GUEST SPRINTER'}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                    <span
                      className={`font-pixel text-[10px] px-2.5 py-0.5 rounded uppercase font-bold ${
                        profile?.leaderboardOptIn
                          ? 'bg-[#143020] text-[#A8FF3E] border border-[#22c55e]'
                          : 'bg-[#181f1b] text-slate-400 border border-slate-700'
                      }`}
                    >
                      {profile?.leaderboardOptIn ? '● LEADERBOARD ACTIVE' : '○ LEADERBOARD OFF'}
                    </span>
                    <span className="font-pixel text-[10px] text-slate-400 px-2 py-0.5 rounded bg-[#09110d] border border-[#1d3d28]">
                      ID: {profile?.playerId.slice(0, 14)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Streaks & Stats Counters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Current Streak */}
                <div className="p-4 rounded-xl bg-[#08120c] border border-[#22c55e]/30 text-center shadow-inner relative group">
                  <span className="font-pixel text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
                    <Flame className="w-3.5 h-3.5" /> CURRENT STREAK
                  </span>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="font-pixel font-bold text-3xl text-white">
                      {profile?.streak.current || 0}
                    </span>
                    <span className="font-pixel text-xs text-amber-400 font-bold uppercase">
                      DAYS
                    </span>
                  </div>
                </div>

                {/* Best Streak */}
                <div className="p-4 rounded-xl bg-[#08120c] border border-[#22c55e]/30 text-center shadow-inner relative group">
                  <span className="font-pixel text-[11px] font-bold text-[#A8FF3E] uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> BEST STREAK
                  </span>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="font-pixel font-bold text-3xl text-white">
                      {profile?.streak.longest || 0}
                    </span>
                    <span className="font-pixel text-xs text-[#A8FF3E] font-bold uppercase">
                      DAYS
                    </span>
                  </div>
                </div>

                {/* Total Games */}
                <div className="p-4 rounded-xl bg-[#08120c] border border-[#22c55e]/30 text-center shadow-inner relative group">
                  <span className="font-pixel text-[11px] font-bold text-[#d7ff75] uppercase tracking-wider block mb-1 flex items-center justify-center gap-1">
                    <History className="w-3.5 h-3.5" /> SESSIONS
                  </span>
                  <div className="flex items-baseline justify-center gap-1.5">
                    <span className="font-pixel font-bold text-3xl text-white">
                      {profile?.recentSessions.length || 0}
                    </span>
                    <span className="font-pixel text-xs text-[#d7ff75] font-bold uppercase">
                      LOGGED
                    </span>
                  </div>
                </div>
              </div>

              {/* Edit Display Name Form */}
              <form onSubmit={handleUpdateName} className="space-y-3 pt-4 border-t border-[#1d3d28]">
                <label className="font-pixel text-xs font-bold text-[#d7ff75] uppercase tracking-wider block flex items-center justify-between">
                  <span>UPDATE GAMER HANDLE</span>
                  {savedSuccess && (
                    <span className="text-xs text-[#A8FF3E] font-pixel flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> SAVED SUCCESSFULLY!
                    </span>
                  )}
                </label>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    required
                    maxLength={24}
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter new gamer tag..."
                    className="flex-1 px-4 py-3 bg-[#060a08] border-2 border-[#22c55e]/60 focus:border-[#A8FF3E] rounded-xl text-white font-pixel text-sm sm:text-base focus:outline-none focus:shadow-[0_0_14px_rgba(168,255,62,0.25)] transition-all"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 rounded-xl arcade-btn-green font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : savedSuccess ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Disc className="w-4 h-4 fill-[#06080d]" />
                    )}
                    <span>{saving ? 'SAVING...' : savedSuccess ? 'TAG SAVED' : 'UPDATE TAG'}</span>
                  </button>
                </div>
              </form>

              {/* Quick Play CTA */}
              <div className="pt-2">
                <Link
                  href="/music/banger"
                  className="w-full py-3.5 px-5 arcade-btn-dark font-bold text-xs sm:text-sm flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4 fill-[#d7ff75]" />
                  <span>PLAY TODAY&apos;S DAILY BANGER</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                </Link>
              </div>
            </div>
          </div>

          {/* History / Mission Log */}
          <div className="space-y-3">
            <div className="font-pixel text-xs uppercase tracking-wider text-slate-400 px-1 flex items-center gap-1.5">
              <span>&gt; RECENT ARCADE SESSIONS</span>
            </div>

            <div className="pixel-arcade-card p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1d3d28] pb-3">
                <div className="flex items-center gap-2 font-pixel font-bold text-base sm:text-lg text-white uppercase">
                  <History className="w-5 h-5 text-[#A8FF3E]" />
                  <span>GAME HISTORY LOG</span>
                </div>
                <span className="font-pixel text-xs text-[#A8FF3E] uppercase">
                  {profile?.recentSessions.length || 0} TOTAL SESSIONS
                </span>
              </div>

              {!profile?.recentSessions || profile.recentSessions.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <p className="font-pixel text-xs text-slate-400 uppercase tracking-wider">
                    NO GAMES LOGGED ON THIS DEVICE YET.
                  </p>
                  <Link
                    href="/music"
                    className="arcade-btn-green inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold"
                  >
                    <Play className="w-3.5 h-3.5 fill-[#06080d]" />
                    <span>LAUNCH MUSIC SPRINT</span>
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-[#162e1e]">
                  {profile.recentSessions.map((s, idx) => (
                    <div
                      key={s.id}
                      className="py-3.5 flex items-center justify-between hover:bg-[#0c1b11]/50 px-2 rounded-lg transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5 h-5 rounded bg-[#102417] border border-[#22c55e]/40 font-pixel text-[10px] text-[#A8FF3E] flex items-center justify-center font-bold">
                            #{idx + 1}
                          </span>
                          <span className="font-pixel font-bold text-white uppercase text-xs sm:text-sm tracking-wider">
                            {s.mode} SPRINT
                          </span>
                          <span className="px-2 py-0.5 rounded font-pixel text-[9px] font-bold uppercase bg-[#132219] text-[#d7ff75] border border-[#22c55e]/30">
                            {s.difficultyTier}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-mono block pl-7">
                          {new Date(s.startedAt).toLocaleDateString()} &bull;{' '}
                          {new Date(s.startedAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="flex items-baseline justify-end gap-1">
                          <span className="font-pixel font-bold text-[#A8FF3E] text-base sm:text-lg">
                            {s.score}
                          </span>
                          <span className="text-[10px] font-pixel text-[#d7ff75]/80 uppercase">
                            PTS
                          </span>
                        </div>
                        <span className="font-pixel text-[10px] text-slate-400 block uppercase">
                          {s.skipsCount === 0 ? (
                            <span className="text-[#A8FF3E] font-bold">0 SKIPS (CLEAN)</span>
                          ) : (
                            `${s.skipsCount} SKIPS`
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Settings Shortcut Card */}
          <div className="w-full p-4 rounded-2xl pixel-arcade-inner flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border border-[#22c55e]/30">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-[#A8FF3E] flex-shrink-0" />
              <div>
                <strong className="text-white font-pixel tracking-wide block uppercase">
                  DATA CONTROLS &amp; PRIVACY
                </strong>
                <span className="text-slate-400 text-xs">
                  Toggle leaderboard visibility, export player JSON, or manage session memory.
                </span>
              </div>
            </div>
            <Link
              href="/settings"
              className="px-4 py-2 rounded-xl bg-[#102417] hover:bg-[#163321] border border-[#22c55e]/60 text-[#A8FF3E] font-pixel font-bold text-xs uppercase flex-shrink-0 transition-colors"
            >
              OPEN SETTINGS &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
