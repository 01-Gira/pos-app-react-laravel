
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Product } from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import { Button, Dropdown, FloatingLabel, Label, Modal, Pagination, Table, TextInput } from "flowbite-react";
import { useEffect, useState } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { HiOutlinePlus } from "react-icons/hi";
import { format } from 'date-fns';
import { toast, ToastContainer } from "react-toastify";

export default function Index({ title, auth, products, pagination, search, flash }: PageProps) {

    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [searchQuery, setSearchQuery] = useState(search || '');
    const [rowsPerPage, setRowsPerPage] = useState(pagination.per_page);

    useEffect(() => {
        setCurrentPage(pagination.current_page);
    }, [pagination.current_page]);

    useEffect(() => {
        setSearchQuery(search || '');
    }, [search]);

    const onPageChange = (page: number) => {
        router.get(route('master.products.index'), { search: searchQuery, page }, { preserveState: true });
        setCurrentPage(page);
    };

    const onRowsPerPageChange = (newRowsPerPage: number, page: number) => {
        setRowsPerPage(newRowsPerPage);
        router.get(route('master.products.index'), { search: searchQuery, page, per_page: newRowsPerPage }, { preserveState: true });
        setCurrentPage(page);
    };

    const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        router.get(route('master.products.index'), { search: event.target.value, page: 1 }, { preserveState: true });
    };

    const deleteData = async (id: string) => {
        destroy(route('master.products.destroy', { id }), {
            onSuccess : () => {
                swal("Poof! Your data has been deleted!", {
                    icon: "success",
                });
                reset();
            }
        });
    }

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
                }
            },
        })
        .then((willDelete) => {
            if (willDelete) {
                deleteData(id);
            } else {
                swal("Your data is safe!");
            }
        });
    }

    const [discount, setDiscount] = useState(0);
    const [openModalDiscount, setModalDiscount] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
    const addDiscountToProduct = (id: string) => {
        setSelectedProductId(id);
        setModalDiscount(true);
    }

    const applyDiscount = () => {
        if (selectedProductId) {
            router.post(route('master.products.add-discount', selectedProductId), { discount }, {
                onSuccess: () => {
                    setModalDiscount(false);
                    setSelectedProductId(null);
                    setDiscount(0);
                },
                onError: (errors) => {
                    console.error(errors);
                }
            });
        }
    }

    const columns : TableColumn<Product>[]= [
        {
            name: 'Barcode',
            selector: (row : Product) => row.barcode,
            sortable: true,
        },
        {
            name: 'Product Name',
            selector: (row : Product) => row.product_name,
            sortable: true,
        },
        {
            name: 'Category',
            selector: (row: Product) => row.category?.category_name || '',
            sortable: true,
        },
        {
            name: 'Stock',
            selector: (row: Product) => row.stock,
            sortable: true,
        },
        {
            name: 'Price',
            selector: (row: Product) => row.price,
            sortable: true,
        },
        {
            name: 'Created At',
            selector: (row : Product)=> format(new Date(row.created_at), 'yyyy-MM-dd'),
            sortable: true,
        },
        {
            name: 'Action',
            cell: (row : Product) => (
                <div className="flex space-x-4">
                    <a
                    href={route("master.products.edit", row.id)}
                    className="font-medium text-yellow-300 hover:underline dark:text-cyan-500"
                    >
                        Edit
                    </a>
                    <button
                        onClick={() => addDiscountToProduct(row.id)}
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
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{title}</h2>}
            flash={flash}
        >
            <Head title={title} />
                <div className='p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg'>
                    <h1 className="dark:text-white text-lg">{title}</h1>

                    <div className="flex justify-between items-center space-x-2">
                        <Button href={route('master.products.create')} className="w-40 hover:bg-cyan-800">
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
                        <Modal.Header>
                            Add Discount
                        </Modal.Header>
                        <Modal.Body>
                            <div className="space-y-6">
                                <Label htmlFor="discount" value="Discount Percentage" />
                                <TextInput
                                    id="discount"
                                    type="number"
                                    value={discount}
                                    onChange={(e) => setDiscount(parseFloat(e.target.value))}
                                    min={0}
                                    max={100}
                                />
                            </div>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={applyDiscount}>Apply Discount</Button>
                            <Button color="gray" onClick={() => setModalDiscount(false)}>
                                Cancel
                            </Button>
                        </Modal.Footer>
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
