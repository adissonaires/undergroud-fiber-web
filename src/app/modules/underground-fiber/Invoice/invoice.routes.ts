import {Route} from "@angular/router";
import {InvoiceComponent} from "./invoice.component";
import {InvoiceFormComponent} from "./invoice-form/invoice-form.component";

export default [
    {
        path: '',
        component: InvoiceComponent
    },
    {
        path: 'create',
        component: InvoiceFormComponent
    },
    {
        path: ':invoiceId/edit',
        component: InvoiceFormComponent
    },
] as Route[];