import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {Project, ProjectsService} from "../projects/projects.service";
import {Router, RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {DateTime} from "luxon";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatTooltip} from "@angular/material/tooltip";
import {PercentPipe} from "@angular/common";
import {CdkScrollable} from "@angular/cdk/scrolling";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

class ScrumboardService {
}

@Component({
  selector: 'app-kanban',
  imports: [
    RouterLink,
    MatIcon,
    MatProgressBar,
    MatTooltip,
    PercentPipe,
    CdkScrollable,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './kanban.component.html',
  standalone: true,
  styleUrl: './kanban.component.scss'
})
export class KanbanComponent implements OnInit, OnDestroy {

  projects : Project[];
  searchTerm: string = '';

  // Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
      private _cdr: ChangeDetectorRef,
      private _projectsService: ProjectsService,
      private _router: Router,
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Get the boards
    this.loadProjects()
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
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  formatDateAsRelative(date: string): string {
    return DateTime.fromISO(date).toRelative();
  }

  getProjectProgress(board: Project): number {
    if (!board.dailies || board.dailies.length === 0) {
      return 0;
    }
    const doneCount = board.dailies.filter(daily =>
        daily.statusCard && daily.statusCard.toUpperCase() === 'DONE'
    ).length;

    return (100 * doneCount) / board.dailies.length;
  }

  redirectCreateProjectForm(){
    this._router.navigate(['/projects/create'])
  }

}
