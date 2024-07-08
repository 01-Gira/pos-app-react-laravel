import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, PageProps } from "@/types";
import { Head, router, useForm, usePage } from "@inertiajs/react";
import { Button, FloatingLabel, Label, Modal, TextInput } from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";
import { format } from "date-fns";
import DataTable, { TableColumn } from "react-data-table-component";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { classCustomSwal } from "@/utils/Utils";

export default function Index({
    title,
    auth,
    categories,
    pagination,
    search,
    flash,
}: PageProps) {
    // const { flash } = usePage().props;

    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [rowsPerPage, setRowsPerPage] = useState(pagination.per_page);
    const [searchQuery, setSearchQuery] = useState(search || "");

    const [openModal, setOpenModal] = useState(false);
    const [confirmingDataDeletion, setConfirmingDataDeletion] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(
        null
    );

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(
        null
    ); // State untuk data yang akan di-edit

    useEffect(() => {
        setCurrentPage(pagination.current_page);
    }, [pagination.current_page]);

    useEffect(() => {
        setSearchQuery(search || "");
    }, [search]);

    const onPageChange = (page: number) => {
        router.get(
            route("master.categories.index"),
            { search: searchQuery, page },
            { preserveState: true }
        );
        setCurrentPage(page);
    };

    const onRowsPerPageChange = (newRowsPerPage: number, page: number) => {
        setRowsPerPage(newRowsPerPage);
        router.get(
            route("master.categories.index"),
            { search: searchQuery, page, per_page: newRowsPerPage },
            { preserveState: true }
        );
        setCurrentPage(page);
    };

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        router.get(
            route("master.categories.index"),
            { search: event.target.value, page: 1 },
            { preserveState: true }
        );
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
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(
                    route("master.categories.destroy", {
                        id: categoryToDelete,
                    }),
                    {
                        onSuccess: () => reset(),
                    }
                );
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

    const confirmDataDeletion = (id: string) => {
        setCategoryToDelete(id);
        setConfirmingDataDeletion(true);
    };

    const closeModal = () => {
        setConfirmingDataDeletion(false);
        setCategoryToDelete(null);
        reset();
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
                    <Button className="w-40" onClick={() => setOpenModal(true)}>
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
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
