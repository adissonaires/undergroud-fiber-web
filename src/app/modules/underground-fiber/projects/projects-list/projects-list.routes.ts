import {Route} from "@angular/router";
import {ProjectsListComponent} from "./projects-list.component";
import {ProjectFormComponent} from "../project-form/project-form.component";

export default [
    {
        path: '',
        component: ProjectsListComponent
    },
    {
        path: 'create',
        component: ProjectFormComponent
    },
    {
        path: ':projectId/edit',
        component: ProjectFormComponent
    }
] as Route[];