
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function forwardAuthRequest(request: NextRequest) {
  if (!API_URL) {
    return NextResponse.json(
      { message: "NEXT_PUBLIC_API_URL is not configured" },
      { status: 500 }
    );
  }

  const apiUrl = new URL(API_URL);

  // /api/auth/sign-in/email
  // -> /api/auth/sign-in/email on Render
  const targetUrl = new URL(
    `${apiUrl.pathname.replace(/\/+$/, "")}${request.nextUrl.pathname.replace(/^\/api/, "")}${request.nextUrl.search}`,
    apiUrl.origin
  );

  const headers = new Headers(request.headers);

  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  const backendResponse = await fetch(targetUrl, {
    method: request.method,
    headers,
    body:
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.arrayBuffer()
        : undefined,
    redirect: "manual",
    cache: "no-store",
  });

  const responseHeaders = new Headers(backendResponse.headers);

  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");
  responseHeaders.delete("transfer-encoding");

  const cookies = backendResponse.headers.getSetCookie();

  responseHeaders.delete("set-cookie");

  const response = new NextResponse(
    backendResponse.status === 204 ||
      backendResponse.status === 304
      ? null
      : backendResponse.body,
    {
      status: backendResponse.status,
      headers: responseHeaders,
    }
  );

  for (const cookie of cookies) {
    response.headers.append("Set-Cookie", cookie);
  }

  return response;
}
