import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

// Use BORD's data directory
const DATA_DIR = path.join(process.cwd(), 'data', 'x-reply-guy');
const STATE_FILE = path.join(DATA_DIR, 'follow4follow-state.json');
const SOURCES_FILE = path.join(DATA_DIR, 'follow4follow-sources.json');

export async function GET() {
  try {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    // Load state from file
    let state = {
      date: new Date().toDateString(),
      followsToday: 0,
      unfollowsToday: 0,
      sourcesUsedToday: [] as string[],
      lastSourceIndex: 0
    };

    if (fs.existsSync(STATE_FILE)) {
      const fileState = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
      if (fileState.date === new Date().toDateString()) {
        state = fileState;
      }
    }

    // Load sources config
    let sourcesData: { [key: string]: any } = {};
    if (fs.existsSync(SOURCES_FILE)) {
      sourcesData = JSON.parse(fs.readFileSync(SOURCES_FILE, 'utf-8'));
    }

    // Build sources array
    const sources = Object.entries(sourcesData)
      .filter(([name]) => name !== '_config')
      .map(([name, data]: [string, any]) => {
        return {
          name,
          followsSent: data.followsSent || 0,
          followBacks: data.followBacks || 0,
          successRate: data.followsSent > 0 ? (data.followBacks || 0) / data.followsSent : 0,
          active: data.active !== false,
          priority: data.priority,
          profile: data.profile,
          lastUsed: data.lastUsed,
          disabledReason: data.disabledReason
        };
      });

    // Calculate overall stats
    const totalFollowing = sources.reduce((sum, s) => sum + s.followsSent, 0);
    const totalFollowBacks = sources.reduce((sum, s) => sum + s.followBacks, 0);
    const followBackRate = totalFollowing > 0 ? (totalFollowBacks / totalFollowing * 100).toFixed(1) : '0';

    return NextResponse.json({
      state,
      sources,
      stats: {
        totalFollowing,
        totalFollowBacks,
        followBackRate: parseFloat(followBackRate),
        pendingFollowBacks: totalFollowing - totalFollowBacks
      },
      recentFollowBacks: [],
      config: {
        maxFollowsPerRun: 100,
        sourceProfiles: Object.keys(sourcesData).filter(k => k !== '_config')
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action } = await request.json();

    // This requires the stealth browser to be set up
    // For now, return instructions
    return NextResponse.json({
      success: false,
      message: 'Follow4Follow automation requires BORD Browser setup. Run: npx tsx lib/browser.ts launch x-reply-guy',
      action
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
