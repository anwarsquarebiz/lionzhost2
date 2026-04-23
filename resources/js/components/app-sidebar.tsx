import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { type NavGroup, type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    Folder, 
    LayoutGrid,
    Globe,
    DollarSign,
    Package,
    ShoppingCart,
    Server,
    Shield,
    Activity,
    Inbox
} from 'lucide-react';
import AppLogo from './app-logo';

const getNavGroups = (userRole?: string): NavGroup[] => {
    const groups: NavGroup[] = [];

    // General navigation for all users
    groups.push({
        title: 'Manage Products',
        items: [
            // {
            //     title: 'Dashboard',
            //     href: dashboard(),
            //     icon: LayoutGrid,
            // },
            {
                title: 'Domain Search',
                href: '/dashboard/domains/search',
                icon: Globe,
            },
            {
                title: 'My Domains',
                href: '/my/domains',
                icon: Globe,
            },
            {
                title: 'My Hosting',
                href: '/my/hosting',
                icon: Server,
            },
        ],
    });

    // Admin/Staff management navigation
    if (userRole === 'admin' || userRole === 'staff') {
        groups.push({
            title: 'Management',
            items: [
                {
                    title: 'TLDs & Pricing',
                    href: '/admin/tlds',
                    icon: DollarSign,
                },
                {
                    title: 'Products',
                    href: '/admin/products',
                    icon: Package,
                },
                {
                    title: 'Orders',
                    href: '/admin/orders',
                    icon: ShoppingCart,
                },
                {
                    title: 'Domain Orders',
                    href: '/admin/domain-orders',
                    icon: Globe,
                },
                {
                    title: 'Hosting Orders',
                    href: '/admin/hosting-orders',
                    icon: Server,
                },
                // {
                //     title: 'Registry Accounts',
                //     href: '/admin/registry-accounts',
                //     icon: Shield,
                // },
                // {
                //     title: 'EPP Poll Inbox',
                //     href: '/admin/epp-poll',
                //     icon: Inbox,
                // },
                // {
                //     title: 'Audit Logs',
                //     href: '/admin/audit-logs',
                //     icon: Activity,
                // },
            ],
        });
    }

    // Customer navigation
    if (userRole === 'customer') {
        groups.push({
            title: 'My Services',
            items: [
                {
                    title: 'My Domains',
                    href: '/my/domains',
                    icon: Globe,
                },
                {
                    title: 'My Hosting',
                    href: '/my/hosting',
                    icon: Server,
                },
            ],
        });
        groups.push({
            title: 'Account',
            items: [
                {
                    title: 'Profile',
                    href: '/settings/profile',
                    icon: LayoutGrid,
                },
                {
                    title: 'Contacts',
                    href: '/settings/contacts',
                    icon: Shield,
                },
            ],
        });
    }

    return groups;
};

const footerNavItems: NavItem[] = [
    // {
    //     title: 'Repository',
    //     href: 'https://github.com/laravel/react-starter-kit',
    //     icon: Folder,
    // },
    // {
    //     title: 'Documentation',
    //     href: 'https://laravel.com/docs/starter-kits#react',
    //     icon: BookOpen,
    // },
];

export function AppSidebar() {
    const page = usePage<SharedData>();
    const user = page.props.auth?.user;
    const navGroups = getNavGroups(user?.role as string | undefined);
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groups={navGroups} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
