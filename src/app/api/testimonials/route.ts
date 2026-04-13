import {NextResponse} from 'next/server';
import {submitTestimonial} from '@/lib/firestore';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name || !data.message || !data.rating) {
      return NextResponse.json({error: 'Missing fields'}, {status: 400});
    }

    const result = await submitTestimonial({
      name: data.name,
      message: data.message,
      rating: Number(data.rating)
    });

    if (result) {
      return NextResponse.json({success: true});
    } else {
      return NextResponse.json({error: 'Failed to submit'}, {status: 500});
    }
  } catch (error) {
    return NextResponse.json({error: 'Invalid request'}, {status: 400});
  }
}
