import type { Project } from '../types/Project';
import { LinkOut } from './LinkOut';
import { BookIcon } from './icons/BookIcon';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const stack = Array.from(new Set([...project.languages, ...project.technologies]));

  return (
    <LinkOut
      href={project.bookUrl}
      className="project-card project-card--linked"
      allowReferrer={true}
    >
      <div className="project-card-body">
        <h3 className="project-name">{project.name}</h3>
        <p className="project-description">{project.description}</p>
        {stack.length > 0 && (
          <p className="project-technologies">{stack.join(', ')}</p>
        )}
      </div>
      <span className="project-callout">
        <BookIcon className="project-action-icon" aria-hidden />
        <span>Read the book</span>
      </span>
    </LinkOut>
  );
}
