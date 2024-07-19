import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    HoldTransaction,
    PageProps,
    TransactionDetail,
    Transaction,
} from "@/types";
import { Head } from "@inertiajs/react";
import axios from "axios";
import {
    Button,
    FloatingLabel,
    Label,
    Modal,
    Select,
    Table,
    TextInput,
} from "flowbite-react";
import { useEffect, useRef, useState } from "react";
import { formatRupiah } from "@/utils/Utils";
import { BeatLoader, ClipLoader } from "react-spinners";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import DataTable, { TableColumn } from "react-data-table-component";
import { format } from "date-fns";
import Swal from "sweetalert2";
import Transactions from "../Reports/Transactions";

export default function Index({ title, auth, flash }: PageProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [holdtransactions, setHoldTransactions] = useState<HoldTransaction[]>(
        []
    );

    const [swalCustomClassProps, setSwalProps] = useState({
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

    const barcodeInput = useRef<HTMLInputElement>(null);

    const buttonTransaction = useRef<HTMLButtonElement>(null);
    const [loading, setLoading] = useState(false);
    const [openModalTableHoldTransaction, setOpenModalTableHoldTransaction] =
        useState(false);

    const transactionId = transactions.length > 0 ? [transactions[0].id] : null;

    const newTransaction = async () => {
        try {
            setLoading(true);

            if (transactionId) {
                setLoading(false);
                Swal.fire({
                    buttonsStyling: false,
                    customClass: swalCustomClassProps,
                    icon: "info",
                    title: "Info",
                    text: "There is a transaction in progress. You can't create a new transaction",
                });
                return;
            }

            const res = await axios.post(
                route("transaction.cashier.new-transaction")
            );
            const transaction = res.data.transaction;
            if (transaction) {
                if (barcodeInput.current) {
                    barcodeInput.current.disabled = false;
                }

                setTransactions([
                    {
                        id: transaction.id,
                        transaction_details: [],
                        payment_method: null,
                        subtotal: 0,
                        ppn: 0,
                        status: "process",
                        total_payment: 0,
                        transaction_date: new Date(),
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                ]);
            }
            setLoading(false);
        } catch (error : any) {
            setLoading(false);

            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: error.message,
            });
        }
    };

    const getDataProduct = async (barcode: string) => {
        try {
            setLoading(true);
            const res = await axios.get(
                route("master.products.get-data-barcode", barcode)
            );
            const product = res.data.product;

            if (product) {
                setTransactions((prevTransactions) => {
                    const updatedTransactions = prevTransactions.map(
                        (transaction) => {
                            if (transaction.id) {
                                const existingProductIndex =
                                    transaction.transaction_details?.findIndex(
                                        (detail) =>
                                            detail.product.id === product.id
                                    );

                                if (
                                    existingProductIndex !== undefined &&
                                    existingProductIndex !== -1
                                ) {
                                    const updatedTransactionDetails = [
                                        ...transaction.transaction_details,
                                    ];
                                    updatedTransactionDetails[
                                        existingProductIndex
                                    ].quantity += 1;
                                    updatedTransactionDetails[
                                        existingProductIndex
                                    ].total_price = calculateTotalPrice(
                                        updatedTransactionDetails[
                                            existingProductIndex
                                        ].price,
                                        updatedTransactionDetails[
                                            existingProductIndex
                                        ].quantity,
                                        updatedTransactionDetails[
                                            existingProductIndex
                                        ].discount
                                    );

                                    return {
                                        ...transaction,
                                        transaction_details:
                                            updatedTransactionDetails,
                                    };
                                } else {
                                    const newTransactionDetail: TransactionDetail =
                                        {
                                            id: product.id,
                                            transaction_id: '',
                                            quantity: 1,
                                            discount: product.discount,
                                            price: product.price,
                                            total_price: calculateTotalPrice(
                                                product.price,
                                                1,
                                                product.discount
                                            ),
                                            product: product,
                                            created_at : new Date(),
                                            updated_at : new Date(),
                                        };

                                    return {
                                        ...transaction,
                                        transaction_details: [
                                            ...(transaction.transaction_details ||
                                                []),
                                            newTransactionDetail,
                                        ],
                                    };
                                }
                            }
                            return transaction;
                        }
                    );

                    return updatedTransactions;
                });
            }

            if (barcodeInput.current) {
                barcodeInput.current.value = "";
            }
        } catch (error : any) {
            setLoading(false);

            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: error.message,
            });
        }
    };

    const saveTransaction = async () => {
        try {
            setLoading(true);

            if(!transactionId){
                setLoading(false);
                Swal.fire({
                    buttonsStyling: false,
                    customClass: swalCustomClassProps,
                    icon: "info",
                    title: "Info",
                    text: "There is no transaction in progress or products list is empty",
                });

                return;
            }

            const res = await axios.post(
                route("transaction.cashier.store"),
                {
                    transactions,
                }
            );

            if(res.data.indctr === 0){
                Swal.fire({
                    icon: "warning",
                    title: "Warning",
                    text: res.data.message,
                });
            }

            setLoading(false);

        } catch (error : any) {
            setLoading(false);
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: error.message,
            });
        }
    };

    const [modalHoldTransaction, setModalHoldTransaction] = useState(false);

    const holdTransaction = async (id: any, status: string) => {
        try {
            setLoading(true);

            if (status === "hold" && !transactionId) {
                setLoading(false);
                Swal.fire({
                    showCloseButton: false,
                    showConfirmButton: false,
                    icon: "info",
                    title: "Info",
                    text: "There is no transaction in progress",
                });

                return;
            }

            if (status === 'completed' && transactions && transactions.length > 0 && (transactions[0].payment_method === '' || transactions[0].payment_method === null)) {
                setLoading(false);

                Swal.fire({
                    showCloseButton: false,
                    showConfirmButton: false,
                    icon: "info",
                    title: "Info",
                    text: "Please select payment method first! or product list is empty!",
                });

                return;
            }

            const res = await axios.put(
                route("transaction.cashier.hold-transaction", id),
                {
                    status: status,
                    transactions,
                }
            );

            setLoading(false);

            if (res.data.indctr === 1) {
                const transaction = res.data.transaction;
                if (transaction) {
                    if (transaction.status === "process") {
                        setTransactions([
                            {
                                id: transaction.id,
                                transaction_details: transaction.transaction_details,
                                subtotal: transaction.subtotal,
                                ppn: transaction.ppn,
                                payment_method: transaction.payment_method,
                                status: transaction.status,
                                total_payment: transaction.total_payment,
                                created_at: new Date(),
                                updated_at: new Date(),
                                transaction_date: new Date()
                            },
                        ]);
                        setOpenModalTableHoldTransaction(false);
                        setModalSelectedDataHoldTransaction(false);
                        if (barcodeInput.current) {
                            barcodeInput.current.disabled = false;
                        }
                    } else {
                        setTransactions([]);
                        setModalHoldTransaction(false);

                        if (barcodeInput.current) {
                            barcodeInput.current.disabled = true;
                        }
                    }
                }
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Warning",
                    text: res.data.message,
                });

                return;
            }

        } catch (error : any) {
            setLoading(false);

            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: error.message,
            });
        }
    };


    const calculateTotalPrice = (
        price: number,
        quantity: number,
        discount: number
    ) => {
        const discountPercentage = discount || 0;
        const discountedPrice = price * (1 - discountPercentage / 100);
        const totalPriceDisc = discountedPrice * quantity;
        return Math.round(totalPriceDisc);
    };

    useEffect(() => {
        const updatedTransactions = transactions.map((transaction) => {
            const subtotal =
                transaction.transaction_details?.reduce((total, detail) => {
                    return total + (detail.total_price || 0);
                }, 0) || 0;

            const totalPPN = Math.round(subtotal * 0.1);
            const totalPayment = Math.round(subtotal + totalPPN);

            return {
                ...transaction,
                subtotal: subtotal,
                ppn: totalPPN,
                total_payment: totalPayment,
            };
        });

        if (
            JSON.stringify(transactions) !== JSON.stringify(updatedTransactions)
        ) {
            setTransactions(updatedTransactions);
        }
    }, [transactions]);

    const columns: TableColumn<HoldTransaction>[] = [
        {
            name: "Transaction ID",
            selector: (row: HoldTransaction) => row.id,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: HoldTransaction) => row.status,
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: HoldTransaction) =>
                format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
        {
            name: "Updated At",
            selector: (row: HoldTransaction) =>
                format(new Date(row.updated_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
    ];

    const listHoldTransaction = async () => {
            try {
                if (transactionId) {
                    Swal.fire({
                        customClass: swalCustomClassProps,
                        buttonsStyling: false,
                        icon: "info",
                        title: "Info",
                        text: "There is a transaction in progress. You can't open list hold transaction",
                    });

                    return;
                }

                const res = await axios.get(
                    route("transaction.cashier.get-data-transactions", "hold")
                );
                const transactions = res.data.transactions;
                if (transactions) {
                    setHoldTransactions(transactions);
                }

                setOpenModalTableHoldTransaction(true);
            } catch (error : any) {
                Swal.fire({
                    icon: "warning",
                    title: "Warning",
                    text: error.message,
                });
            }
    };

    const [tableHoldTransactionId, setTableHoldTransactionId] = useState<
        string | null
    >(null);

    const [
        modalSelectDataHoldTransaction,
        setModalSelectedDataHoldTransaction,
    ] = useState(false);

    const doubleClickHandleTableHoldTransaction = (row: any) => {
        if (row.id) {
            setTableHoldTransactionId(row.id);
            setModalSelectedDataHoldTransaction(true);
        }
    };

    const printReceipt = async () => {
        try {
            if (!transactionId || transactions.some((t) => t.transaction_details?.length === 0)) {
                Swal.fire({
                    buttonsStyling: false,
                    customClass: swalCustomClassProps,
                    icon: "info",
                    title: "Info",
                    text: "There is no transaction in progress or products list is empty",
                });
                return;
            }

            if (transactions[0].payment_method == '' || transactions[0].payment_method == null) {
                Swal.fire({
                    buttonsStyling: false,
                    customClass: swalCustomClassProps,
                    icon: "info",
                    title: "Info",
                    text: "Please select payment method first!",
                });
                return;
            }

            await holdTransaction(transactionId, "completed");

            const url = route("transaction.cashier.print", {
                id: transactionId,
            });

            await window.open(url, "_blank");

        } catch (error : any) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: error.message,
            });
        }
    };

    const [searchKeyword, setSearchKeyword] = useState("");

    const searchHoldTransaction = async (keyword: any) => {
        try {
            const res = await axios.get(
                route("transaction.cashier.get-data-transactions", "hold"),
                {
                    params: {
                        keyword: keyword,
                    },
                }
            );

            const transactions = res.data.transactions;
            if (transactions) {
                setHoldTransactions(transactions);
            }
        } catch (error : any) {
            Swal.fire({
                icon: "warning",
                title: "Warning",
                text: error.message,
            });
        }
    };

    const handleSearchChange = (e: any) => {
        const keyword = e.target.value.toLowerCase().trim();
        setSearchKeyword(keyword);
        searchHoldTransaction(keyword);
    };

    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

    useEffect(() => {
        if (paymentMethod !== null) {
            const save = async () => {
                await saveTransaction();
                setPaymentMethod(null);
            };

            save();
        }
    }, [paymentMethod]);

    useEffect(() => {
        const save = async () => {
            if (
                transactionId &&
                transactions &&
                transactions.length > 0 &&
                transactions[0].transaction_details.length > 0
            ) {
                await saveTransaction();
            }
        };

        save();
    }, [transactions]);

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
                <div className="flex justify-between">
                    <h1 className="dark:text-white text-lg">{title}</h1>
                    <div className="flex">
                        <Button
                            onClick={() => listHoldTransaction()}
                            disabled={loading}
                        >
                            {loading ? (
                                <ClipLoader size={20} />
                            ) : (
                                "List Hold Transaction"
                            )}
                        </Button>
                        <Button
                            className="ms-3"
                            ref={buttonTransaction}
                            onClick={() => newTransaction()}
                        >
                            {loading ? (
                                <ClipLoader size={20} />
                            ) : (
                                "New Transaction"
                            )}
                        </Button>
                    </div>
                </div>

                <Modal
                    dismissible
                    show={modalSelectDataHoldTransaction}
                    size="md"
                    onClose={() => setModalSelectedDataHoldTransaction(false)}
                    popup
                >
                    <Modal.Header></Modal.Header>
                    <Modal.Body>
                        <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Are you sure you want to select this data?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <Button
                                    onClick={() =>
                                        holdTransaction(
                                            tableHoldTransactionId,
                                            "process"
                                        )
                                    }
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ClipLoader size={20} />
                                    ) : (
                                        "Yes, I'm sure"
                                    )}
                                </Button>
                                <Button
                                    color="gray"
                                    onClick={() =>
                                        setModalSelectedDataHoldTransaction(
                                            false
                                        )
                                    }
                                >
                                    No, cancel
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                <Modal
                    dismissible
                    show={modalHoldTransaction}
                    size="md"
                    onClose={() => setModalHoldTransaction(false)}
                    popup
                >
                    <Modal.Header></Modal.Header>
                    <Modal.Body>
                        <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Are you sure you want to hold this transaction?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <Button
                                    onClick={() =>
                                        holdTransaction(transactionId, "hold")
                                    }
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ClipLoader size={20} />
                                    ) : (
                                        "Yes, I'm sure"
                                    )}
                                </Button>
                                <Button
                                    color="gray"
                                    onClick={() =>
                                        setModalHoldTransaction(false)
                                    }
                                >
                                    No, cancel
                                </Button>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>

                <Modal
                    show={openModalTableHoldTransaction}
                    onClose={() => setOpenModalTableHoldTransaction(false)}
                    className={`fixed inset-0 z-50 overflow-y-auto ${openModalTableHoldTransaction ? 'animate-fadeIn' : 'animate-fadeOut'}`}
                    size="xlg"
                >
                    <Modal.Header>
                        <p>List Hold Transaction</p>
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
                            columns={columns}
                            data={holdtransactions}
                            onRowDoubleClicked={
                                doubleClickHandleTableHoldTransaction
                            }
                        />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button
                            color="gray"
                            onClick={() =>
                                setOpenModalTableHoldTransaction(false)
                            }
                        >
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>

                <div className="mt-5">
                    <Label htmlFor="barcode" value="Barcode" />
                    <TextInput
                        id="barcode"
                        ref={barcodeInput}
                        onChange={(e) => getDataProduct(e.target.value)}
                        disabled
                    />
                </div>
                <div className="overflow-x-auto mt-5">
                    <Table>
                        <Table.Head>
                            <Table.HeadCell>Product name</Table.HeadCell>
                            <Table.HeadCell>Category</Table.HeadCell>
                            <Table.HeadCell>Quantity</Table.HeadCell>
                            <Table.HeadCell>Type</Table.HeadCell>
                            <Table.HeadCell>Price</Table.HeadCell>
                            <Table.HeadCell>Discount</Table.HeadCell>
                            <Table.HeadCell>Total</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                            {transactions.map((transaction) =>
                                transaction.transaction_details?.map(
                                    (detail: TransactionDetail, index) => (
                                        <Table.Row
                                            key={detail.id}
                                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Table.Cell>
                                                {detail.product?.product_name}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {
                                                    detail.product?.category
                                                        ?.category_name
                                                }
                                            </Table.Cell>
                                            <Table.Cell>
                                                <TextInput
                                                    type="number"
                                                    value={detail.quantity.toString()}
                                                    onChange={async (e) => {
                                                        const updatedTransactionDetails =
                                                            [
                                                                ...(transaction.transaction_details ||
                                                                    []),
                                                            ];
                                                        updatedTransactionDetails[
                                                            index
                                                        ].quantity = parseInt(
                                                            e.target.value
                                                        );
                                                        updatedTransactionDetails[
                                                            index
                                                        ].total_price =
                                                            calculateTotalPrice(
                                                                updatedTransactionDetails[
                                                                    index
                                                                ].price,
                                                                updatedTransactionDetails[
                                                                    index
                                                                ].quantity,
                                                                updatedTransactionDetails[
                                                                    index
                                                                ].discount
                                                            );

                                                        setTransactions(
                                                            (
                                                                prevTransactions
                                                            ) =>
                                                                prevTransactions.map(
                                                                    (t) => {
                                                                        if (
                                                                            t.id ===
                                                                            transaction.id
                                                                        ) {
                                                                            return {
                                                                                ...t,
                                                                                products:
                                                                                    updatedTransactionDetails,
                                                                            };
                                                                        }
                                                                        return t;
                                                                    }
                                                                )
                                                        );
                                                    }}
                                                />
                                            </Table.Cell>
                                            <Table.Cell>
                                                {detail.product.type}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {formatRupiah(detail.price)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {loading ? (
                                                    <BeatLoader />
                                                ) : (
                                                    <TextInput
                                                        type="number"
                                                        value={detail.discount.toString()}
                                                        onChange={async (e) => {
                                                            const updatedTransactionDetails =
                                                                [
                                                                    ...(transaction.transaction_details ||
                                                                        []),
                                                                ];
                                                            updatedTransactionDetails[
                                                                index
                                                            ].discount =
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                );
                                                            updatedTransactionDetails[
                                                                index
                                                            ].total_price =
                                                                calculateTotalPrice(
                                                                    updatedTransactionDetails[
                                                                        index
                                                                    ].price,
                                                                    updatedTransactionDetails[
                                                                        index
                                                                    ].quantity,
                                                                    updatedTransactionDetails[
                                                                        index
                                                                    ].discount
                                                                );

                                                            setTransactions(
                                                                (
                                                                    prevTransactions
                                                                ) =>
                                                                    prevTransactions.map(
                                                                        (t) => {
                                                                            if (
                                                                                t.id ===
                                                                                transaction.id
                                                                            ) {
                                                                                return {
                                                                                    ...t,
                                                                                    products:
                                                                                        updatedTransactionDetails,
                                                                                };
                                                                            }
                                                                            return t;
                                                                        }
                                                                    )
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {formatRupiah(
                                                    detail.total_price
                                                ) || 0}
                                            </Table.Cell>
                                        </Table.Row>
                                    )
                                )
                            )}
                        </Table.Body>
                    </Table>
                </div>

                <div className="mt-5">
                    {transactions.map((transaction: Transaction, index) => (
                        <div
                            key={transaction.id}
                            className="border border-gray-300 p-4 rounded-lg"
                        >
                            <h3 className="text-lg font-semibold mb-2">
                                Summary
                            </h3>
                            <div className="flex justify-between mb-1">
                                <span>Transaction ID:</span>
                                <span>{transaction.id}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span>Sub Total:</span>
                                <span>
                                    {formatRupiah(transaction.subtotal)}
                                </span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span>PPN (10%):</span>
                                <span>{formatRupiah(transaction.ppn)}</span>
                            </div>
                            <div className="flex justify-between mb-1">
                                <span>Payment Method:</span>
                                <span>
                                    <Select
                                        value={transaction.payment_method}
                                        onChange={async (e) => {
                                            const updatedTransactions =
                                                transactions.map((trans) => {
                                                    if (
                                                        trans.id ===
                                                        transaction.id
                                                    ) {
                                                        return {
                                                            ...trans,
                                                            payment_method:
                                                                e.target.value,
                                                        };
                                                    }
                                                    return trans;
                                                });

                                            await setTransactions(
                                                updatedTransactions
                                            );

                                            setPaymentMethod(e.target.value);
                                        }}
                                    >
                                        <option value="">Select</option>
                                        <option value="cash">Cash</option>
                                        <option value="credit">Credit</option>
                                    </Select>
                                </span>
                            </div>
                            <hr className="my-2" />
                            <div className="flex justify-between font-semibold">
                                <span>Total Payment:</span>
                                <span>
                                    {formatRupiah(transaction.total_payment)}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-5 flex justify-between">
                    <span>Action</span>
                    <div className="flex">
                        {loading ? (
                            <BeatLoader />
                        ) : (
                            <>
                                <Button
                                    color="red"
                                    className="ms-3"
                                    onClick={() => holdTransaction(transactionId, 'hold')}
                                >
                                    Hold
                                </Button>
                                <Button
                                    color="success"
                                    className="ms-3"
                                    onClick={() => printReceipt()}
                                >
                                    Submit
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
