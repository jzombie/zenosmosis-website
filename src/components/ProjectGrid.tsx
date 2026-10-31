import { projects } from '../projects';
import { ProjectCard } from './ProjectCard';
import type { Project } from '../types/Project';
import './ProjectGrid.css';

export function ProjectGrid() {
  const groupedProjects = projects.reduce<Map<string, Project[]>>((map, project) => {
    if (!map.has(project.category)) {
      map.set(project.category, []);
    }
    map.get(project.category)!.push(project);
    return map;
  }, new Map());

  return (
    <div className="project-grid-container">
      <h2 className="projects-title">
        <span>Projects</span>
      </h2>
      <p className="projects-subtitle">
        A selection of open-source systems, tools, and experiments.
        <br />
        Most of these projects are early stage and actively developed.
      </p>
      <div className="project-categories">
        {Array.from(groupedProjects.entries()).map(([category, categoryProjects]) => (
          <section key={category} className="project-category">
            <h3 className="project-category-title">{category}</h3>
            <div className="project-grid">
              {categoryProjects.map((project) => (
                <ProjectCard key={project.name} project={project} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
