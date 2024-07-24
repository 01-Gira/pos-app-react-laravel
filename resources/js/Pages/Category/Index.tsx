import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, Failure, PageProps } from "@/types";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Button, Datepicker, FileInput, FloatingLabel, Label, Modal, Select, TextInput } from "flowbite-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";
import { format } from "date-fns";
import DataTable, { TableColumn } from "react-data-table-component";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { classCustomSwal } from "@/utils/Utils";
import axios from "axios";

export default function Index({
    title,
    auth,
    categories,
    pagination,
    search,
    flash,
    start_date,
    end_date
}: PageProps) {
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [searchQuery, setSearchQuery] = useState(search || "");
    const [rowsPerPage, setRowsPerPage] = useState(pagination.per_page);
    const [startDate, setStartDate] = useState(format(new Date(start_date), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(end_date), "yyyy-MM-dd"));

    const [openModal, setOpenModal] = useState(false);

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
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
            route("master.categories.index"),
            { search: searchQuery, page, start_date: startDate, end_date: endDate },
            {
                preserveState: true,
                onStart:() => setPending(true),
                onFinish:() => setPending(false)
            }
        );
        setCurrentPage(page);
    };

    const onRowsPerPageChange = (newRowsPerPage: number, page: number) => {
        setRowsPerPage(newRowsPerPage);
        router.get(
            route("master.categories.index"),
            { search: searchQuery, page, per_page: newRowsPerPage, start_date: startDate, end_date: endDate },
            {
                preserveState: true,
                onStart:() => setPending(true),
                onFinish:() => setPending(false)
            }
        );
        setCurrentPage(page);
    };

    const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        router.get(
            route("master.categories.index"),
            { search: event.target.value, page: 1, start_date: startDate, end_date: endDate },
            {
                preserveState: true,
                onStart:() => setPending(true),
                onFinish:() => setPending(false)
            }
        );
    };

    const onStartDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = format(date, "yyyy-MM-dd");
            setStartDate(formattedDate);
            router.get(
                route("master.categories.index"),
                { search: searchQuery, page: 1, start_date: formattedDate, end_date: endDate },
                {
                    preserveState: true,
                    onStart:() => setPending(true),
                    onFinish:() => setPending(false)
                }
            );
        }
    };

    const onEndDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = format(date, "yyyy-MM-dd");
            setEndDate(formattedDate);
            router.get(
                route("master.categories.index"),
                { search: searchQuery, page: 1, start_date: startDate, end_date: formattedDate },
                {
                    preserveState: true,
                    onStart:() => setPending(true),
                    onFinish:() => setPending(false)
                }
            );
        }
    };

    const categoryInput = useRef<HTMLInputElement>(null);

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

    const storeData = async () => {
        post(route("master.categories.store"), {
            onSuccess: () => setOpenModal(false),
            onError: () => categoryInput.current?.focus(),
            onFinish: () => reset(),
        });
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
            showLoaderOnConfirm: true,
            preConfirm : async () => {
                try {
                    await destroy(
                        route("master.categories.destroy", {
                            id: id,
                        }),
                        {
                            onSuccess: () => reset(),
                        }
                    );
                } catch (error) {
                    Swal.showValidationMessage(`
                        Request failed: ${error}
                      `);

                }
            }
        }).then((result) => {
            if (result.isConfirmed) {

            }
        });
    };


    const updateData = async () => {
        if (editingCategory) {
            put(route("master.categories.update", { id: editingCategory.id }), {
                onSuccess: () => {
                    setEditModalOpen(false);
                    reset();
                },
                onError: () => categoryInput.current?.focus(),
            });
        }
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setEditModalOpen(true);
        setData("category_name", category.category_name); // Set nilai awal form sesuai data yang akan di-edit
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditingCategory(null);
        reset();
    };

    const columns: TableColumn<Category>[] = [
        {
            name: "Category ID",
            selector: (row: Category) => row.id,
            sortable: true,
            width: '30%'
        },
        {
            name: "Category Name",
            selector: (row: Category) => row.category_name,
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: Category) =>
                format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
        {
            name: "Updated At",
            selector: (row: Category) =>
                format(new Date(row.updated_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
        {
            name: "Action",
            cell: (row: Category) => (
                <div className="flex space-x-4">
                    <button
                        onClick={() => openEditModal(row)}
                        className="font-medium text-yellow-300 hover:underline dark:text-cyan-500"
                    >
                        Edit
                    </button>
                    <button
                        onClick={() => deleteData(row.id)}
                        className="font-medium text-red-500 hover:underline dark:text-red-300"
                        disabled={processing}
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

    const handleFileUpload = () => {
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
                preConfirm : async () => {
                    try {
                        const formData = new FormData();
                        formData.append('file', file);
                        const res = await axios.post(route('master.categories.import-data'), formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        })

                        return res.data;
                    } catch (error) {
                        Swal.showValidationMessage(`
                            Request failed: ${error}
                          `);

                    }
                }
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
                <h1 className="dark:text-white text-lg">{title}</h1>
                <div className="grid grid-cols-2 gap-4 mt-5 mb-5">
                    <div>
                        <Label
                            htmlFor="start_date"
                            value="Start Date"
                        />
                        <Datepicker
                            id="start_date"
                            onSelectedDateChanged={date => onStartDateChange(date)}
                            value={startDate}
                        />
                    </div>
                    <div>
                        <Label htmlFor="end_date" value="End Date" />
                        <Datepicker
                            id="end_date"
                            onSelectedDateChanged={date => onEndDateChange(date)}
                            value={endDate}
                        />
                    </div>
                </div>

                <div className="flex space-x-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="btn-add" value="Add Category" />
                        </div>
                            <Button className="w-40" onClick={() => setOpenModal(true)}>
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
                            onClick={handleFileUpload}
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
                <Modal show={openModal} onClose={() => setOpenModal(false)}>
                    <Modal.Header>Add Data</Modal.Header>
                    <Modal.Body>
                        <div className="space-y-3">
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="category_name"
                                    value="Category Name"
                                />
                                <TextInput
                                    id="category_name"
                                    ref={categoryInput}
                                    placeholder="Category"
                                    value={data.category_name}
                                    onChange={(e) =>
                                        setData("category_name", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.category_name}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        {/* <Button type="submit" onClick={store} disabled={false}>Save</Button> */}

                        <Button
                            color="success"
                            onClick={storeData}
                            disabled={processing}
                        >
                            {processing ? <ClipLoader size={20} /> : "Save"}
                        </Button>
                        <Button
                            color="gray"
                            onClick={() => setOpenModal(false)}
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal show={editModalOpen} onClose={closeEditModal}>
                    <Modal.Header>Edit Data</Modal.Header>
                    <Modal.Body>
                        <div className="space-y-3">
                            <div className="mb-2 block">
                                <Label
                                    htmlFor="edit_category_name"
                                    value="Category Name"
                                />
                                <TextInput
                                    id="edit_category_name"
                                    placeholder="Category"
                                    value={data.category_name}
                                    onChange={(e) =>
                                        setData("category_name", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.category_name}
                                    className="mt-2"
                                />
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            color="success"
                            onClick={updateData}
                            disabled={processing}
                        >
                            {processing ? <ClipLoader size={20} /> : "Save"}
                        </Button>
                        <Button color="gray" onClick={closeEditModal}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <div className="overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={categories}
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
