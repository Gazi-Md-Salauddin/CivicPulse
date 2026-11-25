import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const forwardAuthRequest = (request: NextRequest) => {
  if (!API_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const apiUrl = new URL(API_URL);
  const apiPath = apiUrl.pathname.replace(/\/+$/, "");
  const authPath = request.nextUrl.pathname.replace(
    /^\/api\/auth(?=\/|$)/,
    ""
  );
  const targetUrl = new URL(
    `${apiPath}${authPath}${request.nextUrl.search}`,
    apiUrl.origin
  );

  return NextResponse.redirect(targetUrl, 307);
};
