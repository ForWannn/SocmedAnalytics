
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
    const appId = process.env.INSTAGRAM_APP_ID;
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI;
    const scopes =
        process.env.INSTAGRAM_SCOPES ??
        "instagram_business_basic";

    if (!appId || !redirectUri) {
        return NextResponse.json(
            { error: "Instagram App ID atau Redirect URI belum diatur di .env.local." },
            { status: 500 }
        );
    }

    const state = randomUUID();

    const authUrl = new URL(
        "https://www.instagram.com/oauth/authorize"
    );

    authUrl.searchParams.set("client_id", appId);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes);
    authUrl.searchParams.set("state", state);

    const response = NextResponse.redirect(authUrl);

    response.cookies.set("ig_oauth_state", state, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 600,
    });

    return response;
}
