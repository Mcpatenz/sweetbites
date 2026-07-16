import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", baseUrl));
  }

  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: `${baseUrl}/api/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/?error=token_failed", baseUrl));
    }

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const googleUser = await userRes.json();
    if (!googleUser.email) {
      return NextResponse.redirect(new URL("/?error=no_email", baseUrl));
    }

    let user = await prisma.user.findUnique({ where: { email: googleUser.email } });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split("@")[0],
          password: "oauth_" + Math.random().toString(36).slice(2),
          role: "customer",
          phone: "0000000000",
          profilePicture: googleUser.picture || null,
        },
      });
    } else if (googleUser.picture && !user.profilePicture) {
      await prisma.user.update({ where: { id: user.id }, data: { profilePicture: googleUser.picture } });
      user.profilePicture = googleUser.picture;
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      profilePicture: user.profilePicture || null,
      address: user.address || null,
      employeeNumber: user.employeeNumber || null,
      birthDate: user.birthDate ? user.birthDate.toISOString() : null,
      gender: user.gender || null,
      dateHired: user.dateHired ? user.dateHired.toISOString() : null,
    };

    const redirectUrl = new URL("/auth/callback", baseUrl);
    redirectUrl.searchParams.set("user", JSON.stringify(userData));
    return NextResponse.redirect(redirectUrl);
  } catch {
    return NextResponse.redirect(new URL("/?error=oauth_failed", baseUrl));
  }
}
