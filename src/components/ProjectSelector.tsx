import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Building2, ChevronDown } from 'lucide-react';
import { ProjectId, Project, UserRole, getAccessibleProjects, getProjectById } from './ProjectManager';

interface ProjectSelectorProps {
  currentProjectId: ProjectId;
  userRole: UserRole;
  onProjectChange: (projectId: ProjectId) => void;
  className?: string;
}

export function ProjectSelector({ 
  currentProjectId, 
  userRole, 
  onProjectChange, 
  className = "" 
}: ProjectSelectorProps) {
  const accessibleProjectIds = getAccessibleProjects(userRole);
  const currentProject = getProjectById(currentProjectId);

  if (accessibleProjectIds.length <= 1) {
    // If user only has access to one project, show it as a badge instead of dropdown
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Building2 className="w-4 h-4 text-foreground/70" />
        <Badge 
          variant="secondary" 
          className="bg-primary/10 text-primary border-primary/20 font-medium"
        >
          {currentProject.name}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Building2 className="w-4 h-4 text-foreground/70" />
      <Select value={currentProjectId} onValueChange={onProjectChange}>
        <SelectTrigger className="w-auto min-w-[200px] bg-background border-accent/20 focus:ring-primary">
          <div className="flex items-center space-x-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: currentProject.colors.primary }}
            />
            <SelectValue>
              <span className="font-medium text-foreground">{currentProject.name}</span>
            </SelectValue>
          </div>
          <ChevronDown className="w-4 h-4 ml-2 text-foreground/70" />
        </SelectTrigger>
        <SelectContent className="bg-background border-accent/20">
          {accessibleProjectIds.map((projectId) => {
            const project = getProjectById(projectId);
            return (
              <SelectItem 
                key={projectId} 
                value={projectId}
                className="focus:bg-secondary cursor-pointer"
              >
                <div className="flex items-center space-x-3 py-1">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: project.colors.primary }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{project.name}</div>
                    <div className="text-xs text-foreground/60 truncate max-w-[200px]">
                      {project.description}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}

export default ProjectSelector;