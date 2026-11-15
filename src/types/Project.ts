export interface Project {
  name: string;
  description: string;
  category: string;
  repoUrl: string;
  languages: string[];
  technologies: string[];
  /** Primary crates.io crate names published from this repo, if any. */
  crates?: string[];
}
