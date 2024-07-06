import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    HoldTransaction,
    PageProps,
    Product,
    ProductTransactions,
    Transaction,
} from "@/types";
import { Head, router, useForm } from "@inertiajs/react";
import axios from "axios";
import { Button, Label, Modal, Table, TextInput } from "flowbite-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatRupiah } from "@/utils/Utils";
import { BeatLoader, ClipLoader } from "react-spinners";
import swal from "sweetalert";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";
import DataTable, { TableColumn } from "react-data-table-component";
import { format } from "date-fns";

export default function Index({ title, auth, flash }: PageProps) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [holdtransactions, setHoldTransactions] = useState<HoldTransaction[]>(
        []
    );

    const barcodeInput = useRef<HTMLInputElement>(null);
    const spanTransactionID = useRef<HTMLSpanElement>(null);
    const spanTotalPrice = useRef<HTMLSpanElement>(null);
    const spanTotalPPN = useRef<HTMLSpanElement>(null);
    const spanTotalPayment = useRef<HTMLSpanElement>(null);

    const currentTransactionId = spanTransactionID.current?.textContent;

    const buttonTransaction = useRef<HTMLButtonElement>(null);
    const [loading, setLoading] = useState(false);
    const [openModal, setOpenModal] = useState(false);

    const newTransaction = async () => {
        setLoading(true);

        const res = await axios.post(
            route("transaction.cashier.new-transaction")
        );
        const transaction = res.data.transaction;
        if (transaction) {
            if (spanTransactionID.current) {
                spanTransactionID.current.textContent = transaction.id;
            }
            if (barcodeInput.current) {
                barcodeInput.current.disabled = false;
            }
            if (buttonTransaction.current) {
                buttonTransaction.current.disabled = true;
            }

            setTransactions((prevTransactions) => [
                ...prevTransactions,
                {
                    id: transaction.id,
                    products: [],
                    total_price: 0,
                    ppn: 0,
                    status: 0,
                    total_payment: 0,
                },
            ]);
        }
        setLoading(false);
    };

    const getDataProduct = async (barcode: string) => {
        try {
            const res = await axios.get(
                route("master.products.get-data", { barcode })
            );
            const product = res.data.product;

            if (product) {
                const currentTransactionId =
                    spanTransactionID.current?.textContent;
                if (!currentTransactionId) return;
                setTransactions((prevTransactions) => {
                    const updatedTransactions = prevTransactions.map(
                        (transaction) => {
                            if (transaction.id === currentTransactionId) {
                                const existingProductIndex =
                                    transaction.products?.findIndex(
                                        (p) => p.id === product.id
                                    );

                                if (
                                    existingProductIndex !== undefined &&
                                    existingProductIndex !== -1 &&
                                    transaction.products
                                ) {
                                    const updatedProducts = [
                                        ...transaction.products,
                                    ];
                                    updatedProducts[
                                        existingProductIndex
                                    ].quantity += 1;
                                    updatedProducts[
                                        existingProductIndex
                                    ].total_price = calculateTotalPrice(
                                        updatedProducts[existingProductIndex]
                                            .price,
                                        updatedProducts[existingProductIndex]
                                            .quantity,
                                        updatedProducts[existingProductIndex]
                                            .discount
                                    );
                                    return {
                                        ...transaction,
                                        products: updatedProducts,
                                    };
                                } else {
                                    const newProduct = {
                                        ...product,
                                        quantity: 1,
                                        total_price: calculateTotalPrice(
                                            product.price,
                                            1,
                                            product.discount
                                        ),
                                    };
                                    return {
                                        ...transaction,
                                        products: [
                                            ...(transaction.products || []),
                                            newProduct,
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
        } catch (error) {
            console.error("Error fetching product data:", error);
        }
    };

    const saveTransaction = async (transactions: Transaction[]) => {
        try {
            setLoading(true);
            const res = await axios.post(
                route("transaction.cashier.scan-product"),
                {
                    transactions,
                }
            );
            setLoading(false);

            console.log(res.data.message); // Pesan sukses dari backend
        } catch (error) {
            setLoading(false);
            console.error("Error saving transaction:", error);
        }
    };

    const holdTransaction = () => {
        swal({
            title: "Hold",
            text: "Are you sure want to hold this transaction?",
            icon: "warning",
            buttons: {
                cancel: true,
                confirm: {
                    text: "Yes",
                    value: true,
                    className: "bg-red-500",
                    closeModal: true,
                },
            },
        }).then(async (conf) => {
            if (conf) {
                if (transactions && currentTransactionId) {
                    const res = await axios.put(
                        route(
                            "transaction.cashier.hold-transaction",
                            currentTransactionId
                        )
                    );

                    if (res.data.type_message == "success") {
                        window.location.reload();
                    }
                } else {
                    swal(
                        "Sorry, you cannot hold this transaction because there are transaction on going."
                    );
                }
            }
        });
    };

    const submitTransaction = async () => {
        const transactionID = spanTransactionID.current?.textContent;
        if (transactionID != "") {
            try {
                setLoading(true);
                const res = await axios.post(
                    route("transaction.cashier.submit-transaction", {
                        transactionID,
                    }),
                    {
                        transactions,
                    }
                );
                console.log(res);
            } catch (error) {
                setLoading(false);
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

    const currentTransaction = transactions.find(
        (transaction) => transaction.id === currentTransactionId
    );

    const totalPrice = useMemo(() => {
        const total =
            currentTransaction?.products?.reduce((total, product) => {
                return total + (product.total_price || 0);
            }, 0) || 0;
        return Math.round(total);
    }, [currentTransaction]);

    const totalPPN = useMemo(() => Math.round(totalPrice * 0.1), [totalPrice]);

    const totalPayment = useMemo(
        () => Math.round(totalPrice + totalPPN),
        [totalPrice]
    );

    useEffect(() => {
        if (currentTransaction) {
            const totalPayment = totalPrice + totalPPN;

            currentTransaction.total_price = totalPrice;
            currentTransaction.ppn = totalPPN;
            currentTransaction.total_payment = totalPayment;

            if (spanTotalPrice.current) {
                spanTotalPrice.current.textContent = formatRupiah(
                    currentTransaction.total_price
                );
            }
            if (spanTotalPPN.current) {
                spanTotalPPN.current.textContent = formatRupiah(
                    currentTransaction.ppn
                );
            }
            if (spanTotalPayment.current) {
                spanTotalPayment.current.textContent =
                    formatRupiah(totalPayment);
            }

            saveTransaction(transactions);
        }
    }, [totalPrice, totalPPN, currentTransaction]);

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
                format(new Date(row.created_at), "yyyy-MM-dd"),
            sortable: true,
        },
    ];

    const listHoldTransaction = async () => {
        try {
            const res = await axios.get(
                route("transaction.cashier.get-data-transactions", "hold")
            );
            const transactions = res.data.transactions;
            if (transactions) {
                setHoldTransactions(transactions);
            }

            setOpenModal(true);
        } catch (error) {
            console.log(error);
        }
    };

    const [holdTransactionId, setTransactionId] = useState<string | null>(null);

    const [
        modalSelectDataHoldTransaction,
        setModalSelectedDataHoldTransaciton,
    ] = useState(false);

    const doubleClickHandleTableHoldTransaction = (row: any) => {
        if (row.id) {
            setTransactionId(row.id);
            setModalSelectedDataHoldTransaciton(true);
        }
    };

    const { data, setData, post, put, processing, errors } = useForm({
        id: "",
        products: [
            {
                id: "",
                barcode: "",
                product_name: "",
                quantity: "",
                price: "",
                discount: "",
                total_price: "",
                category: "",
            },
        ],
        total_price: "",
        ppn: "",
        total_payment: "",
    });

    const updateHoldTransaction = async () => {
        if (holdTransactionId) {
            // const res = await put(route(), {});
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
                    show={modalSelectDataHoldTransaction}
                    size="md"
                    onClose={() => setModalSelectedDataHoldTransaciton(false)}
                    popup
                >
                    <Modal.Header />
                    <Modal.Body>
                        <div className="text-center">
                            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                                Are you sure you want to select this data?
                            </h3>
                            <div className="flex justify-center gap-4">
                                <Button disabled={loading}>
                                    {loading ? (
                                        <ClipLoader size={20} />
                                    ) : (
                                        "Yes, I'm sure"
                                    )}
                                </Button>
                                <Button
                                    color="gray"
                                    onClick={() =>
                                        setModalSelectedDataHoldTransaciton(
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
                    show={openModal}
                    onClose={() => setOpenModal(false)}
                    className="w-full h-full"
                >
                    <Modal.Header>
                        <h1>List Hold Transaction</h1>
                    </Modal.Header>
                    <Modal.Body>
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
                            onClick={() => setOpenModal(false)}
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
                            <Table.HeadCell>Total Price</Table.HeadCell>
                        </Table.Head>
                        <Table.Body className="divide-y">
                            {transactions.map((transaction) =>
                                transaction.products?.map(
                                    (product: Product, index) => (
                                        <Table.Row
                                            key={product.id}
                                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                                        >
                                            <Table.Cell>
                                                {product.product_name}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {
                                                    product.category
                                                        ?.category_name
                                                }
                                            </Table.Cell>
                                            <Table.Cell>
                                                <TextInput
                                                    type="number"
                                                    value={product.quantity.toString()}
                                                    onChange={async (e) => {
                                                        const updatedProducts =
                                                            [
                                                                ...(transaction.products ||
                                                                    []),
                                                            ];
                                                        updatedProducts[
                                                            index
                                                        ].quantity = parseInt(
                                                            e.target.value
                                                        );
                                                        updatedProducts[
                                                            index
                                                        ].total_price =
                                                            calculateTotalPrice(
                                                                updatedProducts[
                                                                    index
                                                                ].price,
                                                                updatedProducts[
                                                                    index
                                                                ].quantity,
                                                                updatedProducts[
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
                                                                                    updatedProducts,
                                                                            };
                                                                        }
                                                                        return t;
                                                                    }
                                                                )
                                                        );

                                                        await saveTransaction(
                                                            transactions
                                                        );
                                                    }}
                                                />
                                            </Table.Cell>
                                            <Table.Cell>
                                                {formatRupiah(product.price)}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {loading ? (
                                                    <BeatLoader />
                                                ) : (
                                                    <TextInput
                                                        type="number"
                                                        value={product.discount.toString()}
                                                        onChange={async (e) => {
                                                            const updatedProducts =
                                                                [
                                                                    ...(transaction.products ||
                                                                        []),
                                                                ];
                                                            updatedProducts[
                                                                index
                                                            ].discount =
                                                                parseInt(
                                                                    e.target
                                                                        .value
                                                                );
                                                            updatedProducts[
                                                                index
                                                            ].total_price =
                                                                calculateTotalPrice(
                                                                    updatedProducts[
                                                                        index
                                                                    ].price,
                                                                    updatedProducts[
                                                                        index
                                                                    ].quantity,
                                                                    updatedProducts[
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
                                                                                        updatedProducts,
                                                                                };
                                                                            }
                                                                            return t;
                                                                        }
                                                                    )
                                                            );

                                                            await saveTransaction(
                                                                transactions
                                                            );
                                                        }}
                                                    />
                                                )}
                                            </Table.Cell>
                                            <Table.Cell>
                                                {formatRupiah(
                                                    product.total_price
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
                    <div className="border border-gray-300 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <div className="flex justify-between">
                            <span>Transaction ID:</span>
                            <span ref={spanTransactionID}></span>
                        </div>
                        <div className="flex justify-between">
                            <span>Total Price:</span>
                            <span ref={spanTotalPrice}></span>
                        </div>
                        <div className="flex justify-between">
                            <span>PPN (10%):</span>
                            <span ref={spanTotalPPN}></span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-semibold">
                            <span>Total Payment:</span>
                            <span ref={spanTotalPayment}></span>
                        </div>
                    </div>
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
                                    onClick={() => holdTransaction()}
                                >
                                    Hold
                                </Button>
                                <Button
                                    color="success"
                                    className="ms-3"
                                    onClick={() => submitTransaction()}
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
