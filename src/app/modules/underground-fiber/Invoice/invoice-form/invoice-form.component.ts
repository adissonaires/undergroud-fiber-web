import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ProjectsService} from "../../projects/projects.service";
import {InvoiceService} from "../invoice.service";
import {DailiesService} from "../../dailys/dailies.service";
import {FuseConfirmationService} from "../../../../../@fuse/services/confirmation";
import {DateTime} from "luxon";
import {CurrencyPipe, JsonPipe, NgClass} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-invoice-form',
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    JsonPipe,
    MatIcon,
    NgClass,
  ],
  templateUrl: './invoice-form.component.html',
  standalone: true,
  styleUrl: './invoice-form.component.scss'
})
export class InvoiceFormComponent implements OnInit {

  invoiceForm: FormGroup;

  projects: any[] = [];
  dailyItens: any[] = [];
  dailyDisabled: boolean = true;
  isEditMode = false;

  invoiceItems: any[] = [];
  private invoiceId: string;

  constructor(
      private _formBuilder: FormBuilder,
      protected _cdr: ChangeDetectorRef,
      private _projectsService: ProjectsService,
      private _dailyService: DailiesService,
      private _invoicesService: InvoiceService,
      private _router: Router,
      private _fuseConfirmationService: FuseConfirmationService,
      private _route: ActivatedRoute

  ) {}

  ngOnInit(): void {
    this.invoiceForm = this._formBuilder.group({
      number: [''],
      date: [''],
      dateWorkFrom: [''],
      dateWorkTo: [''],
      dateDueTo: [''], // novo campo adicionado
      projectId: [null],
      dailyId: [{ value: null, disabled: true }]
    });


    this._projectsService.getAllProjects().subscribe((projects: any[]) => {
      this.projects = projects;
    });

    this.invoiceForm.get('projectId')?.valueChanges.subscribe(projectId => {
      if (projectId) {
        this._dailyService.getAllDailiesWithoutInvoicesLinked(projectId).subscribe(dailys => {
          if (dailys && dailys.length > 0) {
            this.dailyItens = dailys;
            this.invoiceForm.get('dailyId')?.enable();
            this.dailyDisabled = false;
          } else {
            this.invoiceForm.get('dailyId')?.disable();
            this.dailyDisabled = true;
            // Abre o diálogo de aviso usando FuseConfirmationService
            const confirmation = this._fuseConfirmationService.open({
              title: 'Attention',
              message: 'There are no active dailys in this project.',
              actions: {
                confirm: {
                  label: 'OK',
                  color: 'primary'
                },
                cancel: {
                  show: false
                }
              },
              dismissible: true
            });
          }
        });
      } else {
        this.invoiceForm.get('dailyId')?.disable();
        this.dailyItens = [];
        this.dailyDisabled = true;
      }
      this._cdr.markForCheck();

    });

    // Verifica se estamos em modo edição pela existência de um invoice id na URL
    this.invoiceId = this._route.snapshot.paramMap.get('invoiceId');
    if (this.invoiceId) {
      this.isEditMode = true;
      const invoiceId = Number(this.invoiceId);
      // Busca o invoice pelo id
      this._invoicesService.getInvoiceById(invoiceId).subscribe({
        next: (invoice: any) => {
          this.invoiceForm.patchValue({
            number: invoice.number,
            date: invoice.date,
            dateWorkFrom: invoice.dateWorkFrom,
            dateWorkTo: invoice.dateWorkTo,
            dateDueTo: invoice.dateDueTo,
            projectId: invoice.projectId,
            status: invoice.status
          });
          if (invoice.invoiceItems && invoice.invoiceItems.length > 0) {
            // Limpa o array, se necessário
            this.invoiceItems = [];
            invoice.invoiceItems.forEach((item: any) => {
              this.invoiceItems.push({
                taskName: item.taskName,
                quantity: item.quantity,
                subRate: item.subRate,
                total: item.total,
                taskTypeId: item.taskTypeId,
                taskType: item.taskType,
                id: item.id,
                dailyItemId: item.dailyItemId,
                invoiceId: this.invoiceId,
              });
              this._cdr.markForCheck();
            });
          }
          this.updateProjectFieldState()
          console.log(this.invoiceItems);
          this._cdr.markForCheck();
        }
      });
    }
  }

  /**
   * trackByFn para @for
   */
  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  formatDateTime(dateStr: string): string {
    return DateTime.fromISO(dateStr).toFormat('dd/MM/yyyy HH:mm');
  }

