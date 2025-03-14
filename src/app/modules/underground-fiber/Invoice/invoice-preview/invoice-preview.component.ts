import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {CurrencyPipe, DatePipe, formatCurrency} from "@angular/common";
import {MatIcon} from "@angular/material/icon";
import {MatIconButton} from "@angular/material/button";
import html2pdf from 'html2pdf.js';
import {MatTooltip} from "@angular/material/tooltip";



@Component({
  selector: 'app-invoice-preview',
  imports: [
    DatePipe,
    MatIcon,
    CurrencyPipe,
    MatIconButton,
    MatTooltip,
  ],
  templateUrl: './invoice-preview.component.html',
  standalone: true,
  styleUrl: './invoice-preview.component.scss'
})
export class InvoicePreviewComponent implements OnInit {
  invoicePreview:any;

  constructor(
      public dialogRef: MatDialogRef<InvoicePreviewComponent>,
      @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  ngOnInit(): void {
    console.log("DATA", this.data.invoice)
    this.invoicePreview = this.data.invoice;
  }

  close(): void {
    this.dialogRef.close();
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  downloadPdf(): void {
    const data = document.getElementById('pdfContent');

    const opt = {
      margin:       [0, 0, 1, 0],
      filename:     `invoice.pdf`,
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'pt', format: 'a4', orientation: 'portrait' },
      pagebreak:    { mode: ['avoid-all'] },
    };

    html2pdf().from(data).set(opt).save();
  }

  protected readonly formatCurrency = formatCurrency;
}
