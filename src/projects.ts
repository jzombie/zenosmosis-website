import type { Project } from './types/Project';

export const projects: Project[] = [
  {
    name: 'SIMD R Drive',
    description: 'Single-file SIMD-optimized storage engine that guarantees aligned, zero-copy binary reads across platforms.',
    bookUrl: 'https://docs.simd-r-drive.zenosmosis.com/',
    category: 'Filesystems & Databases',
    technologies: ['Rust'],
  },
  {
    name: 'LLKV',
    description:
      'Experimental SQL engine that layers Apache Arrow buffers, a streaming executor, and MVCC over pluggable key-value pagers.',
    bookUrl: 'https://docs.llkv.zenosmosis.com/',
    category: 'Filesystems & Databases',
    technologies: ['Rust'],
  },
  {
    name: 'Muxio',
    description:
      'High-performance multiplexing and RPC toolkit for Rust with transport-agnostic framing and lightweight extensible RPC primitives.',
    bookUrl: 'https://docs.muxio.zenosmosis.com/',
    category: 'Infrastructure & Ops',
    technologies: ['Rust'],
  },
 {
    name: 'Mosquitto Cloudflare Tunnel',
    description:
      'Dockerized Mosquitto broker pre-wired with Cloudflare Tunnel, ACLs, and optional message encryption for remote-first MQTT.',
    bookUrl: 'https://docs.docker-mqtt-mosquitto-cloudflare-tunnel.zenosmosis.com/',
    category: 'Infrastructure & Ops',
    technologies: ['Docker', 'MQTT'],
  },
  {
    name: 'sshfs-mac-docker',
    description: 'Containerized SSHFS + Samba bridge that mounts remote filesystems on macOS without macFUSE hacks.',
    bookUrl: 'https://docs.sshfs-mac-docker.zenosmosis.com/',
    category: 'Infrastructure & Ops',
    technologies: ['Docker', 'Samba'],
  },
  {
    name: 'SQLite sqllogictest Corpus',
    description: 'Docker helper that snapshots the official sqllogictest Fossil repo and extracts the full SQLite regression corpus.',
    bookUrl: 'https://docs.sqlite-sqllogictest-corpus.zenosmosis.com/',
    category: 'Developer Tooling',
    technologies: ['Docker', 'Fossil'],
  },
  {
    name: 'deepwiki-to-mdbook',
    description: 'Transforms DeepWiki spaces into polished mdBook documentation sites through a repeatable Rust pipeline.',
    bookUrl: 'https://docs.deepwiki-to-mdbook.zenosmosis.com/',
    category: 'Developer Tooling',
    technologies: ['Docker', 'Rust'],
  },
  {
    name: 'SEC Fetcher',
    description: 'Research-grade Rust tooling experimenting with efficient retrieval pipelines for SEC filings data.',
    bookUrl: 'https://docs.sec-fetcher.zenosmosis.com/',
    category: 'Research & Data Analysis',
    technologies: ['Rust'],
  },
];
