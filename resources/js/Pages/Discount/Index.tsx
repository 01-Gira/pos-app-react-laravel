import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Discount, PageProps, Product } from "@/types";
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
import swal from "sweetalert";

export default function Index({
    title,
    auth,
    discounts,
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
            route("master.discounts.index"),
            { search: searchQuery, page },
            { preserveState: true }
        );
        setCurrentPage(page);
    };

    const onRowsPerPageChange = (newRowsPerPage: number, page: number) => {
        setRowsPerPage(newRowsPerPage);
        router.get(
            route("master.discounts.index"),
            { search: searchQuery, page, per_page: newRowsPerPage },
            { preserveState: true }
        );
        setCurrentPage(page);
    };

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        router.get(
            route("master.discounts.index"),
            { search: event.target.value, page: 1 },
            { preserveState: true }
        );
    };

    const deleteData = async (id: string) => {
        destroy(route("master.discounts.destroy", { id }), {
            onSuccess: () => {
                swal("Poof! Your data has been deleted!", {
                    icon: "success",
                });
                reset();
            },
        });
    };

    const { delete: destroy, put, processing, errors, reset } = useForm();

    const confirmDataDeletion = (id: string) => {
        swal({
            title: "Delete",
            text: "Are you sure want to delete data?",
            icon: "warning",
            buttons: {
                cancel: true,
                confirm: {
                    text: "Yes",
                    value: true,
                    className: "bg-red-500",
                    closeModal: true,
                },
            },
        }).then((willDelete) => {
            if (willDelete) {
                deleteData(id);
            } else {
                swal("Your data is safe!");
            }
        });
    };

    const columns: TableColumn<Discount>[] = [
        {
            name: "Product Name",
            selector: (row: Discount) => row.product?.product_name || "",
            sortable: true,
        },
        {
            name: "Discount",
            selector: (row: Discount) => row.discount,
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: Discount) =>
                format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
        {
            name: "Updated At",
            selector: (row: Discount) =>
                format(new Date(row.updated_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: Discount) => (
                <div className="flex space-x-4">
                    <a
                        href={route("master.products.edit", row.id)}
                        className="font-medium text-yellow-300 hover:underline dark:text-cyan-500"
                    >
                        Edit
                    </a>

                    <button
                        onClick={() => confirmDataDeletion(row.id)}
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
                <h1 className="dark:text-white text-lg">{title}</h1>

                <div className="flex justify-between items-center space-x-2">
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
                        data={discounts}
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