  saveInvoice(): void {
    const formValues = this.invoiceForm.value;
    console.log("Invoice Itens", this.invoiceItems)
    // Cria o objeto InvoiceDTO conforme esperado pelo backend
    const invoiceDTO = {
      number: formValues.number,
      date: formValues.date,
      dateWorkFrom: formValues.dateWorkFrom,
      dateWorkTo: formValues.dateWorkTo,
      dateDueTo: formValues.dateDueTo,
      projectId: Number(formValues.projectId),
      invoiceItems: this.invoiceItems,
      status: 'ACTIVE'
    };

    console.log("invoiceDTO", invoiceDTO)
    if (this.isEditMode) {
      const invoiceId = Number(this._route.snapshot.paramMap.get('invoiceId'));
      this._invoicesService.updateInvoice(invoiceId, invoiceDTO).subscribe({
        next: (updatedInvoice: any) => {
          console.log('Invoice updated successfully', updatedInvoice);
          const dialogRef = this._fuseConfirmationService.open({
            title: 'Success',
            message: 'Invoice updated successfully',
            icon: {
              show: true,
              name: 'heroicons_outline:check',
              color: 'success'
            },
            actions: {
              confirm: { label: 'OK', color: 'accent' },
              cancel: { show: false }
            },
            dismissible: true
          });
          dialogRef.afterClosed().subscribe(() => {
            this._router.navigate(['/invoice']);
          });
        },
        error: (error: any) => {
          console.error('Error updating invoice', error);
          this._fuseConfirmationService.open({
            title: 'Error',
            message: 'Error updating invoice',
            actions: { confirm: { label: 'OK', color: 'primary' }, cancel: { show: false } },
            dismissible: true
          });
        }
      });
    } else {
      this._invoicesService.createInvoice(invoiceDTO).subscribe({
        next: (createdInvoice) => {
          console.log('Invoice created successfully', createdInvoice);
          // Abrir o diálogo de confirmação de sucesso
          const dialogRef = this._fuseConfirmationService.open({
            title: 'Success',
            message: 'Invoice created successfully',
            icon:{
              show: true,
              name: "heroicons_outline:check",
              color: 'success',
            },
            actions: {
              confirm: { label: 'OK', color: 'accent' },
              cancel: { show: false }
            },
            dismissible: true
          });
          dialogRef.afterClosed().subscribe(() => {
            this._router.navigate(['/invoice']);
          });
        },
        error: (error) => {
          console.error('Error creating invoice', error);
          // Abrir o diálogo de confirmação de erro
          this._fuseConfirmationService.open({
            title: 'Error',
            message: 'Error creating invoice',
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

  onDailyChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (selectedValue) {
      const dailyId = Number(selectedValue);
      const selectedDaily = this.dailyItens.find((d: any) => d.id === dailyId);

      if (selectedDaily && selectedDaily.dailyItems && selectedDaily.dailyItems.length > 0) {
        const dialogRef = this._fuseConfirmationService.open({
          title: 'Add Dailies',
          message: `Are you sure you want to add ${selectedDaily.map}'s dailys to this invoice?`,
          icon:{
            show: true,
            name: "heroicons_outline:check",
            color: 'warning',
          },
          actions: {
            confirm: { label: 'YES', color: 'accent' },
            cancel: { label: 'NO'},
          },
          dismissible: true
        });
        dialogRef.afterClosed().subscribe((rs) => {
          if(rs == "confirmed") {
            selectedDaily.dailyItems.forEach((item: any) => {
              this.invoiceItems.push({
                taskName: item.description,
                quantity: item.qtyItem,
                subRate: item.unitPrice,
                total: item.qtyItem * item.unitPrice,
                taskTypeId: item.taskTypeId,
                taskType: item.taskType,
                dailyItemId: item.id,
                invoiceId: this.invoiceId,
                status: item.status,
              });
            });
            this.updateProjectFieldState()
          }
        });
      } else {
        // Se não houver dailyItems, limpa o array e exibe o diálogo de aviso
        this.invoiceItems = [];
        this._fuseConfirmationService.open({
          title: 'No Daily Items',
          message: 'This daily does not have any items.',
          actions: {
            confirm: { label: 'OK', color: 'primary' },
            cancel: { show: false }
          },
          dismissible: true
        });
      }
    }
    this._cdr.markForCheck();
  }

  refreshInvoiceItems(): void {
    // Se não houver itens, não faz nada
    if (!this.invoiceItems || this.invoiceItems.length === 0) {
      return;
    }
    // Chama o endpoint de refresh passando os invoiceItems atuais
    this._invoicesService.refreshInvoiceItems(this.invoiceItems).subscribe({
      next: (refreshedItems: any[]) => {
        this.invoiceItems = refreshedItems;
        this._cdr.markForCheck();
        const dialogRef = this._fuseConfirmationService.open({
          title: 'Success',
          message: 'Invoice items refreshed successfully',
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
      },
      error: (error: any) => {
        console.error('Error refreshing invoice items', error);
        this._fuseConfirmationService.open({
          title: 'Error',
          message: 'Error refreshing invoice items',
          actions: {
            confirm: { label: 'OK', color: 'primary' },
            cancel: { show: false }
          },
          dismissible: true
        });
      }
    });
  }

  protected updateProjectFieldState(): void
  {
    if (this.invoiceItems.length > 0) {
      this.invoiceForm.get('projectId')?.disable({ emitEvent: false });
    }
    else {
      this.invoiceForm.get('projectId')?.enable({ emitEvent: false });
    }
  }

  removeItem(): void
  {
    const dialogRef = this._fuseConfirmationService.open({
      title: 'Are you sure you want to delete all Invoices Items to this invoice?',
      message: `This action will not be confirmed until you save the invoice.`,
      icon:{
        show: true,
        name: "heroicons_outline:exclamation-triangle",
        color: 'error',
      },
      actions: {
        confirm: { label: 'YES', color: 'accent' },
        cancel: { label: 'NO'},
      },
      dismissible: true
    });
    dialogRef.afterClosed().subscribe((rs) => {
      if(rs == "confirmed") {
        this.invoiceItems = []
        this.updateProjectFieldState()
      }
    });
  }

}