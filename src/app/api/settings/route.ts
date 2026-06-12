import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';
import { getServerSession } from 'next-auth';

export async function GET() {
  // Retrieve the single 'general' settings row which contains all configuration sections
  const settings = await prisma.siteSettings.findUnique({
    where: { id: 'general' }
  });

  if (settings) {
    let changed = false;
    for (const section of ['general', 'stats', 'socials'] as const) {
      let val = settings[section];
      
      // Recursively flatten if the value is an object and contains the section key (nesting)
      while (val && typeof val === 'object' && !Array.isArray(val) && section in val) {
        val = (val as any)[section];
        changed = true;
      }
      
      // Remove any nested 'id' field if it got into the JSON object
      if (val && typeof val === 'object' && !Array.isArray(val) && 'id' in val) {
        const { id, ...rest } = val as any;
        val = rest;
        changed = true;
      }
      
      if (changed) {
        (settings as any)[section] = val;
      }
    }
    
    if (changed) {
      console.log('[Self-Healing Settings] Flattened nested JSON columns and updating database');
      await prisma.siteSettings.update({
        where: { id: 'general' },
        data: {
          general: settings.general ?? undefined,
          stats: settings.stats ?? undefined,
          socials: settings.socials ?? undefined,
        }
      });
    }
  }

  return NextResponse.json(settings || {});
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { section, data } = await request.json();
  
  const updated = await prisma.siteSettings.upsert({
    where: { id: 'general' },
    update: { [section]: data },
    create: { id: 'general', [section]: data }
  });
  return NextResponse.json(updated);
}
