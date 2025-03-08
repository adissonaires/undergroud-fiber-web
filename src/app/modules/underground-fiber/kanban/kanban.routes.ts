import {Route} from "@angular/router";
import {KanbanComponent} from "./kanban.component";
import {KanbanDailiesComponent} from "./kanban-dailies/kanban-dailies.component";

export default [
    {
        path: '',
        component: KanbanComponent
    },
    {
        path: ':id',
        component: KanbanDailiesComponent
    }
] as Route[];