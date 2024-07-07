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
import { redirect } from "react-router-dom";

export default function Index({ title, auth, flash }: PageProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [holdtransactions, setHoldTransactions] = useState<HoldTransaction[]>(
        []
    );

    const [modalNotif, setModalNotif] = useState(false);
    const [modalNotifText, setModalNotifText] = useState<string | null>("");

    const barcodeInput = useRef<HTMLInputElement>(null);

    const buttonTransaction = useRef<HTMLButtonElement>(null);
    const [loading, setLoading] = useState(false);
    const [openModalTableHoldTransaction, setOpenModalTableHoldTransaction] =
        useState(false);

    const transactionId = transactions.length > 0 ? [transactions[0].id] : null;

    const newTransaction = async () => {
        if (!transactionId) {
            try {
                setLoading(true);

                const res = await axios.post(
                    route("transaction.cashier.new-transaction")
                );
                const transaction = res.data.transaction;
                if (transaction) {
                    if (barcodeInput.current) {
                        barcodeInput.current.disabled = false;
                    }
                    // if (buttonTransaction.current) {
                    //     buttonTransaction.current.disabled = true;
                    // }

                    setTransactions([
                        {
                            id: transaction.id,
                            transaction_details: [],
                            payment_method: null,
                            subtotal: 0,
                            ppn: 0,
                            status: "process",
                            total_payment: 0,
                        },
                    ]);
                }
                setLoading(false);
            } catch (error) {
                setLoading(false);
            }
        } else {
            setModalNotif(true);
            setModalNotifText("Sorry, There is transaction on process");
        }
    };

    const getDataProduct = async (barcode: string) => {
        try {
            const res = await axios.get(
                route("master.products.get-data", barcode)
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
                                            quantity: 1,
                                            discount: product.discount,
                                            price: product.price,
                                            total_price: calculateTotalPrice(
                                                product.price,
                                                1,
                                                product.discount
                                            ),
                                            product: product,
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

                    // Optionally update the transaction's total price, PPN, etc. here

                    saveTransaction();

                    return updatedTransactions;
                });
            }

            if (barcodeInput.current) {
                barcodeInput.current.value = "";
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
        }
    };

    const saveTransaction = async () => {
        if (transactionId) {
            try {
                setLoading(true);
                const res = await axios.post(
                    route("transaction.cashier.store"),
                    {
                        transactions,
                    }
                );
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Error saving transaction:", error);
            }
        } else {
            setModalNotif(true);
            setModalNotifText(
                "Sorry, There is no transaction on process or products list is empty"
            );
        }
    };

    const [modalHoldTransaction, setModalHoldTransaction] = useState(false);

    const holdTransaction = async (id: any, status: string) => {
        if (status == "hold" && !transactionId) {
            setModalNotif(true);
            setModalNotifText("Sorry, There is no transaction on process");
        } else if (id) {
            try {
                setLoading(true);

                const res = await axios.put(
                    route("transaction.cashier.hold-transaction", id),
                    {
                        status: status,
                        transactions,
                    }
                );
                const transaction = res.data.transaction;
                console.log(res.data.transaction);

                if (transaction) {
                    if (transaction.status == "process") {
                        setTransactions([
                            {
                                id: transaction.id,
                                transaction_details:
                                    transaction.transaction_details,
                                subtotal: transaction.total_price,
                                ppn: transaction.ppn,
                                payment_method: null,
                                status: transaction.status,
                                total_payment: transaction.total_payment,
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
                // if()
                setLoading(false);
            } catch (error) {
                setLoading(false);
                console.error("Error saving transaction:", error);
            }
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
        if (!transactionId) {
            try {
                const res = await axios.get(
                    route("transaction.cashier.get-data-transactions", "hold")
                );
                const transactions = res.data.transactions;
                if (transactions) {
                    setHoldTransactions(transactions);
                }

                setOpenModalTableHoldTransaction(true);
            } catch (error) {
                console.log(error);
            }
        } else {
            setModalNotif(true);
            setModalNotifText("Sorry, There is transaction on process");
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
        if (
            transactionId &&
            transactions.length > 0 &&
            transactions.some((t) => t.transaction_details?.length > 0)
        ) {
            const url = route("transaction.cashier.print", {
                id: transactionId,
            });

            await holdTransaction(transactionId, "completed");

            window.open(url, "_blank");
        } else {
            setModalNotif(true);
            setModalNotifText(
                "Sorry, There is no transaction on process or product list is empty"
            );
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
        } catch (error) {
            console.log(error);
        }
    };

    const handleSearchChange = (e: any) => {
        const keyword = e.target.value.toLowerCase().trim();
        setSearchKeyword(keyword);
        searchHoldTransaction(keyword);
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

            <Modal
                dismissible
                show={modalNotif}
                size="sm"
                onClose={() => setModalNotif(false)}
                popup
                className={`animate-fadeIn duration-300 ${
                    modalNotif ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            >
                <Modal.Header></Modal.Header>
                <Modal.Body>
                    <div className="text-center">
                        <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                        {modalNotifText && (
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                {modalNotifText}
                            </h3>
                        )}
                    </div>
                </Modal.Body>
            </Modal>

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
                    size="xlg"
                >
                    <Modal.Header>
                        <p>List Hold Transaction</p>
                    </Modal.Header>
                    <Modal.Body>
                        <FloatingLabel
                            variant="outlined"
                            onChange={handleSearchChange}
                            label="search..."
                        />
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

                                                        await saveTransaction();
                                                    }}
                                                />
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

                                                            await saveTransaction();
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
                                            console.log(e.target.value);
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

                                            await saveTransaction();
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
                                    color="failure"
                                    onClick={() =>
                                        setModalHoldTransaction(true)
                                    }
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
