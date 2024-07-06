import { useState, PropsWithChildren, ReactNode } from 'react';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, router } from '@inertiajs/react';
import { Flash, User } from '@/types';
import { Alert } from 'flowbite-react';
import SidebarLayout from './Authenticated/SidebarLayout';
import HeaderLayout from './Authenticated/HeaderLayout';
import { createTheme } from 'react-data-table-component';
import { ToastContainer } from 'react-toastify';

export default function AuthenticatedLayout({ user, header, children, flash }: PropsWithChildren<{ user: User, header?: ReactNode, flash: Flash }>) {
    const [sidebarOpen, setSidebarOpen] = useState(true);


    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarLayout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <HeaderLayout user={user} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
                <main className={`flex-1 transition-all duration-300 dark:bg-[#182235] ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>

                    <div className="py-12 mx-auto sm:px-6 lg:px-8">
                        {flash.message && (
                            <Alert onDismiss={() => router.reload()} className='mb-3' color={flash.type_message === 'success' ? 'green' : 'red'}>
                                {flash.message}
                            </Alert>
                        )}
                        <div>

                        </div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
