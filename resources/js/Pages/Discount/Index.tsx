import InputError from "@/Components/InputError";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Discount, PageProps, Product } from "@/types";
import { classCustomSwal } from "@/utils/Utils";
import { Head, router, useForm } from "@inertiajs/react";
import axios from "axios";
import { format } from "date-fns";
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
import {
    FormEventHandler,
    InputHTMLAttributes,
    useEffect,
    useRef,
    useState,
} from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { HiOutlinePlus } from "react-icons/hi";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";

export default function Index({
    title,
    auth,
    discounts,
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
    const [addModal, setAddModal] = useState(false);
    const [editModal, setEditModal] = useState(false);

    const inputDiscount = useRef<HTMLInputElement>(null);

    const [swalCustomClass, setSwalCustomClass] = useState({
        popup: "!relative !transform !overflow-hidden !rounded-lg !bg-white !text-left !shadow-xl !transition-all sm:!my-8 sm:!w-full sm:!max-w-lg !p-0 !grid-cols-none",
        icon: "!m-0 !mx-auto !flex !h-12 !w-12 !flex-shrink-0 !items-center !justify-center !rounded-full !border-0 !bg-red-100 sm:!h-10 sm:!w-10 !mt-5 sm!mt-6 sm:!ml-6 !col-start-1 !col-end-3 sm:!col-end-2",
        title: "!p-0 !pt-3 !text-center sm:!text-left !text-base !font-semibold !leading-6 !text-gray-900 !pl-4 !pr-4 sm:!pr-6 sm:!pl-0 sm:!pt-6 sm:!ml-4 !col-start-1 sm:!col-start-2 !col-end-3",
        htmlContainer:
            "!mt-2 sm:!mt-0 !m-0 !text-center sm:!text-left !text-sm !text-gray-500 !pl-4 sm:!pl-0 !pr-4 !pb-4 sm:!pr-6 sm:!pb-4 sm:!ml-4 !col-start-1 sm:!col-start-2 !col-end-3",
        actions:
            "!bg-gray-50 !px-4 !py-3 sm:!flex sm:!flex-row-reverse sm:!px-6 !w-full !justify-start !mt-0 !col-start-1 !col-end-3",
        confirmButton:
            "inline-flex w-full justify-center rounded-md bg-cyan-700 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-cyan-800 sm:ml-3 sm:w-auto",
        cancelButton:
            "mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto",
    });

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

    const onStartDateChange = (date: Date | null) => {
        if (date) {
            const formattedDate = format(date, "yyyy-MM-dd");
            setStartDate(formattedDate);
            router.get(
                route("master.products.index"),
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
                route("master.products.index"),
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
        destroy(route("master.discounts.destroy", { id }), {
            onSuccess: () => {
                reset();
            },
        });
    };

    const {
        data,
        setData,
        delete: destroy,
        put,
        post,
        processing,
        errors,
        reset,
    } = useForm({
        id: "",
        discount: 0,
        product_id: "",
        barcode: "",
        product_name: "",
    });

    const confirmDataDeletion = (id: string) => {
        Swal.fire({
            buttonsStyling: false,
            customClass: swalCustomClass,
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            title: "Delete",
            text: "Are you sure want to delete data?",
            icon: "warning",
        }).then((willDelete) => {
            if (willDelete.isConfirmed) {
                deleteData(id);
            }
        });
    };

    const storeData: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("master.discounts.index"), {
            onFinish: () => setAddModal(false),
            onError: () => inputDiscount.current?.focus(),
        });
    };

    const editData = async (id: string, discount: number) => {
        setData((previousData) => ({
            ...previousData,
            id: id,
            discount: discount,
        }));
        setEditModal(true);
    };

    const updateDiscount = async () => {
        await put(route("master.discounts.update", data.id), {
            onSuccess: () => {
                setEditModal(false);
                reset();
            },
        });
    };

    useEffect(() => {
        if (data.barcode.length > 0) {
            getDataProduct(data.barcode);
        }
    }, [data.barcode]);

    const getDataProduct = async (barcode: string) => {
        const res = await axios.get(
            route("master.products.get-data-barcode", barcode)
        );
        const product = res.data.product;

        if (product) {
            setData((prevData) => ({
                ...prevData,
                product_id: product.id,
                product_name: product.product_name,
            }));
        }
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
                        onClick={() => editData(row.id, row.discount)}
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
                            <Label htmlFor="btn-add" value="Add Discount" />
                        </div>
                        <Button
                            onClick={() => setAddModal(true)}
                            className="w-40 hover:bg-cyan-800"
                        >
                            <HiOutlinePlus className="mr-2 h-5 w-5" />
                            Add Data
                        </Button>
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

            <Modal size="xl" show={addModal} onClose={() => setAddModal(false)}>
                <Modal.Header>Add Discount</Modal.Header>
                <form onSubmit={storeData}>
                    <Modal.Body>
                        <div className="grid grid-cols-1 gap-4 mb-5">
                            <Label htmlFor="barcode" value="Barcode" />
                            <TextInput
                                id="barcode"
                                type="text"
                                value={data.barcode}
                                onChange={(e) =>
                                    setData("barcode", e.target.value)
                                }
                            />
                            <InputError
                                message={errors.barcode}
                                className="mt-2"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 mb-5">
                            <Label
                                htmlFor="product_name"
                                value="Product Name"
                            />
                            <TextInput
                                id="product_name"
                                readOnly
                                type="text"
                                value={data.product_name}
                            />
                            <InputError
                                message={errors.product_name}
                                className="mt-2"
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 mb-5">
                            <Label
                                htmlFor="discount"
                                value="Discount Percentage"
                            />
                            <TextInput
                                id="discount"
                                type="number"
                                value={data.discount}
                                ref={inputDiscount}
                                onChange={(e) =>
                                    setData(
                                        "discount",
                                        parseInt(e.target.value)
                                    )
                                }
                                min={0}
                                max={100}
                            />
                            <InputError
                                message={errors.discount}
                                className="mt-2"
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button type="submit" disabled={processing}>
                            {processing ? (
                                <ClipLoader size="20" />
                            ) : (
                                "Apply Discount"
                            )}
                        </Button>
                        <Button color="gray" onClick={() => setAddModal(false)}>
                            Cancel
                        </Button>
                    </Modal.Footer>
                </form>
            </Modal>

            <Modal show={editModal} onClose={() => setEditModal(false)}>
                <Modal.Header>Edit Discount</Modal.Header>
                <Modal.Body>
                    <div className="space-y-6">
                        <Label htmlFor="discount" value="Discount Percentage" />
                        <TextInput
                            id="discount"
                            type="number"
                            value={data.discount}
                            onChange={(e) =>
                                setData("discount", parseInt(e.target.value))
                            }
                            min={0}
                            max={100}
                        />
                        <InputError
                            message={errors.discount}
                            className="mt-2"
                        />
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={updateDiscount} disabled={processing}>
                        {processing ? (
                            <ClipLoader size="20" />
                        ) : (
                            "Apply Discount"
                        )}
                    </Button>
                    <Button color="gray" onClick={() => setEditModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </AuthenticatedLayout>
    );
}
