import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Notification, PageProps } from "@/types";
import { Head,router,useForm, usePage } from "@inertiajs/react";
import { Label, Select } from "flowbite-react";
import { useEffect } from "react";


export default function Index({
    title,
    auth,
    flash,
    pagination
}: PageProps) {
    const { notifications, ...pageProps } = usePage().props as { notifications: Notification[], errors: any };

    const {
        data,
        setData,
        post,
        delete: destroy,
        put,
        processing,
        errors,
        reset,
    } = useForm({
        category_name: "",
    });

    const markNotificationAsRead = async(id : string) => {
        router.put(route('notifications.update', { notification: id }));
    }

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {title}
                </h2>
            }
            flash={flash}
        >
            <Head title={title} />
            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
                <div className="flex justify-between items-center">
                    <h1 className="dark:text-white text-lg">{title}</h1>
                    <button className="text-sm text-blue-500 hover:underline">Read All</button>
                </div>

                <div className="overflow-y-auto mt-5">
                    {notifications.slice(0, 5).map((notification, index) => (
                      <div key={index} className={`flex items-center py-2 ${notification.read_at ? 'text-gray-500 dark:text-gray-400' : 'text-blue-500 dark:text-white'}`}>
                            <div className="flex-1 truncate pr-2">
                                {notification.data.message}
                            </div>
                            {
                                notification.data.fileName ? (
                                    <a href={route('download.file', { id: notification.id, fileName: notification.data.fileName })} className="text-blue-500 hover:underline ml-2">Download</a>
                                ) : (
                                    <sup className="text-blue-500 ml-2 text-xs hover:underline" onClick={() => markNotificationAsRead(notification.id)}>Mark as Read</sup>
                                )
                            }
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex justify-center">
                    {/* <Pagination currentPage={pagination.current_page} totalPages={pagination.total_pages} onPageChange={onPageChange} /> */}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
