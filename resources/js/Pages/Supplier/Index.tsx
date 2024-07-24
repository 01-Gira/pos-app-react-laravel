import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Failure, PageProps, Product, Supplier } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import {
    Button,
    Datepicker,
    Dropdown,
    FileInput,
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
import axios from "axios";
// import swal from "sweetalert";

export default function Index({
    title,
    auth,
    suppliers,
    pagination,
    search,
    flash,
    start_date,
    end_date,
}: PageProps) {
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [searchQuery, setSearchQuery] = useState(search || "");
    const [rowsPerPage, setRowsPerPage] = useState(pagination.per_page);
    const [startDate, setStartDate] = useState(
        format(new Date(start_date), "yyyy-MM-dd")
    );
    const [endDate, setEndDate] = useState(
        format(new Date(end_date), "yyyy-MM-dd")
    );

    const [file, setFile] = useState<File | null>(null);


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

    const onStartDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = format(date, "yyyy-MM-dd");
            setStartDate(formattedDate);
            router.get(
                route("master.suppliers.index"),
                {
                    search: searchQuery,
                    page: 1,
                    start_date: formattedDate,
                    end_date: endDate,
                },
                {
                    preserveState: true,
                    onStart: () => setPending(true),
                    onFinish: () => setPending(false),
                }
            );
        }
    };

    const onEndDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = format(date, "yyyy-MM-dd");
            setEndDate(formattedDate);
            router.get(
                route("master.suppliers.index"),
                {
                    search: searchQuery,
                    page: 1,
                    start_date: startDate,
                    end_date: formattedDate,
                },
                {
                    preserveState: true,
                    onStart: () => setPending(true),
                    onFinish: () => setPending(false),
                }
            );
        }
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
            }
        });
    };

    const { delete: destroy, put, processing, errors, reset } = useForm();

    const columns: TableColumn<Supplier>[] = [
        {
            name: "Supplier Name",
            selector: (row: Supplier) => row.supplier_name,
            sortable: true,
        },
        {
            name: "Phone No",
            selector: (row: Supplier) => row.phone_no,
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPending(true);
        setFile(e.target.files?.[0] || null);

        setTimeout(() => {
            setPending(false);
        }, 500);
    };


    const handleUploadFile = () => {

        if (file) {
            Swal.fire({
                buttonsStyling: false,
                customClass: classCustomSwal,
                title: "Import Data",
                text: "Are you sure want to import data?",
                icon: "question",
                showCancelButton: true,
                showConfirmButton: true,
                confirmButtonText: "Yes",
                confirmButtonColor: "#3085d6",
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const res = await axios.post(
                            route("master.suppliers.import-data"),
                            formData,
                            {
                                headers: {
                                    "Content-Type": "multipart/form-data",
                                },
                            }
                        );
                        return res.data;
                    } catch (error) {
                        Swal.showValidationMessage(`
                            Request failed: ${error}
                          `);
                    }
                },
            }).then((result) => {
                if (result.isConfirmed && result.value) {
                    const { message, failures } = result.value;

                    let failureMessages = '';
                    if (failures && failures.length > 0) {
                        failureMessages = '<br><br><strong>Failed Imports:</strong><br>';
                        failures.forEach((failure: Failure) => {
                            failureMessages += `Row ${failure.row}: ${failure.errors.join(', ')}<br>`;
                        });
                    }

                    Swal.fire({
                        buttonsStyling: false,
                        customClass: classCustomSwal,
                        icon: failures && failures.length > 0 ? "warning" : "success",
                        title: message,
                        html: failures && failures.length > 0 ? failureMessages : '',
                        confirmButtonText: "OK",
                    }).then((ok) => {
                        if (ok.isConfirmed) {
                            setPending(true);
                            window.location.reload();
                        }
                    });
                }
            });
        }
    };

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
                <div className="grid grid-cols-2 gap-4 mt-5 mb-5">
                    <div>
                        <Label htmlFor="start_date" value="Start Date" />
                        <Datepicker
                            id="start_date"
                            onSelectedDateChanged={(date) =>
                                onStartDateChange(date)
                            }
                            value={startDate}
                        />
                    </div>
                    <div>
                        <Label htmlFor="end_date" value="End Date" />
                        <Datepicker
                            id="end_date"
                            onSelectedDateChanged={(date) =>
                                onEndDateChange(date)
                            }
                            value={endDate}
                        />
                    </div>
                </div>

                <div className="flex space-x-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="btn-add" value="Add Supplier" />
                        </div>
                        <Button
                            href={route("master.suppliers.create")}
                            className="w-40 hover:bg-cyan-800"
                        >
                            <HiOutlinePlus className="mr-2 h-5 w-5" />
                            Add Data
                        </Button>
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label
                                htmlFor="file-upload"
                                value="Import Data From Excel"
                            />
                        </div>
                        <FileInput
                            id="file-upload"
                            onChange={handleFileChange}
                        />
                    </div>
                    <div>
                        <div className="mb-2 block">
                            <Label
                                htmlFor="button-upload"
                                value="Action"
                            />
                        </div>
                        <Button
                            id="file-upload"
                            // onChange={handleUploadFile}
                            disabled={pending}
                            onClick={handleUploadFile}
                        >Import</Button>
                    </div>
                </div>

                <div className="flex justify-end">
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
                        progressPending={pending}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
