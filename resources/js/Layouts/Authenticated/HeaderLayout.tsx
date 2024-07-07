import { User } from "@/types";
import { DarkThemeToggle } from "flowbite-react";
import {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useEffect,
    useState,
} from "react";
// import DropdownProfile from '@/Components/DropdownProfile';
import Dropdown from "@/Components/Dropdown";
import DataTable, { createTheme } from "react-data-table-component";

interface HeaderLayoutProps {
    user: User;
    sidebarOpen: boolean;
    setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export default function HeaderLayout({
    user,
    sidebarOpen,
    setSidebarOpen,
}: PropsWithChildren<HeaderLayoutProps>) {
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
                    {/* Header: Right side */}
                    <div className="flex items-center ml-auto space-x-3 z-40">
                        {/* <DarkThemeToggle /> */}
                        <hr className="w-px h-6 bg-slate-200 dark:bg-slate-700 border-none" />
                        <Dropdown>
                            <Dropdown.Trigger>
                                <span className="inline-flex rounded-md">
                                    <button
                                        type="button"
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 bg-white hover:text-gray-700 focus:outline-none transition ease-in-out duration-150"
                                    >
                                        {user.store.store_name}

                                        <svg
                                            className="ms-2 -me-0.5 h-4 w-4"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </span>
                            </Dropdown.Trigger>

                            <Dropdown.Content>
                                <Dropdown.Link
                                    href={route("setting.profile.edit")}
                                >
                                    Profile
                                </Dropdown.Link>
                                <Dropdown.Link
                                    href={route("logout")}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </Dropdown.Link>
                            </Dropdown.Content>
                        </Dropdown>
                    </div>
                </div>
            </div>
        </header>
    );
}
