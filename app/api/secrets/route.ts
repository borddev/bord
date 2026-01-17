import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const ENV_FILE = path.join(process.cwd(), '.env.local');

function parseEnvFile(): Record<string, string> {
  if (!fs.existsSync(ENV_FILE)) return {};

  const content = fs.readFileSync(ENV_FILE, 'utf-8');
  const secrets: Record<string, string> = {};

  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) return;

    const key = trimmed.slice(0, eqIndex);
    const value = trimmed.slice(eqIndex + 1);
    secrets[key] = value;
  });

  return secrets;
}

function writeEnvFile(secrets: Record<string, string>) {
  const lines = Object.entries(secrets)
    .filter(([_, v]) => v)
    .map(([k, v]) => `${k}=${v}`);

  fs.writeFileSync(ENV_FILE, lines.join('\n') + '\n');
}

export async function GET() {
  try {
    const secrets = parseEnvFile();

    const secretsList = Object.entries(secrets).map(([key, value]) => ({
      key,
      value,
      masked: value.length > 8
        ? value.slice(0, 4) + '••••' + value.slice(-4)
        : '••••••••'
    }));

    return NextResponse.json({ secrets: secretsList });
  } catch (error) {
    console.error('Error reading secrets:', error);
    return NextResponse.json({ secrets: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { key, value } = await request.json();

    if (!key) {
      return NextResponse.json({ error: 'Key required' }, { status: 400 });
    }

    const secrets = parseEnvFile();
    secrets[key] = value || '';
    writeEnvFile(secrets);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving secret:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
