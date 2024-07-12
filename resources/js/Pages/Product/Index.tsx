import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Product } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button, Datepicker, FileInput, FloatingLabel, Label, Modal, Select, TextInput } from "flowbite-react";
import { ChangeEvent, useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";
import { format } from "date-fns";
import { ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import { classCustomSwal, exportExcel, exportPDF } from "@/utils/Utils";
import axios from "axios";
import Barcode from "react-barcode";

export default function Index({
    title,
    auth,
    products,
    pagination,
    search,
    flash,
    start_date, end_date, status, categories
}: PageProps) {
    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [searchQuery, setSearchQuery] = useState(search || "");
    const [rowsPerPage, setRowsPerPage] = useState(pagination.per_page);
    const [startDate, setStartDate] = useState(format(new Date(start_date), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(end_date), "yyyy-MM-dd"));
    const [statusFilter, setStatusFilter] = useState(status || "");

    const onPageChange = (page: number) => {
        router.get(
            route("master.products.index"),
            { search: searchQuery, page, start_date: startDate, end_date: endDate, status: statusFilter },
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
            route("master.products.index"),
            { search: searchQuery, page, per_page: newRowsPerPage, start_date: startDate, end_date: endDate, status: statusFilter },
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
            route("master.products.index"),
            { search: event.target.value, page: 1, start_date: startDate, end_date: endDate, status: statusFilter },
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
                route("master.products.index"),
                { search: searchQuery, page: 1, start_date: formattedDate, end_date: endDate, status: statusFilter },
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
                route("master.products.index"),
                { search: searchQuery, page: 1, start_date: startDate, end_date: formattedDate, status: statusFilter },
                {
                    preserveState: true,
                    onStart:() => setPending(true),
                    onFinish:() => setPending(false)
                }
            );
        }
    };

    const onStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(event.target.value);
        router.get(
            route("master.products.index"),
            { search: searchQuery, page: 1, start_date: startDate, end_date: endDate, status: event.target.value },
              {
                preserveState: true,
                onStart:() => setPending(true),
                onFinish:() => setPending(false)
            }
        );
    };


    const [productId, setProductId] = useState<string | null>(null);

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
                        route("master.products.destroy", {
                            product: id,
                        }),
                        {
                            onSuccess: () => {
                                reset();
                            },
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
        product_id: "",
        discount: 0,
        file: null as File | null,
    });

    const [openModalDiscount, setModalDiscount] = useState(false);
    const [openModalDelete, setModalDelete] = useState(false);

    const addDiscountToProduct = (id: string, discount: number) => {
        setProductId(id);
        setData("discount", discount);
        setModalDiscount(true);
    };

    const applyDiscount = async() => {
        if (productId) {
            await post(route("master.products.add-discount", productId), {
                onFinish: () => {
                    setModalDiscount(false);
                },
            });
        }
    };

    const printBarcode = async (id: string) => {
        const url = route("master.products.print-barcode", id);

        await window.open(url, "_blank");
    }

    const columns: TableColumn<Product>[] = [
        {
            name: "Barcode",
            cell: (row: Product) => <Barcode value={row.barcode} />,
            sortable: true,
        },
        {
            name: "Product Name",
            selector: (row: Product) => row.product_name,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row: Product) => row.category?.category_name || "",
            sortable: true,
        },
        {
            name: "Stock",
            selector: (row: Product) => row.stock,
            sortable: true,
        },
        {
            name: "Discount",
            selector: (row: Product) => row.discount?.discount || 0,
            sortable: true,
        },
        {
            name: "Price",
            selector: (row: Product) => row.price,
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: Product) =>
                format(new Date(row.created_at), "yyyy-MM-dd"),
            sortable: true,
        },
        {
            name: "Action",
            width: '30%',
            center: true,
            cell: (row: Product) => (
                <div className="flex space-x-4">
                    <a
                        href={route("master.products.edit", row.id)}
                        className="font-medium text-yellow-300 hover:underline dark:text-cyan-500"
                    >
                        Edit
                    </a>
                    <button
                        onClick={() => {
                            addDiscountToProduct(
                                row.id,
                                row.discount?.discount || 0
                            );
                        }}
                        className="font-medium text-green-500 hover:underline dark:text-red-300"
                    >
                        Discount
                    </button>
                    <button
                        onClick={() => {
                            printBarcode(
                                row.id,
                            );
                        }}
                        className="font-medium text-green-500 hover:underline dark:text-red-300"
                    >
                        Print Barcode
                    </button>
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
        const file = e.target.files?.[0];
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
                        const res = await axios.post(route('master.products.import-data'), formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data'
                            }
                        })

                        e.target.value = '';
                        return res.data.message;
                    } catch (error) {
                        Swal.showValidationMessage(`
                            Request failed: ${error}
                          `);

                    }
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        buttonsStyling: false,
                        customClass: classCustomSwal,
                        icon: "question",
                        title: `${result.value}`,
                        confirmButtonText: 'OK'
                    }).then((result) => {
                      if (result.isConfirmed) {
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
                <div className="grid grid-cols-3 gap-4 mt-5 mb-5">
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
                    <div>
                        <Label htmlFor="status" value="Status" />
                        <Select
                            id="status"
                            value={statusFilter}
                            onChange={onStatusChange}
                            required
                        >
                            <option value="">Select</option>
                            {categories && categories.map((value) => (
                                <option key={value.id} value={value.id}>{value.category_name}</option>
                            ))}
                        </Select>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="btn-add" value="Add Product" />
                        </div>
                            <Button
                                href={route("master.products.create")}
                                className="w-40 hover:bg-cyan-800"
                            >
                                <HiOutlinePlus className="mr-2 h-5 w-5" />
                                Add Data
                            </Button>
                        </div>
                    <div>
                        <div className="mb-2 block">
                            <Label htmlFor="file-upload" value="Import Data From Excel" />
                        </div>
                        <FileInput id="file-upload" onChange={handleFileChange} />
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-4">
                        <Button.Group>
                            <Button color="red">PDF</Button>
                            <Button color="gray" onClick={exportExcel}>Excel</Button>
                            <Button color="gray">CSV</Button>
                        </Button.Group>
                    </div>
                    <div className="flex justify-end">
                        <FloatingLabel
                            variant="outlined"
                            value={searchQuery}
                            onChange={onSearchChange}
                            label="search..."
                        />
                    </div>
                </div>


                <Modal
                    show={openModalDiscount}
                    onClose={() => setModalDiscount(false)}
                >
                    <Modal.Header>Add Discount</Modal.Header>
                    <Modal.Body>
                        <div className="space-y-6">
                            <Label
                                htmlFor="discount"
                                value="Discount Percentage"
                            />
                            <TextInput
                                id="discount"
                                type="number"
                                value={data.discount}
                                onChange={(e) =>
                                    setData(
                                        "discount",
                                        parseInt(e.target.value)
                                    )
                                }
                                min={0}
                                max={100}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={applyDiscount} disabled={processing}>
                            {processing ? (
                                <ClipLoader size="20" />
                            ) : (
                                "Apply Discount"
                            )}
                        </Button>
                        <Button
                            color="gray"
                            onClick={() => setModalDiscount(false)}
                        >
                            Cancel
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Modal
                    show={openModalDelete}
                    size="md"
                    onClose={() => setModalDelete(false)}
                    popup
                >
                    <Modal.Header />
                    <Modal.Body>
                        <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Are you sure you want to delete this data?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <Button
                                    color="failure"
                                    // onClick={() => deleteData()}
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <ClipLoader size={20} />
                                    ) : (
                                        "Yes, I'm sure"
                                    )}
                                </Button>
                                <Button
                                    color="gray"
                                    onClick={() => setModalDelete(false)}
                                >
                                    No, cancel
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                <div className="overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={products}
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
