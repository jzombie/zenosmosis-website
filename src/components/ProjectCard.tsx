import type { Project } from '../types/Project';
import { LinkOut } from './LinkOut';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <LinkOut href={project.githubUrl} className="project-card" allowReferrer={false}>
      <h3 className="project-name">{project.name}</h3>
      <p className="project-description">{project.description}</p>
      <span className="github-link">View on GitHub →</span>
    </LinkOut>
  );
}
