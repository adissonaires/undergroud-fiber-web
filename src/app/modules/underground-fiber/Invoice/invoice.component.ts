import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {Subject, takeUntil} from "rxjs";
import {InvoiceService} from "./invoice.service";
import {Invoice} from "../models/invoice.model";
import {DatePipe} from "@angular/common";
import {ActivatedRoute, Router} from "@angular/router";
import {FuseConfirmationService} from "../../../../@fuse/services/confirmation";
import {InvoicePreviewComponent} from "./invoice-preview/invoice-preview.component";
import {MatDialog} from "@angular/material/dialog";
import {MatTooltip} from "@angular/material/tooltip";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-invoice',
  imports: [
    DatePipe,
    MatTooltip,
    FormsModule
  ],
  templateUrl: './invoice.component.html',
  standalone: true,
  styleUrl: './invoice.component.scss'
})
export class InvoiceComponent implements OnInit {
  invoices: Invoice[] = [];
  searchTerm: string = '';
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
      private _invoicesService: InvoiceService,
      private _cdr: ChangeDetectorRef,
      private _router: Router,
      private _activatedRoute: ActivatedRoute,
      private _fuseConfirmationService: FuseConfirmationService,
      private _dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.getAllInvoices()
  }

  getAllInvoices(): void {
    this._invoicesService.getAllInvoices()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(response => {
          this.invoices = response;
          this._cdr.markForCheck();
        });
  }

  get filteredInvoice(): Invoice[] {
    if (!this.searchTerm) {
      return this.invoices;
    }
    const lowerSearch = this.searchTerm.toLowerCase();
    return this.invoices.filter(invoice =>
        invoice.number.toLowerCase().includes(lowerSearch)
    );
  }

  trackByFn(index: number, item: Invoice): number {
    return item.id || index;
  }

  createInvoice(): void {
    this._router.navigate(['create'], { relativeTo: this._activatedRoute });
  }

  previewInvoice(invoice: Invoice): void {
    this._invoicesService.getInvoicePreview(invoice.id).subscribe({
      next: response => {
        let data = {
          invoice: response,
        }

        this._dialog.open(InvoicePreviewComponent, {
          width: '900px',
          height: 'auto',
          maxWidth: 'none',
          panelClass: 'invoice-form-modal',
          data: data
        });
      }
    })

  }

  editInvoice(invoice: Invoice): void {
    this._router.navigate([`${invoice.id}/edit`], { relativeTo: this._activatedRoute });
  }

  deleteInvoice(invoice: Invoice): void {
    const dialogRef = this._fuseConfirmationService.open({
      title: 'Delete Invoice!',
      message: `Are you sure you want to delete this Invoice?`,
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
        this._invoicesService.deleteInvoice(invoice.id).subscribe({
          next: () => {
            const dialogRefTwo = this._fuseConfirmationService.open({
              title: 'Inovice Deleted Successfully!',
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
              this.getAllInvoices()
            })
          }
        })
      }
    });

  }
}
