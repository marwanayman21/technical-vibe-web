import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const settings = await prisma.siteSettings.findMany();
  const result: any = {};
  settings.forEach((s: any) => { result[s.id] = s; });
  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { section, data } = await request.json();
  const updated = await prisma.siteSettings.upsert({
    where: { id: section },
    update: { [section]: data },
    create: { id: section, [section]: data },
  });
  return NextResponse.json(updated);
}
