
"use client";

import { useEffect, useState } from "react";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  Eye,
  Heart,
  Home,
  Image,
  MessageCircle,
  Plus,
  RefreshCw,
  Settings,
  Users,
  Video,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const chartData = [
  { day: "12 Okt", followers: 1240, reach: 4200 },
  { day: "13 Okt", followers: 1320, reach: 5100 },
  { day: "14 Okt", followers: 1290, reach: 4700 },
  { day: "15 Okt", followers: 1480, reach: 6200 },
  { day: "16 Okt", followers: 1570, reach: 7100 },
  { day: "17 Okt", followers: 1690, reach: 6800 },
  { day: "18 Okt", followers: 1840, reach: 8500 },
];

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change?: string;
  icon: typeof Users;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
          <Icon size={19} />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          {value}
        </h3>
        {change ? (
          <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-500">
            <ArrowUpRight size={14} />
            {change}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-xs text-slate-400">Dibandingkan periode sebelumnya</p>
    </div>
  );
}

type InstagramProfile = {
  id?: string;
  username?: string;
  accountType?: string;
  mediaCount?: number;
  followersCount?: number;
};

type InstagramInsights = {
  reach?: number | null;
  views?: number | null;
  total_interactions?: number | null;
  accounts_engaged?: number | null;
};

type MediaInsightItem = {
  name: string;
  value?: number | null;
  title?: string;
};

type PerMediaMetrics = {
  reach?: number | null;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  total_interactions?: number | null;
  saved?: number | null;
  shares?: number | null;
  error?: string;
};

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type?: string;
  media_url?: string;
  thumbnail_url?: string;
  permalink?: string;
  timestamp?: string;
};

