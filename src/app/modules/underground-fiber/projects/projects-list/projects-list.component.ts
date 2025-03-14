import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {Project, ProjectsService} from "../projects.service";
import {ActivatedRoute, Router} from "@angular/router";
import {FuseConfirmationService} from "../../../../../@fuse/services/confirmation";
import {project} from "../../../../mock-api/dashboards/project/data";

@Component({
  selector: 'app-projects-list',
  imports: [
    // NgClass,
    FormsModule
  ],
  templateUrl: './projects-list.component.html',
  standalone: true,
  styleUrl: './projects-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectsListComponent implements OnInit
{
  projects: Project[] = [];
  searchTerm: string = '';

  constructor(
      private _projectsService: ProjectsService,
      private _cdr: ChangeDetectorRef,
      private _router: Router,
      private _activatedRoute: ActivatedRoute,
      private _fuseConfirmationService: FuseConfirmationService,
  ) {}

  ngOnInit(): void
  {
    this.loadProjects();
  }

  /**
   * Faz a requisição para buscar os projetos
   */
  loadProjects(): void
  {
    this._projectsService.getAllProjects().subscribe((response: Project[]) => {
      this.projects = response;
      this._cdr.markForCheck();
    });
  }

  get filteredProjects(): Project[] {
    if (!this.searchTerm) {
      return this.projects;
    }
    const lowerSearch = this.searchTerm.toLowerCase();
    return this.projects.filter(project =>
        project.name.toLowerCase().includes(lowerSearch)
    );
  }

  /**
   * trackBy para *ngFor
   */
  trackByFn(index: number, project: Project): any
  {
    return project.id || index;
  }

  openProjectFormCreate(): void
  {
    // Navega para '/projects/create'
    this._router.navigate(['create'], { relativeTo: this._activatedRoute });
  }

  openProjectFormEdit(id: number): void
  {
    // Navega para '/projects/create'
    this._router.navigate([`${id}/edit`], { relativeTo: this._activatedRoute });
  }

  openDailies(id: number): void
  {
    // Navega para '/projects/create'
    this._router.navigate([`kanban/${id}`]);
  }
  deleteProject(id: number): void
  {
    const dialogRef = this._fuseConfirmationService.open({
      title: 'Delete Project!',
      message: `Are you sure you want to delete this Project?`,
      icon:{
        show: true,
        name: "heroicons_outline:exclamation-triangle",
        color: 'error',
      },
      actions: {
        confirm: { label: 'Yes', color: 'accent' },
        cancel: { label: 'No'},
      },
      dismissible: true
    });
    dialogRef.afterClosed().subscribe((rs) => {
      if(rs == "confirmed") {
        this._projectsService.deleteProject(id).subscribe({
          next: () => {
            const dialogRefTwo = this._fuseConfirmationService.open({
              title: 'Project Deleted!',
              message: `Project and images deleted successfully!`,
              icon:{
                show: true,
                name: "heroicons_outline:check-circle",
                color: 'success',
              },
              actions: {
                confirm: { label: 'Ok', color: 'accent' },
                cancel: { show: false },
              },
              dismissible: true
            });

            dialogRefTwo.afterClosed().subscribe(result => {
              this.loadProjects();
            })
          },

          error: (error) => {
            this._fuseConfirmationService.open({
              title: 'Error',
              message: 'Error deleting Invoice! Contact an administrator',
              actions: {
                confirm: { label: 'OK', color: 'primary' },
                cancel: { show: false }
              },
              dismissible: true
            });
          }
        })
      }
    });
  }

}
