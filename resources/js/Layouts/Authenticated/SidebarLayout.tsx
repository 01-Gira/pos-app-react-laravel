import { Sidebar } from "flowbite-react";
import { Dispatch, PropsWithChildren, SetStateAction } from "react";
import { HiChartPie, HiUser, HiShoppingBag } from "react-icons/hi";

interface SidebarLayoutProps {
  sidebarOpen: boolean;
  setSidebarOpen: Dispatch<SetStateAction<boolean>>;
}

export default function SidebarLayout({ sidebarOpen }: PropsWithChildren<SidebarLayoutProps>) {
  return (
    <div
        className={`fixed inset-y-0 left-0 z-40 w-64 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg`}
    >
      <Sidebar aria-label="Sidebar with logo branding example">
        <div className=""></div>
        <Sidebar.Items>
          <Sidebar.ItemGroup>
            <Sidebar.Item href="#" icon={HiChartPie}>
              Dashboard
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiUser}>
              Users
            </Sidebar.Item>
            <Sidebar.Item href="#" icon={HiShoppingBag}>
              Products
            </Sidebar.Item>
          </Sidebar.ItemGroup>
        </Sidebar.Items>
      </Sidebar>
    </div>
  );
}
