import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  const content = await prisma.siteContent.findMany();
  const result: any = {};
  
  for (const c of content) {
    let val = c[c.id as keyof typeof c];
    let changed = false;
    
    // Recursively flatten if the value is an object and contains the section key (nesting)
    while (val && typeof val === 'object' && !Array.isArray(val) && c.id in val) {
      val = (val as any)[c.id];
      changed = true;
    }
    
    // Remove any nested 'id' field if it got into the JSON object
    if (val && typeof val === 'object' && !Array.isArray(val) && 'id' in val) {
      const { id, ...rest } = val as any;
      val = rest;
      changed = true;
    }
    
    if (changed) {
      console.log(`[Self-Healing Content] Flattened nested JSON column for section '${c.id}' and updating database`);
      await prisma.siteContent.update({
        where: { id: c.id },
        data: { [c.id]: val }
      });
    }
    
    result[c.id] = val;
  }
  
  return NextResponse.json(result);
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { section, data } = await request.json();
  const updated = await prisma.siteContent.upsert({
    where: { id: section },
    update: { [section]: data },
    create: { id: section, [section]: data },
  });
  return NextResponse.json(updated);
}
