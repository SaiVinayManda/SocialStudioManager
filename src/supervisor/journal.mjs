import fs from 'node:fs';
import path from 'node:path';
import { canonical, digest, requireThat, exact, checkedDirectory } from './contracts.mjs';

export class Journal {
  constructor(directory, maxBytes) {
    this.directory = checkedDirectory(directory); this.maxBytes = maxBytes; this.poisoned = false;
    this.lock = path.join(this.directory, 'controller.lock');
    this.lockFd = fs.openSync(this.lock, 'wx');
    fs.writeSync(this.lockFd, JSON.stringify({ pid: process.pid, started_at: new Date().toISOString() })); fs.fsyncSync(this.lockFd);
    this.file = path.join(this.directory, 'audit.jsonl');
    this.events = []; this.previous = '0'.repeat(64);
    try {
      if (fs.existsSync(this.file)) {
        requireThat(!fs.lstatSync(this.file).isSymbolicLink() && fs.statSync(this.file).nlink === 1, 'JOURNAL_LINK');
        requireThat(fs.statSync(this.file).size <= maxBytes, 'JOURNAL_LIMIT');
        const content = fs.readFileSync(this.file, 'utf8');
        requireThat(content === '' || content.endsWith('\n'), 'JOURNAL_TRUNCATED');
        for (const line of content.split('\n').filter(Boolean)) {
          const record = JSON.parse(line);
          exact(record, ['sequence', 'previous', 'event', 'hash']);
          requireThat(record.sequence === this.events.length + 1 && record.previous === this.previous, 'JOURNAL_CHAIN');
          requireThat(record.hash === digest({ sequence: record.sequence, previous: record.previous, event: record.event }), 'JOURNAL_HASH');
          this.events.push(record.event); this.previous = record.hash;
        }
      }
      this.fd = fs.openSync(this.file, 'a');
    } catch (error) { this.close(); throw error; }
  }
  append(event) {
    requireThat(!this.poisoned && this.fd !== undefined, 'JOURNAL_UNAVAILABLE');
    const base = { sequence: this.events.length + 1, previous: this.previous, event };
    const record = { ...base, hash: digest(base) }, bytes = Buffer.from(canonical(record) + '\n');
    requireThat(fs.fstatSync(this.fd).size + bytes.length <= this.maxBytes, 'JOURNAL_LIMIT');
    try {
      let offset = 0;
      while (offset < bytes.length) offset += fs.writeSync(this.fd, bytes, offset, bytes.length - offset);
      fs.fsyncSync(this.fd);
    } catch (error) { this.poisoned = true; throw error; }
    this.events.push(event); this.previous = record.hash;
  }
  close() {
    if (this.fd !== undefined) { fs.closeSync(this.fd); this.fd = undefined; }
    if (this.lockFd !== undefined) { fs.closeSync(this.lockFd); this.lockFd = undefined; fs.unlinkSync(this.lock); }
  }
}
