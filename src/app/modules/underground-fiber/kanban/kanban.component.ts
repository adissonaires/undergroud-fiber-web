import {ChangeDetectorRef, Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {Project, ProjectsService} from "../projects/projects.service";
import {Router, RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {DateTime} from "luxon";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatTooltip} from "@angular/material/tooltip";
import {PercentPipe} from "@angular/common";
import {CdkScrollable} from "@angular/cdk/scrolling";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {FuseConfirmationService} from "../../../../@fuse/services/confirmation";

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

    projects: Project[];
    searchTerm: string = '';

    // Private
    private _unsubscribeAll: Subject<any> = new Subject<any>();

    /**
     * Constructor
     */
    constructor(
        private _cdr: ChangeDetectorRef,
        private _projectsService: ProjectsService,
        private _authService: AuthService,
        private _router: Router,
        private _fuseConfirmationService: FuseConfirmationService,
    ) {
    }

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
    loadProjects(): void {
        if (this._authService.isMaster) {
            this._projectsService.getAllProjects().subscribe((response: Project[]) => {
                this.projects = response;
                this._cdr.markForCheck();
            });
        } else {
            this._projectsService.getAllProjectsByCompany(this._authService.company.id).subscribe((response: Project[]) => {
                this.projects = response;
                this._cdr.markForCheck();
            });
        }
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

    redirectCreateProjectForm() {
        this._router.navigate(['/projects/create'])
    }

    onMapClick(event: MouseEvent, board: any): void {
        event.preventDefault();
        event.stopPropagation();
        console.log('Board', board);
        const dialogRef = this._fuseConfirmationService.open({
            title: 'Download attachment(s)!',
            message: `Are you sure you want to download ${board.projectImages.length} attachment(s)?`,
            icon: {
                show: true,
                name: "heroicons_outline:exclamation-triangle",
                color: 'warning',
            },
            actions: {
                confirm: {label: 'Yes', color: 'accent'},
                cancel: {label: 'No'},
            },
            dismissible: true
        });
        dialogRef.afterClosed().subscribe((rs) => {
            if (rs == "confirmed") {
                this.downloadAllImages(board.projectImages)
            }
        });
    }

    downloadAllImages(images: any[]): void {
        images.forEach(image => {
            const byteCharacters = atob(image.data);
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: image.fileType });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = image.fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);
        });
    }

}
