import {Route} from "@angular/router";
import {ClientListComponent} from "./client-list.component";
import {ClientFormComponent} from "../client-form/client-form.component";

export default [
    {
        path: '',
        component: ClientListComponent
    },
    {
        path: 'create',
        component: ClientFormComponent
    },
    {
        path: ':clientId/edit',
        component: ClientFormComponent
    }
] as Route[];
