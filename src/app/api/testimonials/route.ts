import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const items = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data.name || !data.message || !data.rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const item = await prisma.testimonial.create({
      data: {
        name: data.name,
        message: data.message,
        rating: Number(data.rating),
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await request.json();
  await prisma.testimonial.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
