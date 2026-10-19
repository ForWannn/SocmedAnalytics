
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;

    const code = searchParams.get("code");
    const returnedState = searchParams.get("state");
    const oauthError = searchParams.get("error");

    const expectedState = request.cookies.get("ig_oauth_state")?.value;

    const appId = process.env.INSTAGRAM_APP_ID;
    const appSecret = process.env.INSTAGRAM_APP_SECRET;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;

    // Pastikan URL dashboard menggunakan domain callback yang dikonfigurasi.
    if (!redirectUri) {
        return NextResponse.json(
            { error: "INSTAGRAM_REDIRECT_URI belum diatur di .env.local." },
            { status: 500 }
        );
    }

    const dashboardUrl = new URL(redirectUri).origin;

    // Helper untuk mengarahkan kembali ke dashboard dengan pesan status.
    function redirectToDashboard(status: string) {
        const url = new URL("/", dashboardUrl);
        url.searchParams.set("instagram", status);

        return NextResponse.redirect(url);
    }

    // Pengguna membatalkan atau menolak login.
    if (oauthError) {
        const response = redirectToDashboard("error");
        response.cookies.delete("ig_oauth_state");
        return response;
    }

    // Validasi parameter OAuth untuk mencegah callback palsu.
    if (
        !code ||
        !returnedState ||
        !expectedState ||
        returnedState !== expectedState
    ) {
        const response = redirectToDashboard("invalid_callback");
        response.cookies.delete("ig_oauth_state");
        return response;
    }

    if (!appId || !appSecret) {
        console.error("Konfigurasi App ID atau App Secret belum lengkap.");

        const response = redirectToDashboard("config_error");
        response.cookies.delete("ig_oauth_state");
        return response;
    }

    try {
        // Tukar authorization code dengan access token.
        const body = new URLSearchParams({
            client_id: appId,
            client_secret: appSecret,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
            code,
        });

        const tokenResponse = await fetch(
            "https://api.instagram.com/oauth/access_token",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body,
                cache: "no-store",
            }
        );

        const tokenData = await tokenResponse.json();

        if (!tokenResponse.ok || !tokenData.access_token) {
            console.error("Instagram token exchange gagal:", {
                status: tokenResponse.status,
                error:
                    tokenData.error_message ??
                    tokenData.error_type ??
                    "Unknown error",
            });

            const response = redirectToDashboard("token_error");
            response.cookies.delete("ig_oauth_state");
            return response;
        }

        // Login berhasil: arahkan kembali ke dashboard melalui domain ngrok.
        const response = redirectToDashboard("connected");

        response.cookies.set("ig_access_token", tokenData.access_token, {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
            path: "/",
            maxAge: Math.min(Number(tokenData.expires_in) || 3600, 3600),
        });

        response.cookies.delete("ig_oauth_state");

        return response;
    } catch (error) {
        console.error("Instagram callback error:", error);

        const response = redirectToDashboard("callback_error");
        response.cookies.delete("ig_oauth_state");
        return response;
    }
}
