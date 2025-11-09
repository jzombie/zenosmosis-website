import type { Project } from '../types/Project';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="project-card">
      <h3 className="project-name">{project.name}</h3>
      <p className="project-description">{project.description}</p>
      <span className="github-link">View on GitHub →</span>
    </a>
  );
}
