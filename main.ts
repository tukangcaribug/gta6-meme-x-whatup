// gta6-meme-x-01 entry: "WhatUp, Vice City?" (Node 22, standard library only).
//
// The entry itself is the X post: a GTA 6 meme (WhatsApp went blue and
// renamed itself WhatUp, the in-game chat app of GTA VI) posted from the
// public account @zugengblast, with make.fun and the play code in its text.
// This program only hands the gate the post's address: it reads POST.json
// from the repository root, checks that it is a JSON object naming one
// url, and writes those same bytes to /output/POST.json. Nothing it
// writes is judged — the house reads the post from X and hands its first
// picture and its text to the judge. A url that is not yet a real post
// address only earns a warning here; the gate is the one that refuses it.
//
// Run it the way the grader does:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts
// It prints nothing on success and exits 0; a broken file exits 1.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR: string = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR: string = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const POST_FILE = 'POST.json';

// An X post address, as X shows it: https://x.com/<handle>/status/<id>
// (twitter.com, www./mobile., and /i/web/status/<id> read the same).
const POST_URL = /^https:\/\/(www\.|mobile\.)?(x\.com|twitter\.com)\/(i\/web\/)?status\/\d+\/?$/;

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

mkdirSync(OUTPUT_DIR, { recursive: true });

let raw: Buffer;
try {
  raw = readFileSync(join(BOT_DIR, POST_FILE));
} catch (err) {
  fail(`cannot read ${join(BOT_DIR, POST_FILE)}: ${(err as Error).message}`);
}

let post: unknown;
try {
  post = JSON.parse(raw.toString('utf-8'));
} catch (err) {
  fail(`POST.json is not valid JSON: ${(err as Error).message}`);
}

if (
  typeof post !== 'object' ||
  post === null ||
  typeof (post as { url?: unknown }).url !== 'string'
) {
  fail('POST.json must be an object with a "url" string');
}

if (!POST_URL.test((post as { url: string }).url)) {
  console.error(
    'main.ts: warning: POST.json url is not a real X post address yet; the gate will refuse it until it is replaced with one',
  );
}

try {
  writeFileSync(join(OUTPUT_DIR, POST_FILE), raw);
} catch (err) {
  fail(`cannot write ${join(OUTPUT_DIR, POST_FILE)}: ${(err as Error).message}`);
}
