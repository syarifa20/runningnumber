import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose"; // Import jwtVerify from jose

export async function middleware(request: NextRequest) {

  const url = new URL(request.url);

  // Handle preflight request (OPTIONS method) for CORS
  // if (request.method === "OPTIONS" || url.pathname.startsWith('/exports')) {
  //   return new NextResponse(null, {
  //     status: 204, 
  //     headers: {
  //       "Access-Control-Allow-Credentials": "true",
  //       "Access-Control-Allow-Origin": request.headers.get("origin") || "*", // Adjust this to allow specific origins
  //       "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, DELETE",
  //       "Access-Control-Allow-Headers":
  //         "Authorization, Content-Type, Access-Control-Allow-Headers, X-Requested-With",
  //     },
  //   });
  // }

  // Token is valid, proceed
  const response = NextResponse.next();
  response.headers.set(
    "Access-Control-Allow-Origin",
    request.headers.get("origin") || "*"
  );
  return response;
}

// Apply the middleware to the desired routes
// Apply the middleware to the desired routes
export const config = {
  matcher: ['/exports/:path*'],
};

