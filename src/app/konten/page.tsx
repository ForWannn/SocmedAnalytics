
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
    Activity,
    BarChart3,
    Bell,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    ExternalLink,
    Heart,
    Home,
    Image as ImageIcon,
    LayoutGrid,
    LoaderCircle,
    MessageCircle,
    RefreshCw,
    Search,
    Users,
    Video,
    X,
    AlertCircle,
} from "lucide-react";

type InstagramMedia = {
    id: string;
    caption: string;
    mediaType: string;
    mediaUrl: string | null;
    thumbnailUrl: string | null;
    permalink: string | null;
    timestamp: string | null;
};

type MediaResponse = {
    success: boolean;
    media?: InstagramMedia[];
    count?: number;
    message?: string;
};

type MediaInsight = {
    name: string;
    title: string;
    description: string;
    value: number | null;
};

type MediaInsightsResponse = {
    success: boolean;
    mediaId?: string;
    insights?: MediaInsight[];
    message?: string;
};

type FilterType = "ALL" | "IMAGE" | "VIDEO" | "CAROUSEL";

const filters: { label: string; value: FilterType }[] = [
    { label: "Semua konten", value: "ALL" },
    { label: "Foto", value: "IMAGE" },
    { label: "Video / Reels", value: "VIDEO" },
    { label: "Carousel", value: "CAROUSEL" },
];

function getMediaLabel(type: string) {
    switch (type) {
        case "IMAGE":
            return "Foto";
        case "VIDEO":
            return "Video / Reels";
        case "CAROUSEL_ALBUM":
            return "Carousel";
        default:
            return type;
    }
}

function getMediaIcon(type: string) {
    if (type === "VIDEO") return Video;
    if (type === "CAROUSEL_ALBUM") return LayoutGrid;
    return ImageIcon;
}

function formatDate(value: string | null) {
    if (!value) return "Tanggal tidak tersedia";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Tanggal tidak tersedia";
    }

    return new Intl.DateTimeFormat("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(date);
}

