import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    HoldTransaction,
    PageProps,
    TransactionDetail,
    Transaction,
    Purchase,
    PurchaseDetail,
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
import { formatRupiah, Toast } from "@/utils/Utils";
import { BeatLoader, ClipLoader } from "react-spinners";
import { HiOutlineExclamationCircle } from "react-icons/hi";
import DataTable, { TableColumn } from "react-data-table-component";
import { format } from "date-fns";
import { redirect } from "react-router-dom";
import { stringify } from "querystring";
import Swal from "sweetalert2";

export default function Index({ title, auth, flash, suppliers }: PageProps) {
    const [purchase, setPurchase] = useState<Purchase>();

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

    const barcodeInput = useRef<HTMLInputElement>(null);

    const buttonTransaction = useRef<HTMLButtonElement>(null);
    const [loading, setLoading] = useState(false);

    const purchaseId = purchase?.id || null;

    const selectSupplier = useRef<HTMLSelectElement>(null);

    const newPurchase = async () => {
        try {
            setLoading(true);

            if(!purchase?.supplier_id){
                setLoading(false);

                // Swal.fire({
                //     buttonsStyling: false,
                //     customClass: swalCustomClass,
                //     icon: "info",
                //     title: "Info",
                //     text: "Please select supplier first",
                // });

                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                    text: "Please select supplier first",
                  })

                return;
            }

            if (purchaseId) {
                setLoading(false);

                // Swal.fire({
                //     buttonsStyling: false,
                //     customClass: swalCustomClass,
                //     icon: "info",
                //     title: "Info",
                //     text: "There is a purchase in progress. You can't create a new purchase",
                // });

                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                    text: "There is a purchase in progress. You can't create a new purchase",
                  })

                return;
            }

            const res = await axios.post(
                route("transaction.purchase-products.new-purchase")
            );

            if(res.data.indctr === 1){
                const purchase = res.data.purchase;

                if (purchase) {
                    if (barcodeInput.current) {
                        barcodeInput.current.disabled = false;
                    }
                    if (selectSupplier.current) {
                        selectSupplier.current.disabled = true;
                    }
                    setPurchase((prevPurchase) => {
                        if (!prevPurchase) return prevPurchase;

                        return {
                            ...prevPurchase,
                            id: purchase.id,
                            purchase_details: [],
                            payment_method: null,
                            subtotal: 0,
                            ppn: 0,
                            status: "process",
                            total_payment: 0,
                            purchase_date: new Date(),
                            created_at: new Date(),
                            updated_at: new Date()
                        };
                    });
                }
            }else{
                // Swal.fire({
                //     buttonsStyling: false,
                //     customClass: swalCustomClass,
                //     icon: "info",
                //     title: "Info",
                //     text: res.data.message,
                // });

                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                    text: res.data.message,
                  })
            }

            setLoading(false);
        } catch (error : any) {
            setLoading(false);

            await Toast.fire({
                icon: "error",
                title: "Error",
                text: error.message,
              })
        }
    };

    const getDataProduct = async (barcode: string) => {
        try {
            setLoading(true);
            const res = await axios.get(
                route("master.products.get-data-barcode", barcode)
            );

            const product = res.data.product;

            if(res.data.indctr === 1){
                if (product) {
                    setPurchase((prevPurchase) => {
                        if (!prevPurchase) return prevPurchase;

                        const existingProductIndex =
                            prevPurchase.purchase_details.findIndex(
                                (d) => d.product.id === product.id
                            );

                        if (existingProductIndex !== -1) {
                            // Update existing product details
                            const updatedPurchaseDetails = [
                                ...prevPurchase.purchase_details,
                            ];
                            updatedPurchaseDetails[
                                existingProductIndex
                            ].quantity += 1;
                            updatedPurchaseDetails[
                                existingProductIndex
                            ].total_price = calculateTotalPrice(
                                updatedPurchaseDetails[existingProductIndex].price,
                                updatedPurchaseDetails[existingProductIndex]
                                    .quantity,
                                updatedPurchaseDetails[existingProductIndex]
                                    .discount
                            );

                            console.log("updated", updatedPurchaseDetails);
                            return {
                                ...prevPurchase,
                                purchase_details: updatedPurchaseDetails,
                            };
                        } else {
                            // Add new product details
                            const newPurchaseDetail: PurchaseDetail = {
                                id: product.id,
                                purchase_id : '',
                                quantity: 1,
                                discount: product.discount | 0,
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
                                ...prevPurchase,
                                purchase_details: [
                                    ...prevPurchase.purchase_details,
                                    newPurchaseDetail,
                                ],
                            };
                        }
                    });

                    await Toast.fire({
                        icon: "success",
                        title: "Success",
                        text: res.data.message,
                      })
                    await savePurchase();
                }
            }else{
                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                    text: res.data.message,
                  })
            }


            if (barcodeInput.current) {
                barcodeInput.current.value = "";
            }
        } catch (error : any) {
            if (barcodeInput.current) {
                barcodeInput.current.value = "";
            }
            setLoading(false);

            await Toast.fire({
                icon: "error",
                title: "Error",
                text: error.message,
              })
        }
    };

    const savePurchase = async () => {
        setLoading(true);
        try {
            if(!purchaseId){
                // Swal.fire({
                //     customClass: swalCustomClass,
                //     icon: "warning",
                //     title: "Warning",
                //     text: "There is no purchase in progress",
                // });


                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                    text: "There is no purchase in progress",
                  })
                return;
            }

            const res = await axios.post(
                route("transaction.purchase-products.store"),
                {
                    purchase,
                }
            );



            if(res.data.indctr === 0){
                // Swal.fire({
                //     icon: "warning",
                //     title: "Warning",
                //     text: res.data.message,
                // });

                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                    text: res.data.message,
                  })
            }

            if (barcodeInput.current) {
                barcodeInput.current.value = "";
            }
        } catch (error : any) {
            await Toast.fire({
                icon: "error",
                title: "Error",
                text: error.message,
              })
        } finally {
            setLoading(false);
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
        if (!purchase) return;

        const subtotal =
            purchase.purchase_details?.reduce((total, detail) => {
                return total + (detail.total_price || 0);
            }, 0) || 0;

        const totalPPN = Math.round(subtotal * 0.1);
        const totalPayment = Math.round(subtotal + totalPPN);

        // Pastikan bahwa hanya mengubah purchase jika ada perubahan
        if (
            purchase.subtotal !== subtotal ||
            purchase.ppn !== totalPPN ||
            purchase.total_payment !== totalPayment
        ) {
            setPurchase((prevPurchase) => {
                if (!prevPurchase) return prevPurchase;

                return {
                    ...prevPurchase,
                    subtotal: subtotal,
                    ppn: totalPPN,
                    total_payment: totalPayment,
                };
            });
        }
    }, [purchase]);

    const columns: TableColumn<HoldTransaction>[] = [
        {
            name: "Uniq Code",
            selector: (row: HoldTransaction) => row.id,
            sortable: true,
        },
        {
            name: "Supplier Name",
            selector: (row: HoldTransaction) => row.status,
            sortable: true,
        },
    ];

    const [supplierIdToSave, setSupplierIdToSave] = useState<string | null>(
        null
    );

    const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

    useEffect(() => {
        if (paymentMethod !== null) {
            const save = async () => {
                await savePurchase();
                setPaymentMethod(null);
            };

            save();
        }
    }, [paymentMethod]);

    useEffect(() => {
        const save = async () => {
            if (
                purchaseId &&
                purchase &&
                purchase.purchase_details &&
                purchase.purchase_details.length > 0
            ) {
                await savePurchase();
            }
        };

        save();
    }, [purchase]);

    const submitPurchase = async () => {
        try {
            setLoading(true);
            if (
                !purchaseId &&
                !purchase
            ) {
                setLoading(false);

                // Swal.fire({
                //     buttonsStyling: false,
                //     customClass: swalCustomClass,
                //     icon: "info",
                //     title: "Info",
                //     text: "There is no purchase in progress or products list is empty",
                // });

                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                     text: "There is no purchase in progress or products list is empty",
                  })
                return;
            }

            if(purchase?.payment_method == '' || purchase?.payment_method == null) {
                setLoading(false);

                // Swal.fire({
                //     buttonsStyling: false,
                //     customClass: swalCustomClass,
                //     icon: "info",
                //     title: "Info",
                //     text: "Please select payment method first!",
                // });

                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                    text: "Please select payment method first!",
                  })

                return;
            }

            const res = await axios.post(
                route("transaction.purchase-products.submit"),
                {
                    purchase,
                }
            );

            if (res.data.indctr === 1) {
                window.location.reload();
            }else{
                // Swal.fire({
                //     icon: "warning",
                //     title: "Warning",
                //     text: res.data.message,
                // });

                await Toast.fire({
                    icon: "warning",
                    title: "Warning",
                    text: res.data.message,
                  })
            }

            setLoading(false);
        } catch (error : any) {
            setLoading(false);

            await Toast.fire({
                icon: "error",
                title: "Error",
                text: error.message,
              })
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
                        <Select
                            ref={selectSupplier}
                            value={purchase?.supplier_id}
                            onChange={(e) => {
                                setPurchase({
                                    id: "",
                                    supplier_id: e.target.value,
                                    purchase_details: [],
                                    payment_method: null,
                                    subtotal: 0,
                                    ppn: 0,
                                    status: "process",
                                    total_payment: 0,
                                    purchase_date: new Date(),
                                    created_at: new Date(),
                                    updated_at: new Date(),
                                    supplier : null
                                });

                                setSupplierIdToSave(e.target.value);
                            }}
                        >
                            <option value="">Select supplier</option>
                            {suppliers.map((value) => (
                                <option key={value.id} value={value.id}>
                                    {value.supplier_name}
                                </option>
                            ))}
                        </Select>
                        <Button
                            className="ms-3"
                            ref={buttonTransaction}
                            onClick={() => newPurchase()}
                        >
                            {loading ? (
                                <ClipLoader size={20} />
                            ) : (
                                "Add Stock Products"
                            )}
                        </Button>
                    </div>
                </div>

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
                            {purchase?.purchase_details?.map(
                                (detail: PurchaseDetail, index) => (
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
                                                onChange={(e) => {
                                                    const updatedPurchaseDetails =
                                                        [
                                                            ...(purchase.purchase_details ||
                                                                []),
                                                        ];
                                                    updatedPurchaseDetails[
                                                        index
                                                    ].quantity = parseInt(
                                                        e.target.value
                                                    );
                                                    updatedPurchaseDetails[
                                                        index
                                                    ].total_price =
                                                        calculateTotalPrice(
                                                            updatedPurchaseDetails[
                                                                index
                                                            ].price,
                                                            updatedPurchaseDetails[
                                                                index
                                                            ].quantity,
                                                            updatedPurchaseDetails[
                                                                index
                                                            ].discount
                                                        );

                                                    setPurchase(
                                                        (prevPurchase) => {
                                                            if (!prevPurchase)
                                                                return prevPurchase;

                                                            return {
                                                                ...prevPurchase,
                                                                purchase_details:
                                                                    updatedPurchaseDetails,
                                                            };
                                                        }
                                                    );
                                                }}
                                            />
                                        </Table.Cell>
                                        <Table.Cell>
                                                <TextInput
                                                type="number"
                                                value={detail.price}
                                                onChange={async(e) => {
                                                    const updatedPurchaseDetails =
                                                    [
                                                        ...(purchase.purchase_details || [])
                                                    ];

                                                    updatedPurchaseDetails[index].price = parseInt(e.target.value);
                                                    updatedPurchaseDetails[
                                                        index
                                                    ].total_price =
                                                        calculateTotalPrice(
                                                            updatedPurchaseDetails[
                                                                index
                                                            ].price,
                                                            updatedPurchaseDetails[
                                                                index
                                                            ].quantity,
                                                            updatedPurchaseDetails[
                                                                index
                                                            ].discount
                                                        );
                                                    setPurchase(
                                                        (prevPurchase) => {
                                                            if (!prevPurchase)
                                                                return prevPurchase;

                                                            return {
                                                                ...prevPurchase,
                                                                purchase_details:
                                                                    updatedPurchaseDetails,
                                                            };
                                                        }
                                                    );
                                                }}
                                                />
                                            </Table.Cell>
                                        <Table.Cell>
                                            {loading ? (
                                                <BeatLoader />
                                            ) : (
                                                <TextInput
                                                    type="number"
                                                    value={detail.discount.toString()}
                                                    onChange={(e) => {
                                                        const updatedPurchaseDetails =
                                                            [
                                                                ...(purchase.purchase_details ||
                                                                    []),
                                                            ];
                                                        updatedPurchaseDetails[
                                                            index
                                                        ].discount = parseInt(
                                                            e.target.value
                                                        );
                                                        updatedPurchaseDetails[
                                                            index
                                                        ].total_price =
                                                            calculateTotalPrice(
                                                                updatedPurchaseDetails[
                                                                    index
                                                                ].price,
                                                                updatedPurchaseDetails[
                                                                    index
                                                                ].quantity,
                                                                updatedPurchaseDetails[
                                                                    index
                                                                ].discount
                                                            );

                                                        setPurchase(
                                                            (prevPurchase) => {
                                                                if (
                                                                    !prevPurchase
                                                                )
                                                                    return prevPurchase;

                                                                return {
                                                                    ...prevPurchase,
                                                                    purchase_details:
                                                                        updatedPurchaseDetails,
                                                                };
                                                            }
                                                        );
                                                    }}
                                                />
                                            )}
                                        </Table.Cell>
                                        <Table.Cell>
                                            {formatRupiah(detail.total_price) ||
                                                0}
                                        </Table.Cell>
                                    </Table.Row>
                                )
                            )}
                        </Table.Body>
                    </Table>
                </div>

                <div className="mt-5">
                    <div
                        key={purchase?.id}
                        className="border border-gray-300 p-4 rounded-lg"
                    >
                        <h3 className="text-lg font-semibold mb-2">Summary</h3>
                        <div className="flex justify-between mb-1">
                            <span>Purchase ID:</span>
                            <span>{purchase?.id}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>Sub Total:</span>
                            <span>{formatRupiah(purchase?.subtotal)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>PPN (10%):</span>
                            <span>{formatRupiah(purchase?.ppn)}</span>
                        </div>
                        <div className="flex justify-between mb-1">
                            <span>Payment Method:</span>
                            <span>
                                <Select
                                    value={purchase?.payment_method}
                                    onChange={async (e) => {
                                        console.log(e.target.value);

                                        setPurchase((prevPurchase) => {
                                            if (!prevPurchase)
                                                return prevPurchase;

                                            return {
                                                ...prevPurchase,
                                                payment_method: e.target.value,
                                            };
                                        });

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
                            <span>{formatRupiah(purchase?.total_payment)}</span>
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
                                    onClick={() => submitPurchase()}
                                    color="success"
                                    className="ms-3"
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
