import { useState, PropsWithChildren, ReactNode } from "react";

import { router } from "@inertiajs/react";
import { Flash, User } from "@/types";
import { Alert, Toast } from "flowbite-react";
import SidebarLayout from "./Authenticated/SidebarLayout";
import HeaderLayout from "./Authenticated/HeaderLayout";

export default function AuthenticatedLayout({
    user,
    header,
    children,
    flash,
}: PropsWithChildren<{ user: User; header?: ReactNode; flash: Flash }>) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarLayout
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />
            <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
                <HeaderLayout
                    user={user}
                    sidebarOpen={sidebarOpen}
                    setSidebarOpen={setSidebarOpen}
                />
                <main
                    className={`flex-1 transition-all duration-300 dark:bg-[#182235] ${
                        sidebarOpen ? "ml-64" : "ml-0"
                    }`}
                >
                    <div className="py-12 mx-auto sm:px-6 lg:px-8">
                        <Toast>
                            <div className="text-sm font-normal">
                                Conversation archived.
                            </div>
                            <div className="ml-auto flex items-center space-x-2">
                                <a
                                    href="#"
                                    className="rounded-lg p-1.5 text-sm font-medium text-cyan-600 hover:bg-cyan-100 dark:text-cyan-500 dark:hover:bg-gray-700"
                                >
                                    Undo
                                </a>
                                <Toast.Toggle />
                            </div>
                        </Toast>
                        {flash.message && (
                            <Alert
                                onDismiss={() => router.reload()}
                                className="mb-3"
                                color={
                                    flash.type_message === "success"
                                        ? "green"
                                        : "red"
                                }
                            >
                                {flash.message}
                            </Alert>
                        )}
                        <div></div>
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
