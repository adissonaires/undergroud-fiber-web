import {Route} from '@angular/router';
import {initialDataResolver} from 'app/app.resolvers';
import {LayoutComponent} from 'app/layout/layout.component';

export const appRoutes: Route[] = [

    {path: '', pathMatch: 'full', redirectTo: 'kanban'},
    {path: 'signed-in-redirect', pathMatch: 'full', redirectTo: 'kanban'},
    {path: 'reset-password', pathMatch: 'full', redirectTo: 'reset-password'},
    // Auth routes for guests
    {
        path: '',
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {
                path: 'confirmation-required',
                loadChildren: () => import('app/modules/auth/confirmation-required/confirmation-required.routes')
            },
            {
                path: 'forgot-password',
                loadChildren: () => import('app/modules/auth/forgot-password/forgot-password.routes')
            },
            {
                path: 'reset-password',
                loadChildren: () => import('app/modules/auth/reset-password/reset-password.routes')
            },
            {path: 'sign-in', loadChildren: () => import('app/modules/auth/sign-in/sign-in.routes')},
            {path: 'sign-up', loadChildren: () => import('app/modules/auth/sign-up/sign-up.routes')},
        ]
    },

    // Auth routes for authenticated users
    {
        path: '',
        // canActivate: [AuthGuard],
        // canActivateChild: [AuthGuard],
        component: LayoutComponent,
        data: {
            layout: 'empty'
        },
        children: [
            {path: 'sign-out', loadChildren: () => import('app/modules/auth/sign-out/sign-out.routes')},
            {
                path: 'unlock-session',
                loadChildren: () => import('app/modules/auth/unlock-session/unlock-session.routes')
            }
        ]
    },
    {
        path: '',
        // canActivate: [AuthGuard],
        // canActivateChild: [AuthGuard],
        component: LayoutComponent,
        resolve: {
            initialData: initialDataResolver
        },
        children: [
            {path: 'users', loadChildren: () => import('app/modules/underground-fiber/users/users/users.routes')},
            {path: 'settings', loadChildren: () => import('app/modules/underground-fiber/settings/settings.routes')},
            {
                path: 'companies',
                loadChildren: () => import('app/modules/underground-fiber/companies/company-list/company-list.routes')
            }, {
                path: 'clients',
                loadChildren: () => import('app/modules/underground-fiber/clients/client-list/client-list.routes')
            }, {
                path: 'projects',
                loadChildren: () => import('app/modules/underground-fiber/projects/projects-list/projects-list.routes')
            },
            {path: 'kanban', loadChildren: () => import('app/modules/underground-fiber/kanban/kanban.routes')},
            {path: 'invoice', loadChildren: () => import('app/modules/underground-fiber/Invoice/invoice.routes')},
        ]
    }
];
