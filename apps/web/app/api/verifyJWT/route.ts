import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    // Add CORS headers
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    const data = await req.json();

    try {
      // Verify the token using the secret
      const decoded = jwt.verify(data.token, process.env.JWT_SECRET!);
      if (!decoded) {
        return new NextResponse(
          JSON.stringify({ error: 'Authorization failed' }),
          {
            status: 403,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
      return new NextResponse(
        JSON.stringify({ message: 'Authorized token' }),
        {
          status: 200,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    } catch (error) {
      // Handle various token errors
      if (error instanceof jwt.TokenExpiredError) {
        return new NextResponse(
          JSON.stringify({ message: 'Token has expired' }),
          {
            status: 401,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      } else if (error instanceof jwt.JsonWebTokenError) {
        return new NextResponse(
          JSON.stringify({ message: 'Invalid Token' }),
          {
            status: 498,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      } else {
        return new NextResponse(
          JSON.stringify({ message: 'Authorization Failed' }),
          {
            status: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
          }
        );
      }
    }
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ message: 'Authorization Failed' }),
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
