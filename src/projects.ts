import type { Project } from './types/Project';

export const projects: Project[] = [
  {
    name: 'LLKV',
    description:
      'Experimental SQL engine that layers Apache Arrow buffers, a streaming executor, and MVCC over pluggable key-value pagers.',
    githubUrl: 'https://github.com/jzombie/rust-llkv',
  },
  {
    name: 'sshfs-mac-docker',
    description: 'Containerized SSHFS + Samba bridge that mounts remote filesystems on macOS without macFUSE hacks.',
    githubUrl: 'https://github.com/jzombie/sshfs-mac-docker',
  },
  {
    name: 'Mosquitto Cloudflare Tunnel',
    description:
      'Dockerized Mosquitto broker pre-wired with Cloudflare Tunnel, ACLs, and optional message encryption for remote-first MQTT.',
    githubUrl: 'https://github.com/jzombie/docker-mqtt-mosquitto-cloudflare-tunnel',
  },
  {
    name: 'SQLite sqllogictest Corpus',
    description: 'Docker helper that snapshots the official sqllogictest Fossil repo and extracts the full SQLite regression corpus.',
    githubUrl: 'https://github.com/jzombie/sqlite-sqllogictest-corpus',
  },
  {
    name: 'deepwiki-to-mdbook',
    description: 'Transforms DeepWiki spaces into polished mdBook documentation sites through a repeatable Rust pipeline.',
    githubUrl: 'https://github.com/jzombie/deepwiki-to-mdbook',
  },
  {
    name: 'SIMD R Drive',
    description: 'Single-file SIMD-optimized storage engine that guarantees aligned, zero-copy binary reads across platforms.',
    githubUrl: 'https://github.com/jzombie/rust-simd-r-drive',
  },
  {
    name: 'Muxio',
    description:
      'High-performance multiplexing and RPC toolkit for Rust with transport-agnostic framing and lightweight extensible RPC primitives.',
    githubUrl: 'https://github.com/jzombie/rust-muxio',
  },
  {
    name: 'SEC Fetcher',
    description: 'Research-grade Rust tooling experimenting with efficient retrieval pipelines for SEC filings data.',
    githubUrl: 'https://github.com/jzombie/rust-sec-fetcher',
  },
];
