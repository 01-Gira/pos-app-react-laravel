import { useState, PropsWithChildren, ReactNode } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link } from '@inertiajs/react';
import { User } from '@/types';
import { DarkThemeToggle } from 'flowbite-react';
import SidebarLayout from './Authenticated/SidebarLayout';
import HeaderLayout from './Authenticated/HeaderLayout';

export default function Authenticated({ user, header, children }: PropsWithChildren<{ user: User, header?: ReactNode }>) {
    const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <HeaderLayout user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main>
                    {children}
                </main>

            </div>
        </div>
    );
}
