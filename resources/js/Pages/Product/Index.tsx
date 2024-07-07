import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Product } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button, FloatingLabel, Label, Modal, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";
import { format } from "date-fns";
import { ClipLoader } from "react-spinners";

export default function Index({
    title,
    auth,
    products,
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
            route("master.products.index"),
            { search: searchQuery, page },
            { preserveState: true }
        );
        setCurrentPage(page);
    };

    const onRowsPerPageChange = (newRowsPerPage: number, page: number) => {
        setRowsPerPage(newRowsPerPage);
        router.get(
            route("master.products.index"),
            { search: searchQuery, page, per_page: newRowsPerPage },
            { preserveState: true }
        );
        setCurrentPage(page);
    };

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        router.get(
            route("master.products.index"),
            { search: event.target.value, page: 1 },
            { preserveState: true }
        );
    };

    const [productId, setProductId] = useState<string | null>(null);

    const deleteData = async () => {
        if (productId) {
            destroy(route("master.products.destroy", { product: productId }), {
                onSuccess: () => {
                    setModalDelete(false);
                    reset();
                },
            });
        }
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
    });

    const confirmDataDeletion = (id: string) => {
        setProductId(id);

        setModalDelete(true);
    };

    const [openModalDiscount, setModalDiscount] = useState(false);
    const [openModalDelete, setModalDelete] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(
        null
    );
    const [selectedProductDiscount, setSelectedProductDiscount] = useState<
        number | 0
    >(0);

    const addDiscountToProduct = (id: string, discount: number) => {
        setProductId(id);
        setData("discount", discount);
        setModalDiscount(true);
    };

    const applyDiscount = () => {
        if (productId) {
            post(route("master.products.add-discount", productId), {
                onFinish: () => {
                    setModalDiscount(false);
                },
            });
        }
    };

    const columns: TableColumn<Product>[] = [
        {
            name: "Barcode",
            selector: (row: Product) => row.barcode,
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
                            // setData("id", row.id);
                            // setData("discount", row.discount?.discount || 0);
                        }}
                        className="font-medium text-green-500 hover:underline dark:text-red-300"
                    >
                        Discount
                    </button>
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
                    <Button
                        href={route("master.products.create")}
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
                                    onClick={() => deleteData()}
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
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
