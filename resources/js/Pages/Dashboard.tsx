import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { PageProps } from '@/types';
import { HiX } from "react-icons/hi";
import { MdAnnouncement } from "react-icons/md";
import { Banner, Button, Datepicker, Pagination, Table } from 'flowbite-react';
import { useState } from 'react';

export default function Dashboard({ auth, flash}: PageProps) {
    const [currentPage, setCurrentPage] = useState(1);

    const onPageChange = (page: number) => setCurrentPage(page);
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
            flash={flash}
        >
            <Head title="Dashboard" />
                <div className='p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg'>

                </div>

        </AuthenticatedLayout>
    );
}
