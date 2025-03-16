import {FuseNavigationItem} from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'company',
        title: 'Companies',
        type: 'basic',
        icon: 'heroicons_outline:building-office-2',
        link: '/companies',
        role: ['MASTER']
    },
    {
        id: 'client',
        title: 'Clients',
        type: 'basic',
        icon: 'heroicons_outline:user-group',
        link: '/clients',
        role: ['MASTER','ADMINISTRATOR']
    },
    {
        id: 'projects',
        title: 'Projects',
        type: 'basic',
        icon: 'heroicons_outline:clipboard-document-check',
        link: '/projects',
        role: ['MASTER', 'ADMINISTRATOR']
    },
    {
        id: 'kanban',
        title: 'Dailies',
        type: 'basic',
        icon: 'heroicons_outline:view-columns',
        link: '/kanban',
        role: ['MASTER', 'USER','ADMINISTRATOR']

    },
    {
        id: 'invoice',
        title: 'Invoice',
        type: 'basic',
        icon: 'heroicons_outline:calculator',
        link: '/invoice',
        role: ['MASTER','ADMINISTRATOR']

    },
    {
        id: 'users',
        title: 'Users',
        type: 'basic',
        icon: 'heroicons_outline:user',
        link: '/users',
        role: ['MASTER','ADMINISTRATOR']

    }
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example'
    }
];
