import { NextRequest, NextResponse } from 'next/server';
import { submitMessage } from '@/lib/firestore';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { name, email, message } = data;

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const success = await submitMessage({ name, email, message });

    if (!success) {
      throw new Error('Failed to save message to database');
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error: any) {
    console.error('Contact submission error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
