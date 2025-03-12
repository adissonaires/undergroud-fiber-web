
export interface InvoiceItem {

    id?: number;
    description: string;
    quantity: number;
    unitPrice?: number;
}


export interface Invoice {
    id?: number;
    number: string;
    date: string;
    dateWorkFrom: string;
    dateWorkTo: string;
    dateDueTo: string;
    projectId: number;
    projectName?: string;
    invoiceItems: InvoiceItem[];
    status: string;
}
