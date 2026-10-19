
"use client";

import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  ChevronDown,
  Eye,
  Heart,
  Home,
  Image,
  MessageCircle,
  MoreHorizontal,
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

const posts = [
  {
    type: "Reels",
    title: "Behind the scenes campaign",
    date: "18 Okt 2026",
    views: "12.8K",
    likes: "1.2K",
    comments: 86,
    engagement: "8.4%",
    color: "bg-violet-100 text-violet-700",
    visual: "from-fuchsia-500 to-violet-700",
  },
  {
    type: "Carousel",
    title: "5 tips membuat konten menarik",
    date: "17 Okt 2026",
    views: "8.4K",
    likes: "864",
    comments: 42,
    engagement: "6.7%",
    color: "bg-blue-100 text-blue-700",
    visual: "from-sky-400 to-blue-700",
  },
  {
    type: "Foto",
    title: "Keseruan kegiatan komunitas",
    date: "16 Okt 2026",
    views: "6.1K",
    likes: "632",
    comments: 31,
    engagement: "5.9%",
    color: "bg-amber-100 text-amber-700",
    visual: "from-orange-300 to-rose-500",
  },
];

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
}: {
  title: string;
  value: string;
  change: string;
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
        <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-emerald-600">
          <ArrowUpRight size={14} />
          {change}
        </span>
      </div>
      <p className="mt-2 text-xs text-slate-400">Dibandingkan periode sebelumnya</p>
    </div>
  );
}

export default function Dashboard() {
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
                <p className="text-sm font-semibold">Demo Account</p>
                <p className="text-xs text-slate-400">Admin</p>
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
                Selamat datang kembali 👋
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
                Hubungkan akun
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
                  Kamu sedang melihat data demo
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Angka dan konten di halaman ini adalah contoh, bukan data akun Instagram asli.
                </p>
              </div>
            </div>
            <span className="w-fit rounded-full border border-indigo-100 bg-white px-3 py-1.5 text-xs font-semibold text-indigo-700">
              Demo mode
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard title="Total Followers" value="24,891" change="+12.8%" icon={Users} />
            <MetricCard title="Engagement Rate" value="6.84%" change="+2.4%" icon={Heart} />
            <MetricCard title="Total Reach" value="128.4K" change="+18.6%" icon={Eye} />
            <MetricCard title="Total Interaksi" value="8,642" change="+9.2%" icon={MessageCircle} />
          </div>

          <div className="grid gap-5 xl:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 xl:col-span-2">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <h3 className="font-bold">Performa akun</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Pertumbuhan followers dan jangkauan konten
                  </p>
                </div>
                <button className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600">
                  <RefreshCw size={13} /> 7 hari
                </button>
              </div>
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
                {[
                  { label: "Reels", count: "12 konten", percent: "60%", width: "60%", color: "bg-indigo-600", icon: Video },
                  { label: "Carousel", count: "5 konten", percent: "25%", width: "25%", color: "bg-violet-400", icon: Image },
                  { label: "Foto", count: "3 konten", percent: "15%", width: "15%", color: "bg-amber-400", icon: Image },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 font-medium">
                        <item.icon size={16} className="text-slate-400" />
                        {item.label}
                      </span>
                      <span className="text-xs text-slate-500">{item.count}</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${item.color}`} style={{ width: item.width }} />
                    </div>
                    <p className="mt-1.5 text-right text-xs text-slate-400">{item.percent}</p>
                  </div>
                ))}
              </div>
              <div className="mt-7 rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">Total konten dipublikasikan</p>
                <p className="mt-1 text-2xl font-bold">20 <span className="text-sm font-normal text-slate-400">konten</span></p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center md:p-6">
              <div>
                <h3 className="font-bold">Konten terbaru</h3>
                <p className="mt-1 text-sm text-slate-500">Performa publikasi terakhir</p>
              </div>
              <button className="w-fit text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                Lihat semua →
              </button>
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
                  {posts.map((post) => (
                    <tr key={post.title} className="hover:bg-slate-50/70">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${post.visual} text-white`}>
                            {post.type === "Reels" ? <Video size={20} /> : <Image size={20} />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{post.title}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${post.color}`}>{post.type}</span>
                              <span className="text-xs text-slate-400">{post.date}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-medium">{post.views}</td>
                      <td className="px-4 py-4 text-slate-600">{post.likes}</td>
                      <td className="px-4 py-4 text-slate-600">{post.comments}</td>
                      <td className="px-4 py-4">
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700">{post.engagement}</span>
                      </td>
                      <td className="px-4 py-4 text-slate-400">
                        <button aria-label="Menu konten"><MoreHorizontal size={19} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <footer className="flex flex-col justify-between gap-2 pb-3 text-xs text-slate-400 sm:flex-row">
            <p>© 2026 InstaPulse Analytics</p>
            <p>Demo dashboard · Data belum terhubung ke Instagram API</p>
          </footer>
        </div>
      </section>
    </main>
  );
}




