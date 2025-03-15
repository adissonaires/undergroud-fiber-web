import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  OnInit, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { Subject } from 'rxjs';
import {PriceCompositionType, Project, ProjectsService, TaskType} from "../projects.service";
import {MatExpansionModule} from "@angular/material/expansion";
import {MatSnackBar, MatSnackBarModule} from "@angular/material/snack-bar";
import {ActivatedRoute, Router} from "@angular/router";
import {FuseConfirmationService} from "../../../../../@fuse/services/confirmation";
import {AuthService} from "../../../../core/auth/auth.service";
import {Client, ClientService} from "../../clients/client.service";

export interface Attachment {
  fileName: string;
  file: File; // opcional para upload real
  data: any;
  fileType: any;
}

@Component({
  selector: 'project-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatExpansionModule,
    MatSnackBarModule,
  ],
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProjectFormComponent implements OnInit
{
  projectForm: FormGroup;

  projectCodes: any[] = [];

  priceCompositionTypes: PriceCompositionType[] = [];
  taskTypes: TaskType[] = [];
  clients: Client[] = [];

  isEditMode: boolean = false;
  projectId!: number;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  attachments: Attachment[] = [];


  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  /**
   * Construtor
   */
  constructor(
      private _formBuilder: FormBuilder,
      private _cdr: ChangeDetectorRef,
      private _projectsService: ProjectsService,
      private _clientService: ClientService,
      private _authService: AuthService,
      private _route: ActivatedRoute,
      private _router: Router,
      private _snackBar: MatSnackBar,
      private _fuseConfirmationService: FuseConfirmationService,
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  ngOnInit(): void
  {

    this.createProjectForm();

    this._projectsService.getPriceCompositionTypes()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
          this.priceCompositionTypes = response;
          this._cdr.markForCheck();
        });

    this._projectsService.getTaskType()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((response) => {
          this.taskTypes = response;
          this._cdr.markForCheck();
        });

    if (this._authService.isMaster) {
      this._clientService.getAllClients()
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((response) => {
            this.clients = response;
            this._cdr.markForCheck();
          });
    } else {
      this._clientService.getAllClientsByCompany(this._authService.company.id)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((response) => {
            this.clients = response;
            this._cdr.markForCheck();
          });
    }

    this._route.paramMap.subscribe(params => {
      const id = params.get('projectId');
      if (id) {
        this.isEditMode = true;
        this.projectId = Number(id);

        this._projectsService.getProjectById(this.projectId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(project => {

              this.projectForm.patchValue({
                name: project.name,
                map: project.map,
                priceCompositionTypeId: project.priceCompositionTypeId,
                client: project.clientId,
                startDate: project.startDate,
                netTerm: project.netTerm,
                projectStatus: project.status
              });

              this.projectCodes = project.projectCodes || [];
              if (this.projectCodes.length > 0) {
                this.projectCodes.map((code) => {
                  code.taskTypeName = this.getTaskTypeName(code.taskTypeId)
                });
              }
              this.attachments = project.projectImages || [];
              this._cdr.markForCheck();
            });
      }
    });
  }

  private createProjectForm(): void {
    this.projectForm = this._formBuilder.group({
      name: [''],
      map: [''],
      priceCompositionTypeId: [null],


      code: [''],
      description: [''],
      price: [null],
      taskType: [''],


      startDate: [''],
      projectStatus: ['ACTIVE'],
      client: [''],
      netTerm: [null]

    });
  }
  /**
   * Destrói subscriptions para evitar leaks
   */
  ngOnDestroy(): void
  {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  trackByObj(index: number, obj: any): number {
    return obj.id;
  }

  trackByIndex(index: number, item: any): number {
    return index;
  }

  addProjectCode(): void {
    const code = this.projectForm.get('code')?.value;
    const description = this.projectForm.get('description')?.value;
    const price = this.projectForm.get('price')?.value;
    const taskTypeId = this.projectForm.get('taskType')?.value;
    const taskTypeName = this.getTaskTypeName(taskTypeId);

    if (!code) {
      return;
    }

    this.projectCodes.push({ code, description, price, taskTypeId, taskTypeName });


    this.projectForm.patchValue({
      code: '',
      description: '',
      price: null,
      taskType: ''
    });

    this._cdr.markForCheck();
  }

  removeProjectCode(index: number): void {
    this.projectCodes.splice(index, 1);
    this._cdr.markForCheck();
  }

  getTaskTypeName(taskTypeId: any): string {
    const idNum = Number(taskTypeId);
    const found = this.taskTypes.find(t => t.id === idNum);
    return found ? found.name : '';
  }


  selectFile(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      for (let i = 0; i < input.files.length; i++) {
        const file = input.files[i];
        this.attachments.push({ fileName: file.name, file, data: null, fileType: null });
      }

      input.value = '';
      this._cdr.markForCheck();
    }
  }

  downloadAttachment(attachment: Attachment): void {
    if (attachment.data) {
      const fileURL = `data:${attachment.fileType};base64,${attachment.data}`;
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = attachment.fileName;
      a.click();
    }
    else if (attachment.file && attachment.file instanceof Blob) {
      const fileURL = URL.createObjectURL(attachment.file);
      const a = document.createElement('a');
      a.href = fileURL;
      a.download = attachment.fileName;
      a.click();
      URL.revokeObjectURL(fileURL);
    }

    else if (typeof attachment.file === 'string') {
      window.open(attachment.file, '_blank');
    }
    else {
      console.error("Invalid attachment file", attachment);
    }
  }

  createProject(): void {
    const formValues = this.projectForm.value;

    const clientId = formValues.client;
    const selectedClient = this.clients.find(c => c.id === Number(clientId));
    const clientName = selectedClient ? selectedClient.name : '';

    const projectCodesPayload = this.projectCodes.map(codeObj => ({
      code: codeObj.code,
      description: codeObj.description,
      taskTypeId: Number(codeObj.taskTypeId),
      price: codeObj.price
    }));

    const payload: Project = {
      id: null,
      name: formValues.name,
      clientId: Number(clientId),
      clientName: clientName,
      createdAt: null,
      status: formValues.projectStatus,
      map: formValues.map,
      startDate: formValues.startDate,
      priceCompositionTypeId: Number(formValues.priceCompositionTypeId),
      netTerm: formValues.netTerm,
      projectCodes: projectCodesPayload,
      dailies: null,
      projectImages: null
    };


    if (this.isEditMode) {
      this._projectsService.updateProject(this.projectId, payload)
          .subscribe({
            next: (updatedProject) => {
              this.uploadAttachmentsAndNavigate(updatedProject.id, 'edit');
            },
            error: (error) => {
              this._fuseConfirmationService.open({
                title: 'Error',
                message: 'Error editing Invoice!',
                actions: {
                  confirm: { label: 'OK', color: 'primary' },
                  cancel: { show: false }
                },
                dismissible: true
              });
            }
          });
    } else {
      this._projectsService.createProject(payload)
          .subscribe({
            next: (createdProject) => {
              this.uploadAttachmentsAndNavigate(createdProject.id, 'create');
            },
            error: (error) => {
              this._fuseConfirmationService.open({
                title: 'Error',
                message: 'Error editing Invoice!',
                actions: {
                  confirm: { label: 'OK', color: 'primary' },
                  cancel: { show: false }
                },
                dismissible: true
              });
            }
          });
    }
  }

  private uploadAttachmentsAndNavigate(projectId: number, mode:string): void {

    const newFiles = this.attachments.filter(a => a.file instanceof File).map(a => a.file);
    if (newFiles.length > 0) {
      this._projectsService.uploadProjectImages(projectId, newFiles)
          .subscribe({
            next: (uploadResponse) => {
              const dialogRef = this._fuseConfirmationService.open({
                title: 'Success',
                message: `Invoice ${mode == 'edit' ? 'Edited': 'Created'} and Image(s) upload successfully`,
                icon: {
                  show: true,
                  name: 'heroicons_outline:check',
                  color: 'success',
                },
                actions: {
                  confirm: { label: 'OK', color: 'accent' },
                  cancel: { show: false }
                },
                dismissible: true
              });
              this._router.navigate(['/projects']);
            },
            error: (uploadError) => {
              this._fuseConfirmationService.open({
                title: 'Error',
                message: '"Project saved, but image upload failed',
                actions: {
                  confirm: { label: 'OK', color: 'primary' },
                  cancel: { show: false }
                },
                dismissible: true
              });
              this._router.navigate(['/projects']);
            }
          });
    } else {
      const dialogRef = this._fuseConfirmationService.open({
        title: 'Success',
        message: 'Invoice Edited successfully',
        icon: {
          show: true,
          name: 'heroicons_outline:check',
          color: 'success',
        },
        actions: {
          confirm: { label: 'OK', color: 'accent' },
          cancel: { show: false }
        },
        dismissible: true
      });
      this._router.navigate(['/projects']);
    }
  }
}


