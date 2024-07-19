import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, PageProps, Product, TransactionDetail } from "@/types";
import { Button, FileInput, FloatingLabel, Label, Modal, Select, Textarea, TextInput } from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect, useRef, ChangeEvent } from "react";
import axios from "axios";
import InputError from "@/Components/InputError";
import { CircleLoader, ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import DataTable, { TableColumn } from "react-data-table-component";
import { format } from "date-fns";
import { formatRupiah } from "@/utils/Utils";

export default function Create({ title, auth, flash }: PageProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
        transaction_id: "",
        product_id: "",
        description: "",
        quantity: 0,
    });

    const transactionInput = useRef<HTMLInputElement>(null);

    const [transactionDetails, setTransactionDetail] = useState<TransactionDetail[]>([]);

    const [searchQuery, setSearchQuery] = useState<string>('');

    const [pagination, setPagination] = useState<any>({});

    const [currentPage, setCurrentPage] = useState<number>(1);

    const [rowsPerPage, setRowsPerPage] = useState<number>(5);

    const [selectedRows, setSelectedRows] = useState<[]>([]);

    const [openModal, setOpenModal] = useState(false);

    const [pending, setPending] = useState(false);

    useEffect(() => {
        if (data.transaction_id.length > 0) {
            verifyTransaction(data.transaction_id);
        }
    }, [data.transaction_id]);

    const Toast = Swal.mixin({
        toast: true,
        position: 'top-right',
        customClass: {
          popup: 'colored-toast',
        },
        showConfirmButton: false,
        timer: 1500,
        timerProgressBar: true,
      })

    const verifyTransaction = async (transaction_id: string) => {
        try {
            const res = await axios.get(
                route("transaction.claim-customers.verify-transaction", { transaction_id })
            );

            if(res.data.indctr === 1){
                await Toast.fire({
                    icon: 'success',
                    title: 'Success',
                    text: res.data.message
                  })
                if (transactionInput.current) {
                    transactionInput.current.classList.add('border-green-700', 'border-2');
                }
            }else{
                await Toast.fire({
                    icon: 'warning',
                    title: 'Warning',
                    text: res.data.message
                  })
                if (transactionInput.current) {
                    transactionInput.current.classList.add('border-red-700', 'border-2');
                }
            }
        } catch (error : any) {
            await Toast.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
              })
            console.error("Error fetching product data:", error);
            if (transactionInput.current) {
                transactionInput.current.classList.add('border-red-700', 'border-2');
            }
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("transaction.claim-customers.store"));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Set the picture file in form data
            setData((prevData) => ({
                ...prevData,
                picture: file,
            }));

            // Display image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };


    const fetchDataProducts = async(params : any) => {
        setPending(true);
        try {
            const res = await axios.get(route("master.products.get-product-transaction", {transaction_id : data.transaction_id}), { params });
            const transaction_details = res.data.transaction_details;

            if(transaction_details){
                setTransactionDetail(transaction_details);
                setCurrentPage(res.data.pagination.current_page);
                setRowsPerPage(res.data.pagination.per_page);
                setPagination(res.data.pagination.total_items);
                setSearchQuery(res.data.search);
            }
        } catch (error : any) {
            await Toast.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
              })
        } finally{
            setPending(false);
        }
    }

    const getDataProduct = async() => {
        try {
            await fetchDataProducts('');
            setOpenModal(true);
        } catch (error : any) {
            await Toast.fire({
                icon: 'error',
                title: 'Error',
                text: error.message
              })
        }
    }

    const handleSearchChange = async (e : ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        await fetchDataProducts({
            search: e.target.value,
            page : 1,
            per_page: rowsPerPage,
        });
    }

    const columnTransactionDetails: TableColumn<TransactionDetail>[] = [
        {
            name: "Product ID",
            cell: (row: TransactionDetail) => row.product?.id,
            sortable: true,
            width: '50%'
        },
        {
            name: "Product Name",
            selector: (row: TransactionDetail) => row.product?.product_name,
            sortable: true,
        },
        {
            name: "Discount",
            selector: (row: TransactionDetail) => row.discount,
            sortable: true,
            center: true,
        },
        {
            name: "Quantity",
            selector: (row: TransactionDetail) => row.quantity,
            sortable: true,
            center: true,
        },
        {
            name: "Total Price",
            selector: (row: TransactionDetail) => formatRupiah(row.total_price),
            sortable: true,
            center: true,
        }
    ];

    const doubleClickHandle = (row: TransactionDetail) => {
        setData('product_id', row.product.id);
        setOpenModal(false);
    }

    const setQuantity = (e : ChangeEvent<HTMLInputElement>) => {
        const inputQuantity = parseInt(e.target.value);

        const transactionDetail = transactionDetails.find(detail => detail.product.id === data.product_id);

        if (transactionDetail && inputQuantity > transactionDetail.quantity) {
            Toast.fire({
                icon: 'error',
                title: 'Error',
                text: 'Quantity cannot be more than the available transaction details quantity'
            })
        } else {
            setData('quantity', inputQuantity);
        }
    }

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
                <form onSubmit={handleSubmit} className="mt-5 grid grid-cols-12">
                    <div className="col-span-12 mt-5">
                        <div>
                            <Label htmlFor="transaction_id" value="Transcation ID" />
                            <TextInput
                                id="transaction_id"
                                ref={transactionInput}
                                value={data.transaction_id}
                                onChange={(e) => setData("transaction_id", e.target.value)}
                                required
                            />
                            <InputError message={errors.transaction_id} className="mt-2" />
                        </div>
                    </div>
                    <div className="col-span-12 mt-5 grid grid-cols-12 gap-4">
                        <div className="col-span-6 grid grid-cols-12 gap-4">
                            <div className="col-span-9">
                                <Label
                                    htmlFor="product_id"
                                    value="Product ID"
                                />
                                <TextInput
                                    id="product_id"
                                    value={data.product_id}
                                    readOnly
                                    onChange={(e) =>
                                        setData("product_id", e.target.value)
                                    }
                                    required
                                />
                                <InputError
                                    message={errors.product_id}
                                    className="mt-2"
                                />
                            </div>
                            <div className="col-span-3">
                                <Label
                                    htmlFor="btn-search"
                                    value="Search Product"
                                />
                                <Button
                                    onClick={() => getDataProduct()}
                                    className="w-full h-10 text-xs"
                                >
                                    Search
                                </Button>
                            </div>
                        </div>
                        <div className="col-span-6">
                            <Label htmlFor="quantity" value="Quantity" />
                            <TextInput
                                id="quantity"
                                type="number"
                                value={data.quantity}
                                onChange={setQuantity}
                                required
                            />
                            <InputError
                                message={errors.quantity}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <div className="col-span-12 mt-5">
                        <Label htmlFor="description" value="Description"/>
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                            required
                        ></Textarea>
                    </div>
                    <div className="flex space-x-4 mt-5">
                        <Button
                            href={route("transaction.claim-customers.index")}
                            type="button"
                            color="gray"
                            className="mt-4 w-40"
                            disabled={processing}
                        >
                            Back
                        </Button>

                        <Button
                            color="success"
                            type="submit"
                            className="mt-4 w-40"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <ClipLoader size={20} />
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
            <Modal
                show={openModal}
                onClose={() => setOpenModal(false)}
                className={`fixed inset-0 z-50 overflow-y-auto ${openModal ? 'animate-fadeIn' : 'animate-fadeOut'}`}
            >
                <Modal.Header>
                    Tabel Product
                </Modal.Header>
                <Modal.Body>
                    <div className="flex justify-end">
                        <FloatingLabel
                            variant="outlined"
                            onChange={handleSearchChange}
                            label="search..."
                        />
                    </div>
                    <DataTable
                        highlightOnHover
                        persistTableHead
                        columns={columnTransactionDetails}
                        data={transactionDetails}
                        pagination
                        paginationServer
                        paginationPerPage={rowsPerPage}
                        paginationTotalRows={pagination}
                        paginationDefaultPage={currentPage}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, pagination]}
                        onRowDoubleClicked={
                            doubleClickHandle
                        }
                        progressPending={pending}
                    />
                </Modal.Body>
            </Modal>
        </AuthenticatedLayout>
    );
}
