import type { Project } from '../types/Project';
import { LinkOut } from './LinkOut';
import { GitHubMark } from './icons/BrandIcons';
import { BookIcon } from './icons/BookIcon';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const hasActions = Boolean(project.githubUrl || project.bookUrl);

  return (
    <article className="project-card">
      <h3 className="project-name">{project.name}</h3>
      <p className="project-description">{project.description}</p>

      {hasActions && (
        <div className="project-actions">
          {project.githubUrl && (
            <LinkOut
              className="project-action"
              href={project.githubUrl}
              allowReferrer={false}
            >
              <GitHubMark className="project-action-icon" aria-hidden />
              <span>View on GitHub</span>
            </LinkOut>
          )}

          {project.bookUrl && (
            <LinkOut
              className="project-action"
              href={project.bookUrl}
              allowReferrer={true}
            >
              <BookIcon className="project-action-icon" aria-hidden />
              <span>Read the book</span>
            </LinkOut>
          )}
        </div>
      )}
    </article>
  );
}
