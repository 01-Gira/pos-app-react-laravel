import { Notification, User } from "@/types";
import { router, usePage } from "@inertiajs/react";
import { Button, DarkThemeToggle, Dropdown } from "flowbite-react";
import Echo from 'laravel-echo';

import {
    Dispatch,
    FormEventHandler,
    PropsWithChildren,
    SetStateAction,
    useEffect,
    useState,
} from "react";
import { HiBell} from "react-icons/hi";

interface HeaderLayoutProps {
    user: User;
    sidebarOpen: boolean;
    setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

declare global {
    interface Window {
        Echo: any;
    }
}

const handleLogout : FormEventHandler = async(e) => {
    e.preventDefault();
    await router.post(route('logout'));
}


export default function HeaderLayout({
    user,
    sidebarOpen,
    setSidebarOpen,
}: PropsWithChildren<HeaderLayoutProps>) {
    const { notifications, ...pageProps } = usePage().props as { notifications: Notification[], errors: any };

    const unreadNotifications = notifications.filter(notification => !notification.read_at);

    const truncateText = (text: string, maxLength: number) => {
        if (text.length > maxLength) {
            return text.slice(0, maxLength) + '...';
        }
        return text;
    };

    const markNotificationAsRead = async(id : string) => {
        router.put(route('notifications.update', { notification: id }));
    }


    return (
        <header
            className={`sticky top-0 bg-white dark:bg-[#182235] border-b border-slate-200 dark:border-slate-700 z-30 w-full transition-all duration-300 ${
                sidebarOpen ? "pl-64" : "pl-0"
            }`}
        >
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 -mb-px">
                    <div className="flex">
                        {/* Hamburger button */}
                        <button
                            className="text-slate-500 hover:text-slate-600"
                            aria-controls="sidebar"
                            aria-expanded={sidebarOpen ? "true" : "false"}
                            onClick={(e) => {
                                e.stopPropagation();
                                setSidebarOpen(!sidebarOpen);
                            }}
                        >
                            <span className="sr-only">Open sidebar</span>
                            <svg
                                className="w-6 h-6 fill-current"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect x="4" y="5" width="16" height="2" />
                                <rect x="4" y="11" width="16" height="2" />
                                <rect x="4" y="17" width="16" height="2" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex items-center ml-auto space-x-3 z-40">
                        <DarkThemeToggle />
                        <hr className="w-px h-6 bg-slate-200 dark:bg-slate-700 border-none" />
                        <Dropdown
                            label=""
                            dismissOnClick={false}
                            renderTrigger={() => (
                                <span className="flex items-center">
                                    <HiBell/><sup className="text-xs text-gray-400">{unreadNotifications.length}</sup>

                                </span>
                            )}
                        >
                            <Dropdown.Item className="text-xs text-blue-500" href={route('notifications.read-all')}>Read all notifictions</Dropdown.Item>

                            {unreadNotifications.slice(0, 5).map((notification, index) => (
                                <Dropdown.Item key={index}>
                                    {truncateText(notification.data.message, 25)}
                                    {
                                        notification.data.fileName ? (
                                            <a href={route('download.file', { id: notification.id, fileName: notification.data.fileName })} className="text-blue-500 hover:underline ml-2">Download</a>
                                        ) : (
                                            <sup className="text-blue-500 ml-2 text-xs hover:underline" onClick={() => markNotificationAsRead(notification.id)}>Mark as Read</sup>
                                        )
                                    }

                                </Dropdown.Item>

                            ))}
                            {notifications.length > 5 && (
                                <Dropdown.Item>
                                    <a href="#" className="text-blue-500">View all notifications</a>
                                </Dropdown.Item>
                            )}
                        </Dropdown>

                        <hr className="w-px h-6 bg-slate-200 dark:bg-slate-700 border-none" />
                        <Dropdown label="" dismissOnClick={false} renderTrigger={() => <span>{user.store.store_name}</span>}>
                            <Dropdown.Item href={route("setting.profile.edit")}>Profile</Dropdown.Item>
                            <form onSubmit={handleLogout}>
                                <Dropdown.Item type="submit">Sign out</Dropdown.Item>

                            </form>
                        </Dropdown>

                    </div>
                </div>
            </div>
        </header>
    );
}
