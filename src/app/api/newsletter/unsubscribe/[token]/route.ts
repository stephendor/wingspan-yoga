import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params;

    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET not configured');
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { email: string };
    
    if (!decoded.email) {
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 400 }
      );
    }

    const subscription = await prisma.newsletterSubscription.findUnique({
      where: { email: decoded.email },
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    if (!subscription.isActive) {
      return NextResponse.json(
        { message: 'Already unsubscribed from newsletter' },
        { status: 200 }
      );
    }

    // Unsubscribe the user
    await prisma.newsletterSubscription.update({
      where: { email: decoded.email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    // Return a simple HTML page confirming unsubscribe
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed - Wingspan Yoga</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              max-width: 600px; 
              margin: 50px auto; 
              padding: 20px; 
              text-align: center;
              line-height: 1.6;
              color: #333;
            }
            .container {
              background: #f8f9fa;
              padding: 40px;
              border-radius: 8px;
              border: 1px solid #e9ecef;
            }
            h1 { color: #28a745; margin-bottom: 20px; }
            p { margin-bottom: 20px; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>✓ Successfully Unsubscribed</h1>
            <p>You have been successfully unsubscribed from the Wingspan Yoga newsletter.</p>
            <p>We're sorry to see you go! If you change your mind, you can always resubscribe from our blog or website.</p>
            <p><a href="/">Return to Wingspan Yoga</a></p>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });

  } catch (error) {
    console.error('Unsubscribe token error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
