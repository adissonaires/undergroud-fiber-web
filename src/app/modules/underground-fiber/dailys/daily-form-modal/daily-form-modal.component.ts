import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, ElementRef,
  Inject,
  OnDestroy,
  OnInit, ViewChild,
  ViewEncapsulation
} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import { Subject} from 'rxjs';
import {MatAccordion, MatExpansionModule, MatExpansionPanel, MatExpansionPanelTitle} from "@angular/material/expansion";
import {MatIcon} from "@angular/material/icon";
import {CommonModule} from "@angular/common";
import {MatButton, MatIconButton} from "@angular/material/button";
import {Attachment} from "../../projects/project-form/project-form.component";
import {DailiesService} from "../dailies.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {FuseConfirmationService} from "../../../../../@fuse/services/confirmation";

@Component({
  selector: 'app-daily-form-modal',
  templateUrl: './daily-form-modal.component.html',
  styleUrls: ['./daily-form-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelTitle,
    MatIcon,
    MatExpansionModule,
    CommonModule,
    MatIconButton
  ]
})
export class DailyFormModalComponent implements OnInit, OnDestroy {
  dailyForm: FormGroup;
  dailyItems: any[] = [];
  // Opções para o campo "Pipe"
  pipeOptions: string[] = ['1.25', '2.0', '1.25 & 2.0'];

  codeOptions: any[];

  private _unsubscribeAll: Subject<any> = new Subject<any>();
  attachments: Attachment[] = [];

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  constructor(
      private _formBuilder: FormBuilder,
      private _cdr: ChangeDetectorRef,
      private _dailyService: DailiesService,
      private _snackBar: MatSnackBar,
      public matDialogRef: MatDialogRef<DailyFormModalComponent>,
      private _router: Router,
      private _fuseConfirmationService: FuseConfirmationService,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    this.initDailyForm();

    if(this.data.isEditMode){
      console.log("daily", this.data.dailyId)
      this._dailyService.getDailyById(this.data.dailyId).subscribe({
        next: daily => {
          console.log("RESULT>>", daily)
          this.dailyForm.patchValue({
            id: daily.id,
            map: daily.map,
            pipe: daily.pipe,
            qtyFootage: daily.qtyFootage,
            qtyDrill: daily.qtyDrill,
            qtyMissil: daily.qtyMissil,
            dateCheckIn: daily.dateCheckIn,
            dateCheckOut: daily.dateCheckOut,
            address: daily.address,
            observation: daily.observation,
            groupName: daily.groupName,
            supervisor: daily.supervisor,
            data: daily.createdAt,
            statusCard: daily.statusCard,
            // project: daily.projectName,
            // subcontractor: daily.subcontractor
          });

          if(daily.dailyItems && daily.dailyItems.length > 0){
            this.dailyItems = daily.dailyItems;
          }

          this._cdr.markForCheck()
        }
      })
    }

    this.codeOptions = this.data?.project?.projectCodes
    console.log("this.this.data", this.data)

    this.dailyForm.get('codeItem')?.valueChanges.subscribe(selectedCode => {
      const codeObj = this.codeOptions.find(item => item.code === selectedCode);
      if (codeObj) {
        this.dailyForm.patchValue({
          descriptionItem: codeObj.description,
          taskTypeId: codeObj.taskTypeId
        });
      } else {
        this.dailyForm.patchValue({
          descriptionItem: '',
          taskTypeId: ''
        });
      }
      this._cdr.markForCheck();
    });
  }

  private initDailyForm(): void {
    this.dailyForm = this._formBuilder.group({
      id: [0],
      map: ['', [Validators.required]],
      pipe: [''],
      qtyFootage: [null, [Validators.required]],
      qtyDrill: [null],
      qtyMissil: [null],
      dateCheckIn: ['', [Validators.required]],
      dateCheckOut: ['', [Validators.required]],
      address: ['', [Validators.required]],
      observation: [''],
      codeItem: [''],
      descriptionItem: [{value: '', disabled: true}],
      qtyItem: [null],
      taskTypeId: [{value: '', disabled: true}],
      groupName: ['', [Validators.required]],
      supervisor: ['', [Validators.required]],
      data: ['', [Validators.required]],
      statusCard: ['', [Validators.required]],
      project: [{value: this.data.project.name, disabled: true}],
      subcontractor: [{value: this.data.project.clientName, disabled: true}]
    });
  }