export default function KontenPage() {
    const [media, setMedia] = useState<InstagramMedia[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<FilterType>("ALL");
    const [search, setSearch] = useState("");
    const [selectedMedia, setSelectedMedia] =
        useState<InstagramMedia | null>(null);
    const [selectedInsights, setSelectedInsights] = useState<MediaInsight[]>([]);
    const [insightsLoading, setInsightsLoading] = useState(false);
    const [insightsError, setInsightsError] = useState("");

    const fetchMedia = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("/api/instagram/media", {
                method: "GET",
                cache: "no-store",
            });

            const result: MediaResponse = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(
                    result.message || "Gagal mengambil konten Instagram."
                );
            }

            setMedia(Array.isArray(result.media) ? result.media : []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Terjadi kesalahan saat mengambil konten."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchMedia();
    }, [fetchMedia]);

    // Fetch Insights only when a user opens a post's detail.
    // This avoids making a separate API request for every card at page load.
    useEffect(() => {
        if (!selectedMedia) {
            setSelectedInsights([]);
            setInsightsError("");
            setInsightsLoading(false);
            return;
        }

        const controller = new AbortController();

        async function fetchSelectedInsights() {
            setInsightsLoading(true);
            setInsightsError("");
            setSelectedInsights([]);

            try {
                const response = await fetch(
                    `/api/instagram/media/${encodeURIComponent(selectedMedia!.id)}/insights`,
                    {
                        method: "GET",
                        cache: "no-store",
                        signal: controller.signal,
                    }
                );

                const result: MediaInsightsResponse = await response.json();

                if (!response.ok || !result.success) {
                    throw new Error(
                        result.message || "Gagal mengambil Insights konten."
                    );
                }

                setSelectedInsights(
                    Array.isArray(result.insights) ? result.insights : []
                );
            } catch (err) {
                if (err instanceof Error && err.name === "AbortError") return;

                setInsightsError(
                    err instanceof Error
                        ? err.message
                        : "Terjadi kesalahan saat mengambil Insights."
                );
            } finally {
                if (!controller.signal.aborted) {
                    setInsightsLoading(false);
                }
            }
        }

        void fetchSelectedInsights();

        return () => controller.abort();
    }, [selectedMedia]);

    const filteredMedia = useMemo(() => {
        return media.filter((item) => {
            const matchesFilter =
                filter === "ALL" ||
                (filter === "IMAGE" && item.mediaType === "IMAGE") ||
                (filter === "VIDEO" && item.mediaType === "VIDEO") ||
                (filter === "CAROUSEL" &&
                    item.mediaType === "CAROUSEL_ALBUM");

            const matchesSearch = `${item.caption} ${getMediaLabel(
                item.mediaType
            )}`
                .toLowerCase()
                .includes(search.toLowerCase());

            return matchesFilter && matchesSearch;
        });
    }, [media, filter, search]);

    const countByType = (type: FilterType) => {
        if (type === "ALL") return media.length;

        return media.filter((item) => {
            if (type === "CAROUSEL") {
                return item.mediaType === "CAROUSEL_ALBUM";
            }

            return item.mediaType === type;
        }).length;
    };

    return (
        <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="hidden w-[260px] shrink-0 border-r border-slate-200 bg-white px-5 py-7 lg:flex lg:flex-col">
                    <Link href="/" className="mb-12 flex items-center gap-3 px-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5141ff] text-white">
                            <Activity size={25} />
                        </div>
                        <div>
                            <p className="text-xl font-bold tracking-tight">InstaPulse</p>
                            <p className="text-sm text-slate-400">
                                Analytics platform
                            </p>
                        </div>
                    </Link>

                    <p className="mb-4 px-3 text-xs font-bold tracking-[0.16em] text-slate-400">
                        WORKSPACE
                    </p>

                    <nav className="space-y-2">
                        <Link
                            href="/"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-50"
                        >
                            <Home size={19} />
                            Overview
                        </Link>

                        <Link
                            href="/konten"
                            className="flex items-center gap-3 rounded-xl bg-[#f0efff] px-4 py-3 text-sm font-semibold text-[#5141ff]"
                        >
                            <ImageIcon size={19} />
                            Konten
                        </Link>

                        <Link
                            href="/audiens"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-50"
                        >
                            <Users size={19} />
                            Audiens
                        </Link>

                        <Link
                            href="/engagement"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-50"
                        >
                            <Heart size={19} />
                            Engagement
                        </Link>

                        <Link
                            href="/laporan"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-slate-500 transition hover:bg-slate-50"
                        >
                            <BarChart3 size={19} />
                            Laporan
                        </Link>
                    </nav>

                    <div className="mt-auto rounded-2xl bg-[#11182c] p-5 text-white">
                        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                            <Activity size={21} />
                        </div>
                        <p className="font-semibold">Insight lebih dalam</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">
                            Pantau performa konten Instagram kamu dalam satu tempat.
                        </p>
                        <p className="mt-4 text-xs font-semibold text-indigo-300">
                            InstaPulse Analytics
                        </p>
                    </div>
                </aside>

                {/* Main */}
                <main className="min-w-0 flex-1">
                    {/* Top bar */}
                    <header className="flex h-[86px] items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8 lg:px-9">
                        <div>
                            <p className="text-xs text-slate-400">
                                Workspace / Konten
                            </p>
                            <h1 className="mt-1 text-xl font-bold">Konten Instagram</h1>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                aria-label="Notifikasi"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500"
                            >
                                <Bell size={19} />
                            </button>

                            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold text-white">
                                    IP
                                </div>
                                <div>
                                    <p className="text-sm font-semibold">@Instagram</p>
                                    <p className="text-xs text-slate-400">
                                        MEDIA CREATOR
                                    </p>
                                </div>
                                <ChevronDown size={16} className="text-slate-400" />
                            </div>
                        </div>
                    </header>

                    <div className="mx-auto max-w-[1600px] space-y-7 p-5 sm:p-8 lg:p-9">
                        {/* Heading */}
                        <section className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
                            <div>
                                <p className="mb-3 text-sm text-slate-500">
                                    Kelola dan analisis publikasi kamu
                                </p>
                                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                                    Semua konten,{" "}
                                    <span className="text-[#5141ff]">satu tempat.</span>
                                </h2>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                    Lihat postingan Instagram yang sudah dipublikasikan,
                                    cari konten, dan buka postingan aslinya.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => void fetchMedia()}
                                disabled={loading}
                                className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-xl bg-[#5141ff] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4030e8] disabled:cursor-not-allowed disabled:opacity-60 xl:self-auto"
                            >
                                <RefreshCw
                                    size={17}
                                    className={loading ? "animate-spin" : ""}
                                />
                                {loading ? "Memuat..." : "Perbarui konten"}
                            </button>
                        </section>

                        {/* Summary cards */}
                        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-500">Total konten</p>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-[#5141ff]">
                                        <LayoutGrid size={20} />
                                    </span>
                                </div>
                                <p className="mt-4 text-3xl font-bold">
                                    {loading ? "—" : media.length}
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                    Konten yang dikembalikan API
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-500">Foto</p>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                        <ImageIcon size={20} />
                                    </span>
                                </div>
                                <p className="mt-4 text-3xl font-bold">
                                    {loading ? "—" : countByType("IMAGE")}
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                    Media dengan tipe IMAGE
                                </p>
                            </div>

                            <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-slate-500">Video / Reels</p>
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-50 text-fuchsia-600">
                                        <Video size={20} />
                                    </span>
                                </div>
                                <p className="mt-4 text-3xl font-bold">
                                    {loading ? "—" : countByType("VIDEO")}
                                </p>
                                <p className="mt-2 text-xs text-slate-400">
                                    Media dengan tipe VIDEO
                                </p>
                            </div>
                        </section>

                        {/* Connected status */}
                        <section className="flex flex-col gap-3 rounded-2xl border border-[#e0e5ff] bg-[#f0f2ff] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#5141ff]">
                                    <CheckCircle2 size={21} />
                                </span>
                                <div>
                                    <p className="text-sm font-semibold">
                                        Sumber data Instagram
                                    </p>
                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                        Galeri menggunakan respons API Instagram yang
                                        terhubung ke akun kamu.
                                    </p>
                                </div>
                            </div>
                            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-indigo-100 bg-white px-3 py-2 text-xs font-semibold text-[#5141ff]">
                                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                API terhubung
                            </span>
                        </section>

                        {/* Gallery */}
                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <div className="border-b border-slate-100 p-5 sm:p-6">
                                <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                                    <div>
                                        <h3 className="text-lg font-bold">Galeri konten</h3>
                                        <p className="mt-1 text-sm text-slate-500">
                                            {loading
                                                ? "Sedang mengambil data Instagram..."
                                                : `${filteredMedia.length} konten ditampilkan`}
                                        </p>
                                    </div>

                                    <div className="relative w-full xl:max-w-[310px]">
                                        <Search
                                            size={18}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                        />
                                        <input
                                            value={search}
                                            onChange={(event) => setSearch(event.target.value)}
                                            placeholder="Cari caption konten..."
                                            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#8175ff] focus:ring-4 focus:ring-violet-50"
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                aria-label="Hapus pencarian"
                                                onClick={() => setSearch("")}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
                                    {filters.map((item) => {
                                        const active = filter === item.value;

                                        return (
                                            <button
                                                key={item.value}
                                                type="button"
                                                onClick={() => setFilter(item.value)}
                                                className={`inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition ${active
                                                    ? "bg-[#5141ff] text-white shadow-sm"
                                                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                                                    }`}
                                            >
                                                {item.label}
                                                <span
                                                    className={`rounded-md px-1.5 py-0.5 text-xs ${active
                                                        ? "bg-white/20 text-white"
                                                        : "bg-slate-100 text-slate-500"
                                                        }`}
                                                >
                                                    {countByType(item.value)}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="p-5 sm:p-6">
                                {loading ? (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
                                        <LoaderCircle
                                            size={35}
                                            className="animate-spin text-[#5141ff]"
                                        />
                                        <p className="mt-4 font-semibold">
                                            Memuat konten Instagram
                                        </p>
                                        <p className="mt-2 text-sm text-slate-400">
                                            Tunggu sebentar, kami sedang mengambil postinganmu.
                                        </p>
                                    </div>
                                ) : error ? (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
                                            <AlertCircle size={26} />
                                        </span>
                                        <h4 className="mt-4 font-semibold">
                                            Konten gagal dimuat
                                        </h4>
                                        <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                            {error}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => void fetchMedia()}
                                            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#5141ff] px-4 py-2.5 text-sm font-semibold text-white"
                                        >
                                            <RefreshCw size={16} />
                                            Coba lagi
                                        </button>
                                    </div>
                                ) : filteredMedia.length === 0 ? (
                                    <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
                                        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-[#5141ff]">
                                            <ImageIcon size={26} />
                                        </span>
                                        <h4 className="mt-4 font-semibold">
                                            {media.length === 0
                                                ? "Belum ada konten"
                                                : "Konten tidak ditemukan"}
                                        </h4>
                                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                            {media.length === 0
                                                ? "API belum mengembalikan postingan untuk akun ini."
                                                : "Coba ubah filter atau kata kunci pencarian."}
                                        </p>
                                        {(search || filter !== "ALL") && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearch("");
                                                    setFilter("ALL");
                                                }}
                                                className="mt-4 text-sm font-semibold text-[#5141ff]"
                                            >
                                                Hapus semua filter
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                                        {filteredMedia.map((item) => {
                                            const MediaIcon = getMediaIcon(item.mediaType);

                                            return (
                                                <article
                                                    key={item.id}
                                                    className="group min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-violet-200 hover:shadow-lg hover:shadow-violet-100/40"
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedMedia(item)}
                                                        className="relative block aspect-[4/3] w-full overflow-hidden bg-slate-100 text-left"
                                                        aria-label={`Lihat detail konten ${getMediaLabel(item.mediaType)}`}
                                                    >
                                                        {item.thumbnailUrl ? (
                                                            <img
                                                                src={item.thumbnailUrl}
                                                                alt={
                                                                    item.caption
                                                                        ? item.caption.slice(0, 100)
                                                                        : "Thumbnail konten Instagram"
                                                                }
                                                                loading="lazy"
                                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full flex-col items-center justify-center text-slate-400">
                                                                <ImageIcon size={35} />
                                                                <span className="mt-2 text-xs">
                                                                    Preview tidak tersedia
                                                                </span>
                                                            </div>
                                                        )}

                                                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-lg bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
                                                            <MediaIcon size={14} />
                                                            {getMediaLabel(item.mediaType)}
                                                        </span>

                                                        {item.mediaType === "VIDEO" && (
                                                            <span className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white">
                                                                <Video size={17} />
                                                            </span>
                                                        )}
                                                    </button>

                                                    <div className="p-4">
                                                        <div className="flex items-center gap-2 text-xs text-slate-400">
                                                            <CalendarDays size={14} />
                                                            {formatDate(item.timestamp)}
                                                        </div>

                                                        <p className="mt-3 min-h-[66px] whitespace-pre-line break-words text-sm leading-5 text-slate-700">
                                                            {item.caption
                                                                ? item.caption.length > 120
                                                                    ? `${item.caption.slice(0, 120)}...`
                                                                    : item.caption
                                                                : "Tidak ada caption untuk konten ini."}
                                                        </p>

                                                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                                            <button
                                                                type="button"
                                                                onClick={() => setSelectedMedia(item)}
                                                                className="text-xs font-semibold text-[#5141ff] hover:underline"
                                                            >
                                                                Detail konten
                                                            </button>

                                                            {item.permalink ? (
                                                                <a
                                                                    href={item.permalink}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    aria-label="Buka postingan asli"
                                                                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 transition hover:border-violet-200 hover:text-[#5141ff]"
                                                                >
                                                                    Instagram
                                                                    <ExternalLink size={13} />
                                                                </a>
                                                            ) : (
                                                                <span className="text-xs text-slate-400">
                                                                    Link tidak tersedia
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </article>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {!loading && !error && media.length > 0 && (
                                <div className="border-t border-slate-100 px-5 py-4 text-xs leading-5 text-slate-400 sm:px-6">
                                    Menampilkan maksimal {media.length} konten yang
                                    dikembalikan endpoint saat ini. Ini belum tentu seluruh
                                    riwayat publikasi akun.
                                </div>
                            )}
                        </section>

                        <p className="pb-3 text-center text-xs text-slate-400">
                            InstaPulse Analytics · Data konten dari Instagram API
                        </p>
                    </div>
                </main>
            </div>

            {/* Detail modal */}
            {selectedMedia && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedMedia(null)}
                >
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-label="Detail konten Instagram"
                        className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                            <div>
                                <h3 className="font-bold">Detail konten</h3>
                                <p className="mt-1 text-xs text-slate-400">
                                    Informasi dari Instagram API
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedMedia(null)}
                                aria-label="Tutup detail"
                                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="grid gap-0 md:grid-cols-2">
                            <div className="flex min-h-[250px] items-center justify-center bg-slate-100">
                                {selectedMedia.thumbnailUrl ? (
                                    <img
                                        src={selectedMedia.thumbnailUrl}
                                        alt="Preview konten Instagram"
                                        className="max-h-[60vh] w-full object-contain"
                                    />
                                ) : (
                                    <ImageIcon size={42} className="text-slate-400" />
                                )}
                            </div>

                            <div className="space-y-5 p-5 sm:p-7">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                        Jenis konten
                                    </p>
                                    <p className="mt-2 font-semibold">
                                        {getMediaLabel(selectedMedia.mediaType)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                        Tanggal publikasi
                                    </p>
                                    <p className="mt-2 font-semibold">
                                        {formatDate(selectedMedia.timestamp)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                        Caption
                                    </p>
                                    <p className="mt-2 max-h-48 overflow-y-auto whitespace-pre-line break-words text-sm leading-6 text-slate-600">
                                        {selectedMedia.caption ||
                                            "Tidak ada caption untuk konten ini."}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                                        ID Media
                                    </p>
                                    <p className="mt-2 break-all font-mono text-xs text-slate-500">
                                        {selectedMedia.id}
                                    </p>
                                </div>

                                <div className="border-t border-slate-100 pt-5">
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="font-semibold">Performa konten</p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                Insights dari Instagram API
                                            </p>
                                        </div>
                                        {insightsLoading && (
                                            <LoaderCircle size={18} className="animate-spin text-[#5141ff]" />
                                        )}
                                    </div>

                                    {insightsLoading ? (
                                        <p className="mt-4 text-sm text-slate-500">
                                            Mengambil statistik konten...
                                        </p>
                                    ) : insightsError ? (
                                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                                            <p className="text-sm font-medium text-amber-800">
                                                Insights belum tersedia
                                            </p>
                                            <p className="mt-1 break-words text-xs leading-5 text-amber-700">
                                                {insightsError}
                                            </p>
                                        </div>
                                    ) : selectedInsights.length === 0 ? (
                                        <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                                            Instagram tidak mengembalikan metrik untuk konten ini.
                                        </p>
                                    ) : (
                                        <div className="mt-4 grid grid-cols-2 gap-3">
                                            {selectedInsights.map((insight) => {
                                                const metricLabels: Record<string, string> = {
                                                    views: "Views",
                                                    likes: "Likes",
                                                    comments: "Komentar",
                                                    saved: "Disimpan",
                                                    shares: "Dibagikan",
                                                    total_interactions: "Total interaksi",
                                                };

                                                return (
                                                    <div
                                                        key={insight.name}
                                                        className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                                                    >
                                                        <p className="text-xs text-slate-500">
                                                            {metricLabels[insight.name] ?? insight.title}
                                                        </p>
                                                        <p className="mt-2 text-xl font-bold text-slate-900">
                                                            {typeof insight.value === "number"
                                                                ? new Intl.NumberFormat("id-ID").format(insight.value)
                                                                : "—"}
                                                        </p>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {selectedMedia.permalink && (
                                    <a
                                        href={selectedMedia.permalink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5141ff] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#4030e8]"
                                    >
                                        Buka postingan Instagram
                                        <ExternalLink size={16} />
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
