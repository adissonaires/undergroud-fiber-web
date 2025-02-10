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
    }
] as Route[];