import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnDestroy,
    OnInit,
    ViewEncapsulation
} from '@angular/core';
import {ActivatedRoute, RouterLink, RouterOutlet} from '@angular/router';
import {Subject, takeUntil} from 'rxjs';
import {DateTime} from 'luxon';
import {Project, ProjectsService} from "../../projects/projects.service";
import {MatIcon} from "@angular/material/icon";
import {
    CdkDrag,
    CdkDragDrop,
    CdkDragHandle,
    CdkDropList,
    CdkDropListGroup,
    moveItemInArray,
    transferArrayItem
} from "@angular/cdk/drag-drop";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {DatePipe, NgClass, NgIf} from "@angular/common";
import {CdkScrollable} from "@angular/cdk/scrolling";
import {MatButton, MatIconButton} from "@angular/material/button";
import {Board, Card, List} from "../kanban.models";
import {UntypedFormBuilder, UntypedFormGroup} from "@angular/forms";
import {FuseConfirmationService} from "../../../../../@fuse/services/confirmation";
import {Dailie, DailiesService} from "../../dailys/dailies.service";
import {DailyFormModalComponent} from "../../dailys/daily-form-modal/daily-form-modal.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-kanban-dailies',
    templateUrl: './kanban-dailies.component.html',
    styleUrls: ['./kanban-dailies.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        RouterLink,
        MatIcon,
        CdkDropList,
        CdkDrag,
        MatMenuTrigger,
        MatMenu,
        DatePipe,
        CdkScrollable,
        MatButton,
        NgClass,
        MatIconButton,
        MatMenuItem,
        CdkDragHandle,
        CdkDropListGroup,
        RouterOutlet,
        NgIf
    ],
    // Pode ser standalone se você estiver utilizando essa abordagem
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class KanbanDailiesComponent implements OnInit, OnDestroy {
    board: Board | undefined;

    listTitleForm: UntypedFormGroup;
    dailies: Dailie[];
    projectId: any;
    project: Project;

    // Private
    private readonly _positionStep: number = 65536;
    private readonly _maxListCount: number = 200;
    private readonly _maxPosition: number = this._positionStep * 500;
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private doingDailies: any[];
    private doneDailies: any[];

    /**
     * Constructor
     */
    constructor(
        private _changeDetectorRef: ChangeDetectorRef,
        private _formBuilder: UntypedFormBuilder,
        private _fuseConfirmationService: FuseConfirmationService,
        private _route: ActivatedRoute,
        private _projectsService: ProjectsService,
        private _dailiesService: DailiesService,
        private _matDialog: MatDialog,
    ) {
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        this.projectId = Number(this._route.snapshot.paramMap.get('id'));

        this._projectsService.getProjectById(this.projectId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(project => {
                this.project = project
                this._changeDetectorRef.markForCheck();
            });

        this.board = {
            id: this.projectId,
            title: this.project?.map || 'Project',
            description: null,
            icon: 'heroicons_outline:rectangle-group',
            lastActivity: null,
            members: [],
            lists: [
                {
                    id: "1",
                    title: 'Doing',
                    cards: null,
                    boardId: '',
                    position: 0
                },
                {
                    id: "2",
                    title: 'Done',
                    cards: null,
                    boardId: '',
                    position: 0
                }
            ]
        };
        this.getDailies();
        // Initialize the list title form
        this.listTitleForm = this._formBuilder.group({
            title: [''],
        });
    }

    private getDailies() {
        this._dailiesService.getAllDeliesByProjectId(this.projectId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(dailies => {
                this.dailies = dailies;
                if (this.dailies && this.dailies.length > 0) {
                    // Cria as listas com base nos status das dailies
                    const doingCards = this.dailies
                        .filter(daily => daily.statusCard?.toUpperCase() === 'DOING')
                        .map(daily => ({
                            id: daily.id,
                            title: daily.groupName,
                            description: daily.address,
                            cardId: null,
                            listId: null,
                            position: null,
                            boardId: null,
                            labels: [
                                {title: `${daily.qtyFootage} Fibers Installed`, id: null, boardId: null},
                                {
                                    title: `${daily?.arrayImagesLength ? daily?.arrayImagesLength : '0'} Attachment`,
                                    id: null,
                                    boardId: null
                                },
                            ],
                            dueDate: DateTime.now().toISO()
                        }));

                    const doneCards = this.dailies
                        .filter(daily => daily.statusCard?.toUpperCase() === 'DONE')
                        .map(daily => ({
                            id: daily.id,
                            title: daily.groupName,
                            description: daily.address,
                            cardId: null,
                            listId: null,
                            position: null,
                            boardId: null,
                            labels: [
                                {title: `${daily.qtyFootage} Fibers Installed`, id: null, boardId: null},
                                {
                                    title: `${daily?.arrayImagesLength ? daily?.arrayImagesLength : '0'} Attachment`,
                                    id: null,
                                    boardId: null
                                },
                            ],
                            dueDate: DateTime.now().toISO()
                        }));

                    this.board = {
                        id: this.projectId, // ou outro identificador, se houver
                        title: this.dailies[0].projectName || 'Project', // se existir
                        description: null,
                        icon: 'heroicons_outline:rectangle-group',
                        lastActivity: null,
                        members: [],
                        lists: [
                            {
                                id: "1",
                                title: 'Doing',
                                cards: doingCards,
                                boardId: '',
                                position: 0
                            },
                            {
                                id: "2",
                                title: 'Done',
                                cards: doneCards,
                                boardId: '',
                                position: 0
                            }
                        ]
                    };
                    this._changeDetectorRef.markForCheck();
                }
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

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Focus on the given element to start editing the list title
     *
     * @param listTitleInput
     */
    renameList(listTitleInput: HTMLElement): void {
        // Use timeout so it can wait for menu to close
        setTimeout(() => {
            listTitleInput.focus();
        });
    }

    /**
     * Add new list
     *
     * @param title
     */
    addList(title: string): void {
        // Limit the max list count
        if (this.board.lists.length >= this._maxListCount) {
            return;
        }

        // Create a new list model
        const list = new List({
            boardId: this.board.id,
            position: this.board.lists.length
                ? this.board.lists[this.board.lists.length - 1].position +
                this._positionStep
                : this._positionStep,
            title: title,
        });

        // Save the list
        // this._scrumboardService.createList(list).subscribe();
    }

    /**
     * Update the list title
     *
     * @param event
     * @param list
     */
    updateListTitle(event: any, list: List): void {
        // Get the target element
        const element: HTMLInputElement = event.target;

        // Get the new title
        const newTitle = element.value;

        // If the title is empty...
        if (!newTitle || newTitle.trim() === '') {
            // Reset to original title and return
            element.value = list.title;
            return;
        }

        // Update the list title and element value
        list.title = element.value = newTitle.trim();

        // Update the list
        // this._scrumboardService.updateList(list).subscribe();
    }

    /**
     * Delete the list
     *
     * @param id
     */
    deleteList(id): void {
        // Open the confirmation dialog
        const confirmation = this._fuseConfirmationService.open({
            title: 'Delete list',
            message:
                'Are you sure you want to delete this list and its cards? This action cannot be undone!',
            actions: {
                confirm: {
                    label: 'Delete',
                },
            },
        });

        // Subscribe to the confirmation dialog closed action
        confirmation.afterClosed().subscribe((result) => {
            // If the confirm button pressed...
            if (result === 'confirmed') {
                // Delete the list
                // this._scrumboardService.deleteList(id).subscribe();
            }
        });
    }

    /**
     * Add new card
     */
    addCard(list: List, title: string): void {
        // Create a new card model
        const card = new Card({
            boardId: this.board.id,
            listId: list.id,
            position: list.cards.length
                ? list.cards[list.cards.length - 1].position +
                this._positionStep
                : this._positionStep,
            title: title,
        });

        // Save the card
        // this._scrumboardService.createCard(card).subscribe();
    }

    /**
     * List dropped
     *
     * @param event
     */
    listDropped(event: CdkDragDrop<List[]>): void {
        // Move the item
        moveItemInArray(
            event.container.data,
            event.previousIndex,
            event.currentIndex
        );

        // Calculate the positions
        const updated = this._calculatePositions(event);


        // Update the lists
        // this._scrumboardService.updateLists(updated).subscribe();
    }

    /**
     * Card dropped
     *
     * @param event
     */
    cardDropped(event: CdkDragDrop<Card[]>): void {
        // Move or transfer the item
        if (event.previousContainer === event.container) {
            // Move the item
            moveItemInArray(
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
        } else {
            // Transfer the item
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            );
            console.log("ELSE");
            // Update the card's list it
            event.container.data[event.currentIndex].listId =
                event.container.id;
        }

        // Calculate the positions
        const newStatusCard = event.container.id == "1" ? "DOING" : "DONE";
        const updated = this._calculatePositions(event);
        const movedCard = event.container.data[event.currentIndex];

        this._dailiesService.updateDailyStatusCard(movedCard.id, newStatusCard)
            .subscribe({
                next: () => {
                    console.log("Daily status updated successfully");
                },
                error: (err) => {
                    console.error("Error updating daily status", err);
                    transferArrayItem(
                        event.container.data,
                        event.previousContainer.data,
                        event.currentIndex,
                        event.previousIndex
                    );
                }
            });

        console.log("newStatusCard", newStatusCard)
        console.log("movedCard", movedCard)

    }

    /**
     * Check if the given ISO_8601 date string is overdue
     *
     * @param date
     */
    isOverdue(date: string): boolean {
        return (
            DateTime.fromISO(date).startOf('day') <
            DateTime.now().startOf('day')
        );
    }

    /**
     * Track by function for ngFor loops
     *
     * @param index
     * @param item
     */
    trackByFn(index: number, item: any): any {
        return item.id || index;
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Calculate and set item positions
     * from given CdkDragDrop event
     *
     * @param event
     * @private
     */
    private _calculatePositions(event: CdkDragDrop<any[]>): any[] {
        let items = event.container.data;
        const currentItem = items[event.currentIndex];
        const prevItem = items[event.currentIndex - 1] || null;
        const nextItem = items[event.currentIndex + 1] || null;

        if (!prevItem) {
            if (!nextItem) {
                currentItem.position = this._positionStep;
            } else {
                currentItem.position = nextItem.position / 2;
            }
        } else if (!nextItem) {
            currentItem.position = prevItem.position + this._positionStep;
        } else {
            currentItem.position = (prevItem.position + nextItem.position) / 2;
        }

        if (
            !Number.isInteger(currentItem.position) ||
            currentItem.position >= this._maxPosition
        ) {
            items = items.map((value, index) => {
                value.position = (index + 1) * this._positionStep;
                return value;
            });

            return items;
        }

        return [currentItem];
    }

    openDailyModal(mode: string, daily?: any): void {
        const dialogRef = this._matDialog.open(DailyFormModalComponent, {
            width: '900px',
            height: 'auto',
            maxWidth: 'none',
            panelClass: 'daily-form-modal',
            data: {
                isEditMode: mode === 'edit',
                dailyId: daily?.id,
                project: this.project
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            this.getDailies();
        });
    }
}
