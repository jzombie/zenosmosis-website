import type { Project } from '../src/types/Project';
import { projects } from '../src/projects';

export function generateProjectsHTML(projectList: Project[]): string {
  return projectList.map(project => `
        <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="project-card">
          <h3 class="project-name">${project.name}</h3>
          <p class="project-description">${project.description}</p>
          <span class="github-link">View on GitHub →</span>
        </a>`).join('\n');
}

export { projects };
