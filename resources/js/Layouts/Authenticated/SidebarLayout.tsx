import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // Menggunakan React Router

import { Sidebar } from "flowbite-react";
import {
    HiOutlineMinusSm,
    HiOutlinePlusSm,
    HiChartPie,
    HiInbox,
    HiShoppingBag,
    HiUser,
    HiArchive,
} from "react-icons/hi";
import { twMerge } from "tailwind-merge";
import { usePage } from "@inertiajs/react";

interface SidebarLayoutProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
}

export default function SidebarLayout({
    sidebarOpen,
    setSidebarOpen,
}: SidebarLayoutProps) {
    const { url } = usePage(); // Menggunakan usePage untuk mendapatkan informasi route saat ini
    const [transactionOpen, setTransactionOpen] = useState(false); // State untuk mengontrol collapse Transaction
    const [masterOpen, setMasterOpen] = useState(false); // State untuk mengontrol collapse Master

    return (
        <div
            className={`fixed inset-y-0 left-0 z-40 w-64 transform ${
                sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg`}
        >
            <Sidebar aria-label="Sidebar with logo branding example">
                <Sidebar.Logo
                    href="#"
                    img="/favicon.svg"
                    imgAlt="Flowbite logo"
                >
                    Flowbite
                </Sidebar.Logo>
                <Sidebar.Items className="py-12">
                    <Sidebar.ItemGroup>
                        <Sidebar.Item
                            icon={HiChartPie}
                            className={
                                route().current("dashboard")
                                    ? "bg-gray-300 text-black"
                                    : ""
                            }
                            href={route("dashboard")}
                        >
                            Dashboard
                        </Sidebar.Item>
                        <Sidebar.Collapse
                            icon={HiShoppingBag}
                            label="Transaction"
                            open={
                                route().current("transaction.*") ? true : false
                            }
                            renderChevronIcon={(theme, open) => (
                                <HiOutlinePlusSm
                                    aria-hidden
                                    className={twMerge(
                                        theme.label.icon.open[
                                            open ? "on" : "off"
                                        ]
                                    )}
                                />
                            )}
                        >
                            <Sidebar.Item
                                className={
                                    route().current("transaction.cashier.*")
                                        ? "bg-gray-300 text-black"
                                        : ""
                                }
                                href={route("transaction.cashier.index")}
                            >
                                Cashier
                            </Sidebar.Item>
                            <Sidebar.Item href="/purchase">
                                Purchase Product
                            </Sidebar.Item>
                        </Sidebar.Collapse>
                        <Sidebar.Collapse
                            icon={HiInbox}
                            label="Master"
                            open={route().current("master.*") ? true : false}
                            renderChevronIcon={(theme, open) => (
                                <HiOutlinePlusSm
                                    aria-hidden
                                    className={twMerge(
                                        theme.label.icon.open[
                                            open ? "on" : "off"
                                        ]
                                    )}
                                />
                            )}
                        >
                            <Sidebar.Item
                                className={
                                    route().current("master.products.*")
                                        ? "bg-gray-300 text-black"
                                        : ""
                                }
                                href={route("master.products.index")}
                            >
                                Products
                            </Sidebar.Item>
                            <Sidebar.Item
                                className={
                                    route().current("master.discounts.*")
                                        ? "bg-gray-300 text-black"
                                        : ""
                                }
                                href={route("master.discounts.index")}
                            >
                                Discounts
                            </Sidebar.Item>
                            <Sidebar.Item
                                className={
                                    route().current("master.categories.*")
                                        ? "bg-gray-300 text-black"
                                        : ""
                                }
                                href={route("master.categories.index")}
                            >
                                Categories
                            </Sidebar.Item>
                            <Sidebar.Item
                                className={
                                    route().current("master.suppliers.*")
                                        ? "bg-gray-300 text-black"
                                        : ""
                                }
                                href={route("master.suppliers.index")}
                            >
                                Supplier
                            </Sidebar.Item>
                        </Sidebar.Collapse>
                        <Sidebar.Collapse
                            icon={HiArchive}
                            label="Setting"
                            open={route().current("setting.*") ? true : false}
                            renderChevronIcon={(theme, open) => (
                                <HiOutlinePlusSm
                                    aria-hidden
                                    className={twMerge(
                                        theme.label.icon.open[
                                            open ? "on" : "off"
                                        ]
                                    )}
                                />
                            )}
                        >
                            <Sidebar.Item
                                className={
                                    route().current("setting.profile.*")
                                        ? "bg-gray-300 text-black"
                                        : ""
                                }
                                href={route("setting.profile.edit")}
                                icon={HiUser}
                            >
                                Profile
                            </Sidebar.Item>
                        </Sidebar.Collapse>
                    </Sidebar.ItemGroup>
                </Sidebar.Items>
            </Sidebar>
        </div>
    );
}