  close(): void {
    this.matDialogRef.close();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
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

  trackByIndex(index: number, item: any): number {
    return index;
  }


  addDailyItem(): void {
    const code = this.dailyForm.get('codeItem')?.value;
    // Se o código não foi informado, não adiciona
    if (!code) {
      return;
    }
    const description = this.dailyForm.get('descriptionItem')?.value;
    const qtyItem = this.dailyForm.get('qtyItem')?.value;
    const taskTypeId = this.dailyForm.get('taskTypeId')?.value;
    const taskType = this.getTaskTypeName(taskTypeId);

    this.dailyItems.push({ code, description, qtyItem, taskTypeId, taskType });

    // Limpa os campos dos itens para nova entrada
    this.dailyForm.patchValue({
      codeItem: '',
      descriptionItem: '',
      qtyItem: null,
      taskTypeId: ''
    });
    this._cdr.markForCheck();
  }

  removeDailyItem(index: number): void {
    this.dailyItems.splice(index, 1);
    this._cdr.markForCheck();
  }

  getTaskTypeName(taskTypeId: any): string {
    const idNum = Number(taskTypeId);
    const found = this.codeOptions.find(item => item.taskTypeId === idNum);
    return found ? found.taskTypeName : '';
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

  saveDaily(): void {

    if (this.dailyForm.invalid) {
      this.dailyForm.markAllAsTouched();

      this._fuseConfirmationService.open({
        title: 'Required fields missing',
        message: 'Please fill out all required fields before saving.',
        actions: {
          confirm: { label: 'OK', color: 'primary' },
          cancel: { show: false }
        },
        dismissible: true
      });
      return;
    }

    if (this.dailyItems.length === 0) {
      this._fuseConfirmationService.open({
        title: 'No items added',
        message: 'You must add at least one item before saving.',
        actions: {
          confirm: { label: 'OK', color: 'primary' },
          cancel: { show: false }
        },
        dismissible: true
      });
      return;
    }


    if (this.dailyItems.length === 0) {
      const dialogRef = this._fuseConfirmationService.open({
        title: 'No items',
        message: 'You must add at least one item before saving.',
        actions: {
          confirm: { label: 'OK', color: 'primary' },
          cancel: { show: false }
        },
        dismissible: true
      });
      return;
    }

    const payload = this.dailyForm.value;
    if(this.data.isEditMode) {
      payload.id = this.dailyForm.get('id').value;
    }
    payload.dailyItems = this.dailyItems
    payload.projectId = this.data.project.id;
    payload.subcontractor = this.data.project.clientId

    console.log("Payload to be sent:", payload);

    if(this.data.isEditMode) {
      this._dailyService.editDaily(payload)
          .subscribe({
            next: (dailyEdited) => {
              this.uploadAttachmentsAndNavigate(dailyEdited.id)
              console.log("Project created successfully", dailyEdited)
            },
            error: (error) => {
              this._snackBar.open("Error creating project", "Close", { duration: 3000 });
            }
          });
    } else {
      this._dailyService.createDaily(payload)
          .subscribe({
            next: (dailiyCreted) => {
              this.uploadAttachmentsAndNavigate(dailiyCreted.id)
              console.log("Project created successfully", dailiyCreted)
            },
            error: (error) => {
              this._snackBar.open("Error creating project", "Close", { duration: 3000 });
            }
          });
    }
  }


  private uploadAttachmentsAndNavigate(dailyId: number): void {

    const newFiles = this.attachments.filter(a => a.file instanceof File).map(a => a.file);
    if (newFiles.length > 0) {
      this._dailyService.uploadDailyImages(dailyId, newFiles)
          .subscribe({
            next: (uploadResponse) => {
              this.matDialogRef.close();
              this._snackBar.open("Daily saved and Images uploaded successfully", "Close", { duration: 3000 });
              this._router.navigate(['/projects']);
            },
            error: (uploadError) => {
              this.matDialogRef.close();
              this._snackBar.open("Daily saved, but image upload failed!", "Close", { duration: 3000 });
              this._router.navigate(['/projects']);
            }
          });
    } else {
      this.matDialogRef.close();
      this._router.navigate(['/projects']);
    }
  }
}