function formatMetric(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("id-ID", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}


function getMediaThumbnail(media: InstagramMedia) {
  if (media.media_type === "VIDEO") {
    return media.thumbnail_url || media.media_url || "";
  }

  return media.media_url || media.thumbnail_url || "";
}

function getMediaTitle(media: InstagramMedia) {
  const caption = media.caption?.trim();
  if (!caption) return "Konten tanpa caption";

  const firstLine = caption.split("\n")[0].trim();
  return firstLine.length > 55 ? `${firstLine.slice(0, 55)}…` : firstLine;
}

function getMediaTypeLabel(type?: string) {
  switch (type) {
    case "VIDEO":
      return "Reels / Video";
    case "CAROUSEL_ALBUM":
      return "Carousel";
    case "IMAGE":
      return "Foto";
    default:
      return "Konten";
  }
}

function formatPostDate(value?: string) {
  if (!value) return "Tanggal tidak tersedia";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Tanggal tidak tersedia";

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function Dashboard() {
  const [profile, setProfile] = useState<InstagramProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [insights, setInsights] = useState<InstagramInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(true);
  const [insightsError, setInsightsError] = useState("");
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [mediaLoading, setMediaLoading] = useState(true);
  const [mediaError, setMediaError] = useState("");
  const [postMetrics, setPostMetrics] = useState<Record<string, PerMediaMetrics>>({});
  const [failedThumbnails, setFailedThumbnails] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;

    async function loadInstagramProfile() {
      try {
        const response = await fetch("/api/instagram/profile", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success || !result.profile) {
          throw new Error(
            result.message || "Profil Instagram belum bisa dimuat."
          );
        }

        if (!cancelled) {
          setProfile(result.profile);
          setProfileError("");
        }
      } catch (error) {
        if (!cancelled) {
          setProfile(null);
          setProfileError(
            error instanceof Error
              ? error.message
              : "Gagal memuat profil Instagram."
          );
        }
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    }

    async function loadInstagramInsights() {
      try {
        const response = await fetch("/api/instagram/insights", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success || !result.metrics) {
          throw new Error(result.message || "Insights Instagram belum bisa dimuat.");
        }

        if (!cancelled) {
          setInsights(result.metrics);
          setInsightsError("");
        }
      } catch (error) {
        if (!cancelled) {
          setInsights(null);
          setInsightsError(
            error instanceof Error
              ? error.message
              : "Gagal memuat Instagram Insights."
          );
        }
      } finally {
        if (!cancelled) setInsightsLoading(false);
      }
    }

    async function loadInstagramMedia() {
      try {
        const response = await fetch("/api/instagram/media", {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        });
        const result = await response.json();

        if (!response.ok || !result.success || !Array.isArray(result.media)) {
          throw new Error(result.message || "Daftar konten Instagram belum bisa dimuat.");
        }

        if (!cancelled) {
          setMedia(result.media);
          setMediaError("");
        }
      } catch (error) {
        if (!cancelled) {
          setMedia([]);
          setMediaError(error instanceof Error ? error.message : "Gagal memuat konten Instagram.");
        }
      } finally {
        if (!cancelled) setMediaLoading(false);
      }
    }

    loadInstagramProfile();
    loadInstagramInsights();
    loadInstagramMedia();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (media.length === 0) {
      setPostMetrics({});
      return;
    }

    let cancelled = false;
    const latestMedia = [...media]
      .sort(
        (a, b) =>
          new Date(b.timestamp || 0).getTime() -
          new Date(a.timestamp || 0).getTime()
      )
      .slice(0, 5);

    async function loadPostMetrics() {
      const entries = await Promise.all(
        latestMedia.map(async (post) => {
          try {
            const response = await fetch(
              `/api/instagram/media/${encodeURIComponent(post.id)}/insights`,
              { cache: "no-store", credentials: "same-origin" }
            );
            const result = await response.json();

            if (!response.ok || !result.success) {
              return [post.id, { error: result.message || "Insights tidak tersedia" }] as const;
            }

            const items: MediaInsightItem[] = Array.isArray(result.insights)
              ? result.insights
              : [];
            const metrics: PerMediaMetrics = {};
            for (const item of items) {
              if (item && typeof item.name === "string") {
                const value = typeof item.value === "number" ? item.value : null;
                if (item.name === "reach") metrics.reach = value;
                if (item.name === "views" || item.name === "plays") metrics.views = value;
                if (item.name === "likes") metrics.likes = value;
                if (item.name === "comments") metrics.comments = value;
                if (item.name === "total_interactions") metrics.total_interactions = value;
                if (item.name === "saved") metrics.saved = value;
                if (item.name === "shares") metrics.shares = value;
              }
            }
            return [post.id, metrics] as const;
          } catch {
            return [post.id, { error: "Gagal mengambil Insights" }] as const;
          }
        })
      );

      if (!cancelled) {
        setPostMetrics(Object.fromEntries(entries));
      }
    }

    void loadPostMetrics();
    return () => { cancelled = true; };
  }, [media]);

  const contentSummary = [
    { label: "Reels", count: media.filter((item) => item.media_type === "VIDEO").length, color: "bg-indigo-600", icon: Video },
    { label: "Carousel", count: media.filter((item) => item.media_type === "CAROUSEL_ALBUM").length, color: "bg-violet-400", icon: Image },
    { label: "Foto", count: media.filter((item) => item.media_type === "IMAGE").length, color: "bg-amber-400", icon: Image },
  ];
  const mediaTotal = contentSummary.reduce((sum, item) => sum + item.count, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-white px-5 py-6 lg:flex">
        <div className="flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Activity size={23} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">InstaPulse</h1>
            <p className="text-xs text-slate-400">Analytics platform</p>
          </div>
        </div>

        <div className="mt-10">
          <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
            Workspace
          </p>
          <nav className="space-y-1">
            {[
              { name: "Overview", icon: Home, active: true },
              { name: "Konten", icon: Image, active: false },
              { name: "Audiens", icon: Users, active: false },
              { name: "Engagement", icon: Heart, active: false },
              { name: "Laporan", icon: BarChart3, active: false },
            ].map((item) => (
              <button
                key={item.name}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${item.active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
              >
                <item.icon size={18} />
                {item.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white">
          <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <Zap size={18} />
          </div>
          <p className="text-sm font-semibold">Insight lebih dalam</p>
          <p className="mt-1 text-xs leading-5 text-slate-400">
            Hubungkan akun Instagram untuk melihat analitik aktual.
          </p>
          <p className="mt-4 text-xs font-semibold text-indigo-300">
            Integrasi API segera →
          </p>
        </div>

        <button className="mt-4 flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-500 hover:bg-slate-50">
          <Settings size={18} /> Pengaturan
        </button>
      </aside>

      <section className="min-w-0 lg:ml-64">
        <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between border-b border-slate-200 bg-white/90 px-5 backdrop-blur md:px-8">
          <div>
            <p className="text-xs text-slate-400">Workspace / Overview</p>
            <h2 className="mt-1 text-lg font-bold">Dashboard</h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              aria-label="Notifikasi"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 hover:bg-slate-50"
            >
              <Bell size={18} />
            </button>
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500 text-sm font-bold text-white">
                IP
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {profileLoading
                    ? "Memuat akun..."
                    : profile?.username
                      ? `@${profile.username}`
                      : "Demo Account"}
                </p>
                <p className="text-xs text-slate-400">
                  {profile?.accountType
                    ? profile.accountType
                    : profileLoading
                      ? "Memeriksa koneksi"
                      : "Akun belum terhubung"}
                </p>
              </div>
              <ChevronDown size={15} className="text-slate-400" />
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-[1500px] space-y-7 p-5 md:p-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm text-slate-500">Minggu, 19 Oktober 2026</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                Welcome
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Pantau performa Instagram kamu dalam satu tempat.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium hover:bg-slate-50">
                7 hari terakhir <ChevronDown size={15} />
              </button>

              <a
                href="/api/instagram/login"
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                <Plus size={17} />
                {profile?.username ? "Hubungkan ulang" : "Hubungkan akun"}
              </a>

            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 text-indigo-600">
                <Activity size={20} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  {profile?.username
                    ? `@${profile.username}`
                    : profileLoading
                      ? "Memeriksa koneksi Instagram..."
                      : "Kamu sedang melihat data demo"}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {profile?.username
                    ? `Profil berhasil dibaca${typeof profile.followersCount === "number" ? ` · ${formatMetric(profile.followersCount)} followers` : ""}${typeof profile.mediaCount === "number" ? ` · ${profile.mediaCount} konten pada akun` : ""}. Profil, ringkasan, thumbnail, dan daftar konten diambil dari API Instagram; grafik followers masih data contoh.`
                    : profileError
                      ? `${profileError} Angka dan konten di dashboard masih berupa contoh.`
                      : "Angka dan konten di halaman ini adalah contoh, bukan data akun Instagram asli."}
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700">
              {profile?.username ? "Profil terhubung" : "Demo mode"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Total Followers"
              value={profileLoading ? "Memuat..." : formatMetric(profile?.followersCount)}
              icon={Users}
            />
            <MetricCard
              title="Akun Dijangkau"
              value={insightsLoading ? "Memuat..." : formatMetric(insights?.reach)}
              icon={Eye}
            />
            <MetricCard
              title="Views"
              value={insightsLoading ? "Memuat..." : formatMetric(insights?.views)}
              icon={Activity}
            />
            <MetricCard
              title="Total Interaksi"
              value={insightsLoading ? "Memuat..." : formatMetric(insights?.total_interactions)}
              icon={MessageCircle}
            />
          </div>
          {insightsError ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Insights belum dapat dimuat: {insightsError}
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Metrik di atas berasal dari Instagram Insights dengan periode harian. Ketersediaan nilai mengikuti data yang dikembalikan Instagram.
            </p>
          )}

          <div className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 xl:col-span-2">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="font-bold">Performa akun</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Tren historis followers dan jangkauan konten
                  </p>
                </div>
                <button className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                  <RefreshCw size={13} /> 7 hari
                </button>
              </div>
              <p className="mt-2 text-xs text-amber-600">
                Grafik saat ini masih data contoh; endpoint Insights yang tersedia belum menyediakan deret waktu historis untuk grafik ini.
              </p>
              <div className="mt-6 flex flex-wrap gap-5 text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                  Pertumbuhan followers
                </span>
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-300" />
                  Reach
                </span>
              </div>
              <div className="mt-5 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="followersFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="reachFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#c4b5fd" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#c4b5fd" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#eef0f5" strokeDasharray="4 4" vertical={false} />
                    <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="reach" name="Reach" stroke="#a78bfa" strokeWidth={2} fill="url(#reachFill)" />
                    <Area type="monotone" dataKey="followers" name="Followers baru" stroke="#4f46e5" strokeWidth={2.5} fill="url(#followersFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
              <h3 className="font-bold">Ringkasan konten</h3>
              <p className="mt-1 text-sm text-slate-500">Aktivitas 7 hari terakhir</p>
              <div className="mt-6 space-y-5">
                {mediaLoading ? (
                  <p className="text-sm text-slate-400">Memuat ringkasan konten Instagram...</p>
                ) : mediaError ? (
                  <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">{mediaError}</p>
                ) : mediaTotal === 0 ? (
                  <p className="text-sm text-slate-400">Belum ada konten yang dapat diringkas.</p>
                ) : (
                  contentSummary.map((item) => {
                    const percent = Math.round((item.count / mediaTotal) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-2 font-medium">
                            <item.icon size={16} className="text-slate-400" />
                            {item.label}
                          </span>
                          <span className="text-xs text-slate-500">{item.count} konten</span>
                        </div>
                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                          <div className={`h-full rounded-full ${item.color}`} style={{ width: `${percent}%` }} />
                        </div>
                        <p className="mt-1.5 text-right text-xs text-slate-400">{percent}%</p>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="mt-7 rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total konten yang dimuat</p>
                <p className="mt-1 text-2xl font-bold">
                  {mediaLoading || mediaError ? "—" : mediaTotal}
                  <span className="text-sm font-normal text-slate-400"> konten</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {typeof profile?.mediaCount === "number"
                    ? `Jumlah konten pada profil: ${formatMetric(profile.mediaCount)}. Ringkasan dihitung dari media yang dikembalikan API.`
                    : "Ringkasan berdasarkan media yang dikembalikan API."}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center md:p-6">
              <div>
                <h3 className="font-bold">Konten terbaru</h3>
                <p className="mt-1 text-sm text-slate-500">Postingan Instagram terbaru beserta thumbnail aslinya</p>
              </div>
              <a href="/konten" className="w-fit text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                Lihat semua →
              </a>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-6 py-4 font-medium">Konten</th>
                    <th className="px-4 py-4 font-medium">Views / Reach</th>
                    <th className="px-4 py-4 font-medium">Likes</th>
                    <th className="px-4 py-4 font-medium">Komentar</th>
                    <th className="px-4 py-4 font-medium">Engagement</th>
                    <th className="px-4 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {mediaLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                        Memuat konten Instagram…
                      </td>
                    </tr>
                  ) : mediaError ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-amber-700">
                        {mediaError}
                      </td>
                    </tr>
                  ) : media.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                        Belum ada konten Instagram yang tersedia.
                      </td>
                    </tr>
                  ) : (
                    [...media]
                      .sort(
                        (a, b) =>
                          new Date(b.timestamp || 0).getTime() -
                          new Date(a.timestamp || 0).getTime()
                      )
                      .slice(0, 5)
                      .map((post) => {
                        const thumbnail = getMediaThumbnail(post);
                        const fallbackThumbnail = post.media_type === "VIDEO"
                          ? post.media_url
                          : post.thumbnail_url;
                        const thumbnailFailed = Boolean(failedThumbnails[post.id]);
                        const displayThumbnail = thumbnailFailed
                          ? (fallbackThumbnail && fallbackThumbnail !== thumbnail ? fallbackThumbnail : "")
                          : thumbnail;
                        return (
                          <tr key={post.id} className="hover:bg-slate-50/70">
                            <td className="px-6 py-4">
                              <div className="flex min-w-0 items-center gap-3">
                                {displayThumbnail ? (
                                  <a
                                    href={post.permalink || undefined}
                                    target={post.permalink ? "_blank" : undefined}
                                    rel={post.permalink ? "noreferrer" : undefined}
                                    className="block shrink-0"
                                    aria-label="Buka postingan Instagram"
                                  >
                                    <img
                                      key={`${post.id}-${displayThumbnail}`}
                                      src={displayThumbnail}
                                      alt={getMediaTitle(post)}
                                      loading="eager"
                                      referrerPolicy="no-referrer"
                                      onError={() => {
                                        console.error("Thumbnail Instagram gagal dimuat", {
                                          mediaId: post.id,
                                          mediaType: post.media_type,
                                          hasMediaUrl: Boolean(post.media_url),
                                          hasThumbnailUrl: Boolean(post.thumbnail_url),
                                        });
                                        setFailedThumbnails((previous) => ({
                                          ...previous,
                                          [post.id]: true,
                                        }));
                                      }}
                                      className="h-14 w-14 rounded-xl border border-slate-100 bg-slate-100 object-cover"
                                    />
                                  </a>
                                ) : (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                    {post.media_type === "VIDEO" ? <Video size={22} /> : <Image size={22} />}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="max-w-[280px] truncate font-semibold text-slate-800" title={post.caption || undefined}>
                                    {getMediaTitle(post)}
                                  </p>
                                  <div className="mt-1 flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
                                      {getMediaTypeLabel(post.media_type)}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {formatPostDate(post.timestamp)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 font-medium text-slate-700">
                              {formatMetric(postMetrics[post.id]?.views ?? postMetrics[post.id]?.reach)}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {formatMetric(postMetrics[post.id]?.likes)}
                            </td>
                            <td className="px-4 py-4 text-slate-700">
                              {formatMetric(postMetrics[post.id]?.comments)}
                            </td>
                            <td className="px-4 py-4">
                              {typeof postMetrics[post.id]?.total_interactions === "number" &&
                                typeof (postMetrics[post.id]?.reach ?? postMetrics[post.id]?.views) === "number" &&
                                (postMetrics[post.id]?.reach ?? postMetrics[post.id]?.views)! > 0 ? (
                                <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">
                                  {(((postMetrics[post.id]?.total_interactions ?? 0) / ((postMetrics[post.id]?.reach ?? postMetrics[post.id]?.views) || 1)) * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%
                                </span>
                              ) : (
                                <span title={postMetrics[post.id]?.error || "Metrik engagement tidak tersedia"} className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-500">—</span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-right">
                              {post.permalink ? (
                                <a
                                  href={post.permalink}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center rounded-lg px-2 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50"
                                >
                                  Lihat ↗
                                </a>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="flex flex-col justify-between gap-2 pb-3 text-xs text-slate-400 sm:flex-row">
            <p>© 2026 InstaPulse Analytics</p>
            <p>
              {profile?.username
                ? insights
                  ? "Profil terhubung · Metrik Insights dari Instagram"
                  : "Profil terhubung · Insights belum tersedia"
                : "Demo dashboard · Hubungkan akun Instagram"}
            </p>
          </footer>
        </div>
      </section>
    </main>
  );
}




