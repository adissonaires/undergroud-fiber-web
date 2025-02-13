import {ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {NgClass} from "@angular/common";
import {Project, ProjectsService} from "../projects.service";
import {ActivatedRoute, Router} from "@angular/router";

@Component({
  selector: 'app-projects-list',
  imports: [
    NgClass,
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

  constructor(
      private _projectsService: ProjectsService,
      private _cdr: ChangeDetectorRef,
      private _router: Router,
      private _activatedRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void
  {
    // Carrega a lista de projetos quando o componente iniciar
    this.loadProjects();
  }

  /**
   * Faz a requisição para buscar os projetos
   */
  loadProjects(): void
  {
    this._projectsService.getAllProjects().subscribe((response: Project[]) => {
      this.projects = response;
      this._cdr.markForCheck(); // Força atualização (OnPush)
    });
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
}