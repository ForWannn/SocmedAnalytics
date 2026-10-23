import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type InstagramProfileResponse = {
  user_id?: string;
  username?: string;
  followers_count?: number;
  error?: { message?: string };
};

type SnapshotRow = {
  instagram_user_id: string;
  username: string | null;
  snapshot_date: string;
  followers_count: number;
};

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("ig_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ success: false, message: "Token Instagram tidak ditemukan. Hubungkan akun terlebih dahulu." }, { status: 401 });
  }

  try {
    const profileUrl = new URL("https://graph.instagram.com/me");
    profileUrl.searchParams.set("fields", "user_id,username,followers_count");
    profileUrl.searchParams.set("access_token", accessToken);

    const profileResponse = await fetch(profileUrl, { cache: "no-store" });
    const profile = (await profileResponse.json()) as InstagramProfileResponse;
    if (!profileResponse.ok || !profile.user_id || typeof profile.followers_count !== "number") {
      return NextResponse.json({
        success: false,
        message: profile.error?.message ?? "Instagram tidak mengembalikan jumlah followers. Pastikan izin dan jenis akun mendukung followers_count.",
      }, { status: profileResponse.status || 502 });
    }

    // Tanggal disimpan berdasarkan zona waktu Indonesia (WIB). Satu akun hanya satu snapshot per hari.
    const snapshotDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(new Date());

    const supabase = getSupabaseAdmin();
    const { error: upsertError } = await supabase
      .from("follower_snapshots")
      .upsert({
        instagram_user_id: profile.user_id,
        username: profile.username ?? null,
        snapshot_date: snapshotDate,
        followers_count: profile.followers_count,
      }, { onConflict: "instagram_user_id,snapshot_date" });

    if (upsertError) {
      console.error("Follower snapshot save failed:", upsertError.message);
      return NextResponse.json({ success: false, message: "Gagal menyimpan snapshot followers. Pastikan tabel Supabase sudah dibuat sesuai SQL setup." }, { status: 500 });
    }

    const url = new URL(request.url);
    const requestedDays = Number(url.searchParams.get("days") ?? 7);
    const days = [7, 30, 90].includes(requestedDays) ? requestedDays : 7;
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    const sinceDate = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta", year: "numeric", month: "2-digit", day: "2-digit",
    }).format(since);

    const { data, error: readError } = await supabase
      .from("follower_snapshots")
      .select("instagram_user_id,username,snapshot_date,followers_count")
      .eq("instagram_user_id", profile.user_id)
      .gte("snapshot_date", sinceDate)
      .order("snapshot_date", { ascending: true });

    if (readError) {
      console.error("Follower history read failed:", readError.message);
      return NextResponse.json({ success: false, message: "Gagal membaca riwayat followers dari Supabase." }, { status: 500 });
    }

    const snapshots = (data ?? []) as SnapshotRow[];
    const first = snapshots[0]?.followers_count;
    const last = snapshots[snapshots.length - 1]?.followers_count;

    return NextResponse.json({
      success: true,
      username: profile.username ?? null,
      currentFollowers: profile.followers_count,
      days,
      snapshots: snapshots.map((row) => ({
        date: row.snapshot_date,
        label: new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", timeZone: "Asia/Jakarta" }).format(new Date(`${row.snapshot_date}T12:00:00+07:00`)),
        followers: Number(row.followers_count),
      })),
      change: typeof first === "number" && typeof last === "number" ? last - first : 0,
      historyPoints: snapshots.length,
      note: "Snapshot diperbarui saat dashboard dibuka. Untuk pencatatan otomatis setiap hari, dashboard perlu dikunjungi setiap hari atau ditambahkan scheduler yang aman.",
    });
  } catch (error) {
    console.error("Followers history request failed:", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Gagal memuat riwayat followers." }, { status: 500 });
  }
}
