import React from 'react';
import { Play, MoreVertical, Clock, Tag } from 'lucide-react';

const mockWorkflows = [
  { id: '1', title: 'Start Development', description: 'Starts the Vite dev server and backend watcher concurrently.', commands: 2, lastUsed: '2 hours ago', tags: ['dev', 'typescript'] },
  { id: '2', title: 'Deploy to Production', description: 'Builds the frontend, creates a release binary, and deploys.', commands: 4, lastUsed: '3 days ago', tags: ['deploy', 'rust'] },
  { id: '3', title: 'Run Test Suite', description: 'Runs all unit and integration tests with coverage reporting.', commands: 3, lastUsed: '1 day ago', tags: ['test'] },
  { id: '4', title: 'Build Release', description: 'Creates an optimized production build of the application.', commands: 2, lastUsed: '1 week ago', tags: ['build'] },
  { id: '5', title: 'Database Migration', description: 'Runs pending schema migrations and seeds initial data.', commands: 2, lastUsed: '2 weeks ago', tags: ['db'] },
  { id: '6', title: 'Docker Build & Push', description: 'Builds the Docker container and pushes to the registry.', commands: 3, lastUsed: 'Never', tags: ['docker'] },
  { id: '7', title: 'Code Quality Check', description: 'Runs linter, formatter, and type checker.', commands: 3, lastUsed: '5 hours ago', tags: ['lint'] },
  { id: '8', title: 'Git Flow: Feature', description: 'Creates a new feature branch and sets up tracking.', commands: 4, lastUsed: '1 month ago', tags: ['git'] },
];

export function WorkflowsPage() {
  return (
    <div className="flex flex-col h-full w-full bg-background overflow-y-auto p-6">
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Workflows</h1>
          <p className="text-sm text-muted-foreground mt-1">Automate repetitive command sequences.</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium text-sm hover:opacity-90 transition-opacity">
          Create Workflow
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockWorkflows.map((wf) => (
          <div key={wf.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors group flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{wf.title}</h3>
              <button className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors">
                <MoreVertical size={16} />
              </button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4 flex-1">{wf.description}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {wf.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                  <Tag size={10} /> {tag}
                </span>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-border">
              <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Terminal size={12} className="opacity-70" /> {wf.commands} commands</span>
                <span className="flex items-center gap-1"><Clock size={12} className="opacity-70" /> {wf.lastUsed}</span>
              </div>
              <button className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center transition-colors">
                <Play size={16} className="ml-1" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// added
import { Terminal } from 'lucide-react';