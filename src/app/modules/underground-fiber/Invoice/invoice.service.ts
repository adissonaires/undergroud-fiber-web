import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {Invoice} from "../models/invoice.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private _invoicesUrl = `${environment.apiUrl}/invoices`;

  constructor(private _httpClient: HttpClient) { }


  getAllInvoices(): Observable<Invoice[]> {
    return this._httpClient.get<Invoice[]>(this._invoicesUrl);
  }


  getInvoiceById(invoiceId: number): Observable<Invoice> {
    return this._httpClient.get<Invoice>(`${this._invoicesUrl}/${invoiceId}`);
  }


  createInvoice(invoice: Invoice): Observable<Invoice> {
    return this._httpClient.post<Invoice>(this._invoicesUrl, invoice);
  }


  updateInvoice(invoiceId: number, invoice: Invoice): Observable<Invoice> {
    return this._httpClient.put<Invoice>(`${this._invoicesUrl}/${invoiceId}`, invoice);
  }


  deleteInvoice(invoiceId: number): Observable<any> {
    return this._httpClient.delete(`${this._invoicesUrl}/${invoiceId}`);
  }

  refreshInvoiceItems(invoice: any): Observable<any> {
    return this._httpClient.put<Invoice>(`${this._invoicesUrl}/items/refreshInvoiceItems`, invoice);
  }


  getInvoicePreview(invoiceId: number): Observable<any> {
    return this._httpClient.get<any>(`${this._invoicesUrl}/${invoiceId}/preview`);
  }
}
