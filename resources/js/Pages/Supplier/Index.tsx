import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Product, Supplier } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import {
    Button,
    Dropdown,
    FloatingLabel,
    Label,
    Modal,
    Pagination,
    Table,
    TextInput,
} from "flowbite-react";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { HiOutlinePlus } from "react-icons/hi";
import { format } from "date-fns";
import Swal from "sweetalert2";
import { classCustomSwal } from "@/utils/Utils";
// import swal from "sweetalert";

export default function Index({
    title,
    auth,
    suppliers,
    pagination,
    search,
    flash,
}: PageProps) {
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [searchQuery, setSearchQuery] = useState(search || "");
    const [rowsPerPage, setRowsPerPage] = useState(pagination.per_page);

    useEffect(() => {
        setCurrentPage(pagination.current_page);
    }, [pagination.current_page]);

    useEffect(() => {
        setSearchQuery(search || "");
    }, [search]);

    const onPageChange = (page: number) => {
        router.get(
            route("master.suppliers.index"),
            { search: searchQuery, page },
            { preserveState: true }
        );
        setCurrentPage(page);
    };

    const onRowsPerPageChange = (newRowsPerPage: number, page: number) => {
        setRowsPerPage(newRowsPerPage);
        router.get(
            route("master.suppliers.index"),
            { search: searchQuery, page, per_page: newRowsPerPage },
            { preserveState: true }
        );
        setCurrentPage(page);
    };

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        router.get(
            route("master.suppliers.index"),
            { search: event.target.value, page: 1 },
            { preserveState: true }
        );
    };

    const deleteData = async (id: string) => {
        Swal.fire({
            buttonsStyling: false,
            customClass: classCustomSwal,
            title: "Delete",
            text: "Are you sure want to delete data?",
            icon: "warning",
            showCancelButton: true,
            showConfirmButton: true,
            confirmButtonText: "Yes, delete it!",
            confirmButtonColor: "#3085d6",
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route("master.suppliers.destroy", { id }), {
                    onSuccess: () => reset(),
                });
            } else {
                Swal.fire({
                    buttonsStyling: false,
                    customClass: classCustomSwal,
                    icon: "info",
                    title: "info",
                    text: "Your data is safe!",
                });
            }
        });
    };

    const { delete: destroy, put, processing, errors, reset } = useForm();

    const columns: TableColumn<Supplier>[] = [
        {
            name: "Uniq Code",
            selector: (row: Supplier) => row.uniq_code,
            sortable: true,
        },
        {
            name: "Supplier Name",
            selector: (row: Supplier) => row.supplier_name,
            sortable: true,
        },
        {
            name: "Address",
            selector: (row: Supplier) => row.address,
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: Supplier) =>
                format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
        {
            name: "Updated At",
            selector: (row: Supplier) =>
                format(new Date(row.updated_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: Supplier) => (
                <div className="flex space-x-4">
                    <a
                        href={route("master.suppliers.edit", row.id)}
                        className="font-medium text-yellow-300 hover:underline dark:text-cyan-500"
                    >
                        Edit
                    </a>
                    <button
                        onClick={() => deleteData(row.id)}
                        className="font-medium text-red-500 hover:underline dark:text-red-300"
                    >
                        Delete
                    </button>
                </div>
            ),
        },
    ];

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
                <h1 className="dark:text-white text-lg">Master {title}</h1>

                <div className="flex justify-between items-center space-x-2">
                    <Button
                        href={route("master.suppliers.create")}
                        className="w-40 hover:bg-cyan-800"
                    >
                        <HiOutlinePlus className="mr-2 h-5 w-5" />
                        Add Data
                    </Button>
                    <FloatingLabel
                        variant="outlined"
                        value={searchQuery}
                        onChange={onSearchChange}
                        label="search..."
                    />
                </div>

                <div className="overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={suppliers}
                        pagination
                        paginationServer
                        paginationPerPage={5}
                        paginationTotalRows={pagination.total_items}
                        paginationDefaultPage={currentPage}
                        paginationRowsPerPageOptions={[5, 10, 25, 50]}
                        onChangePage={onPageChange}
                        onChangeRowsPerPage={onRowsPerPageChange}
                        highlightOnHover
                        persistTableHead
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
