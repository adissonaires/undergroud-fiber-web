import {Route} from "@angular/router";
import {CompanyListComponent} from "./company-list.component";
import {CompanyFormComponent} from "../company-form/company-form.component";

export default [
    {
        path: '',
        component: CompanyListComponent
    },
    {
        path: 'create',
        component: CompanyFormComponent
    },
    {
        path: ':companyId/edit',
        component: CompanyFormComponent
    }
] as Route[];
