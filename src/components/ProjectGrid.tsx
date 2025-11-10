import { projects } from '../projects';
import { ProjectCard } from './ProjectCard';
import './ProjectGrid.css';

export function ProjectGrid() {
  return (
    <div className="project-grid-container">
      <h2 className="projects-title">Projects</h2>
      <div className="project-grid">
        {projects.map((project) => (
          <ProjectCard key={project.githubUrl} project={project} />
        ))}
      </div>
    </div>
  );
}
