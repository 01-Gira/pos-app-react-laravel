import BarChartComponent from "@/Components/BarChartComponent";
import LineChartComponent from "@/Components/LineChartComponent";
import PieChartComponent from "@/Components/PieChartComponent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Purchase, PurchaseDetail, Transaction, TransactionDetail } from "@/types";
import { formatRupiah, getFirstDayOfMonth, getLastDayOfMonth, randomColor } from "@/utils/Utils";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { eachDayOfInterval, format, parseISO } from "date-fns";
import { id } from "date-fns/locale/id";
import { Button, Datepicker, FloatingLabel, Label, Modal, Select } from "flowbite-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import DataTable, { TableColumn } from "react-data-table-component";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";
import Swal from "sweetalert2";

export default function Transactions({ title, auth, flash, categories }: PageProps) {

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [purchases, setPurchases] = useState<Purchase[]>([]);

    const [dataDetails, setDataDetails] = useState<TransactionDetail[]>([]);

    const [transactionPagination, setTransactionPagination] = useState<any>({});
    const [purchasePagination, setPurchasePagination] = useState<any>({});

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    const [searchQueryTransaction, setSearchQueryTransaction] = useState<string>('');
    const [searchQueryPurchase, setSearchQueryPurchase] = useState<string>('');

    const [currentPageTransaction, setCurrentPageTransaction] = useState<number>(1);
    const [currentPagePurchase, setCurrentPagePurchase] = useState<number>(1);

    const [rowsPerPageTransaction, setRowsPerPageTransaction] = useState<number>(5);
    const [rowsPerPagePurchase, setRowsPerPagePurchase] = useState<number>(5);

    const [selectedRowsTransaction, setSelectedRowsTransaction] = useState<Transaction[]>([]);
    const [selectedRowsPurchase, setSelectedRowsPurchase] = useState<PurchaseDetail[]>([]);
    const [toggleClearedTransaction, setToggleClearedTransaction] = useState<boolean>(false);
    const [toggleClearedPurchase, setToggleClearedPurchase] = useState<boolean>(false);

    const [pendingTransactions, setPendingTransactions] = useState<boolean>(false);
    const [pendingPurchases, setPendingPurchases] = useState<boolean>(false);

    const fetchDataTransactions = async (params:any) => {
        setPendingTransactions(true);
        try {
            const res = await axios.get(route('report.transactions.get-transactions'), { params });
            const data = res.data;
            if (data) {
                setTransactions(data.transactions);
                setCurrentPageTransaction(data.pagination.current_page);
                setTransactionPagination(data.pagination.total_items);
                setRowsPerPageTransaction(data.pagination.per_page);

                setStartDate(data.start_date || startDate);
                setEndDate(data.end_date || endDate);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setPendingTransactions(false);
        }
    };

    const fetchDataPurchases = async (params:any) => {
        setPendingPurchases(true);
        try {
            const res = await axios.get(route('report.transactions.get-purchases'), { params });
            const data = res.data;

            if (data) {
                setPurchases(data.purchases);
                setCurrentPagePurchase(data.pagination.current_page);
                setPurchasePagination(data.pagination.total_items);
                setRowsPerPagePurchase(data.pagination.per_page);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setPendingPurchases(false);
        }
    };

    const onPageChangeTransaction = (page: number) => {
        setCurrentPageTransaction(page);
        fetchDataTransactions({
            search: searchQueryTransaction,
            page,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter
        });
    };

    const onPageChangePurchase = (page: number) => {
        setCurrentPagePurchase(page);
        fetchDataPurchases({
            search: searchQueryPurchase,
            page,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter
        });
    };

    const onRowsPerPageChangeTransaction = (newRowsPerPage: number, page: number) => {
        setRowsPerPageTransaction(newRowsPerPage);
        fetchDataTransactions({
            search: searchQueryTransaction,
            page,
            per_page: newRowsPerPage,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter
        });
    };

    const onRowsPerPageChangePurchase = (newRowsPerPage: number, page: number) => {
        setRowsPerPagePurchase(newRowsPerPage);
        fetchDataPurchases({
            search: searchQueryPurchase,
            page,
            per_page: newRowsPerPage,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter
        });
    };

    const onSearchChangeTransaction = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQueryTransaction(event.target.value);
        fetchDataTransactions({
            search: event.target.value,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter
        });
    };

    const onSearchChangePurchase = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQueryPurchase(event.target.value);

        fetchDataPurchases({
            search: event.target.value,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter
        });
    };

    const onStartDateChange = (date: Date) => {
        const newDate = format(new Date(date), "yyyy-MM-dd");

        setStartDate(newDate);

        fetchDataPurchases({
            search: searchQueryPurchase,
            page: 1,
            start_date: newDate,
            end_date: endDate,
            status: statusFilter
        });

        fetchDataTransactions({
            search: searchQueryPurchase,
            page: 1,
            start_date: newDate,
            end_date: endDate,
            status: statusFilter
        });
    };

    const onEndDateChange = (date: Date) => {
        const newDate = format(new Date(date), "yyyy-MM-dd");

        setEndDate(newDate);

        fetchDataPurchases({
            search: searchQueryPurchase,
            page: 1,
            start_date: startDate,
            end_date: newDate,
            status: statusFilter
        });

        fetchDataTransactions({
            search: searchQueryPurchase,
            page: 1,
            start_date: startDate,
            end_date: newDate,
            status: statusFilter
        });
    };

    const onStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setStatusFilter(e.target.value);

        fetchDataPurchases({
            search: searchQueryPurchase,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            status: e.target.value
        });

        fetchDataTransactions({
            search: searchQueryPurchase,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            status: e.target.value
        });
    };

    const onPaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setPaymentMethodFilter(e.target.value);

        fetchDataPurchases({
            search: searchQueryPurchase,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter,
            category: categoryFilter,
            payment_method: e.target.value
        });

        fetchDataTransactions({
            search: searchQueryPurchase,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter,
            category: categoryFilter,
            payment_method: e.target.value
        });
    };

    const onCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryFilter(e.target.value);

        fetchDataPurchases({
            search: searchQueryPurchase,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            category: e.target.value
        });

        fetchDataTransactions({
            search: searchQueryPurchase,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            status: statusFilter,
            payment_method: paymentMethodFilter,
            category: e.target.value
        });
    };


    const doubleClickTransactionDetail = async (row: Transaction) => {
        setPendingTransactions(true);
        try {
            const res = await axios.get(route('report.transactions.get-detail-products', row.id), {
                params: { type: 'cashier' }
            });
            const data = res.data.data;
            if (data) {
                setDataDetails(data);
            }
        } catch (error) {
            console.error("Error fetching transaction details:", error);

        } finally {
            setPendingTransactions(false);
        }
    };

    const doubleClickPurchaseDetail = async (row: Purchase) => {
        setPendingTransactions(true);
        try {
            const res = await axios.get(route('report.transactions.get-detail-products', row.id), {
                params: { type: 'purchase' }
            });
            const data = res.data.data;
            if (data) {
                setDataDetails(data);
            }
        } catch (error) {
            console.error("Error fetching purchase details:", error);

        } finally {
            setPendingTransactions(false);
        }
    };

    const columnsTransaction: TableColumn<Transaction>[] = [
        {
            name: "Transaction ID",
            selector: (row: Transaction) => row.id,
            sortable: true,
        },
        {
            name: "Payment Method",
            selector: (row: Transaction) => row.payment_method,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: Transaction) => row.status,
            sortable: true,
        },
        {
            name: "Subtotal",
            selector : (row: Transaction) => formatRupiah(row.subtotal),
            sortable: true,
        },
        {
            name: "PPN",
            selector : (row: Transaction) => formatRupiah(row.ppn),
            sortable: true,
        },
        {
            name: "Total Payment",
            selector : (row: Transaction) => formatRupiah(row.total_payment),
            sortable: true,
        },
        {
            name: "Transaction Date",
            selector: (row: Transaction) =>
                format(new Date(row.transaction_date), "dd MMMM yyyy HH:mm:ss"),
            sortable: true,
        },
    ];


    const columnsPurchase: TableColumn<Purchase>[] = [
        {
            name: "Purchase ID",
            selector: (row: Purchase) => row.id,
            sortable: true,
        },
        {
            name: "Payment Method",
            selector: (row: Purchase) => row.payment_method,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: Purchase) => row.status,
            sortable: true,
        },
        {
            name: "Subtotal",
            selector : (row: Purchase) => formatRupiah(row.subtotal),
            sortable: true,
        },
        {
            name: "PPN",
            selector : (row: Purchase) => formatRupiah(row.ppn),
            sortable: true,
        },
        {
            name: "Total Payment",
            selector : (row: Purchase) => formatRupiah(row.total_payment),
            sortable: true,
        },
        {
            name: "Purchase Date",
            selector: (row: Purchase) =>
                format(new Date(row.purchase_date), "dd MMMM yyyy HH:mm:ss"),
            sortable: true,
        },
    ];

    const columnsDetails: TableColumn<PurchaseDetail>[] = [
        {
            name: "Product Name",
            selector: (row: PurchaseDetail) => row.product?.product_name,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row: PurchaseDetail) => row.product?.category?.category_name || '',
            sortable: true,
        },
        {
            name: "Quantity",
            selector: (row: PurchaseDetail) => row.quantity,
            sortable: true,
        },
        {
            name: "Price",
            selector: (row: PurchaseDetail) => formatRupiah(row.price),
            sortable: true,
        },
        {
            name: "Discount",
            selector: (row: PurchaseDetail) => row.discount,
            sortable: true,
        },
        {
            name: "Total Price",
            selector: (row: PurchaseDetail) => formatRupiah(row.total_price),
            sortable: true,
        }
    ];

    const handleChangeTransaction = (rows: any) => {
        console.log(rows);
    };

    const handleChangePurchase = (rows: any) => {
        console.log(rows);
    };

    const handleClearRows = () => {
        setToggleClearedTransaction(!toggleClearedTransaction);
        setToggleClearedPurchase(!toggleClearedPurchase);
    };

    const totalIncome = transactions.reduce((total, transaction) => total + transaction.total_payment, 0);

    const totalExpenses = purchases.reduce((total, purchase) => total + purchase.total_payment, 0);

    const contextActionsTransaction = useMemo(() => {
        const handleDeleteTransaction = () => {
            if (window.confirm(`Are you sure you want to delete:\r ${selectedRowsTransaction.map(r => r.id)}?`)) {
            }
        };

        return (
            <Button onClick={handleDeleteTransaction} style={{ backgroundColor: 'red' }}>
                Delete
            </Button>
        );
    }, [selectedRowsTransaction, toggleClearedTransaction]);

    const contextActionsPurchase = useMemo(() => {
        const handleDeletePurchase = () => {
            if (window.confirm(`Are you sure you want to delete:\r ${selectedRowsPurchase.map(r => r.id)}?`)) {
            }
        };

        return (
            <Button onClick={handleDeletePurchase} style={{ backgroundColor: 'red' }}>
                Delete
            </Button>
        );
    }, [selectedRowsPurchase, toggleClearedPurchase]);

    let dateRange: string[] = [];

    if (startDate && endDate) {
        dateRange = eachDayOfInterval({
            start: parseISO(format(startDate, 'yyyy-MM-dd')),
            end: parseISO(format(endDate, 'yyyy-MM-dd')),
        }).map(date => format(date, 'dd MMMM yyyy'));
    }

    const dataSetData1 = dateRange.map(date => {
        const transactionsOnDate = transactions.filter( transaction => {
            const transactionDate = new Date(transaction.transaction_date);
            const formattedPurchaseDate = format(transactionDate, 'dd MMMM yyyy');

            return formattedPurchaseDate === date;
        });

        const totalPayment = transactionsOnDate.reduce((sum, transaction) => sum + transaction.total_payment, 0);
        return totalPayment;
    });


    const dataSetData2 = dateRange.map(date => {
        const purchasesOnDate = purchases.filter(purchase => {
            const purchaseDate = new Date(purchase.purchase_date);
            const formattedPurchaseDate = format(purchaseDate, 'dd MMMM yyyy');

            return formattedPurchaseDate === date;
        });

        const totalPayment = purchasesOnDate.reduce((sum, purchase) => sum + purchase.total_payment, 0);
        return totalPayment;
    });

    const datasets = [
        {
            label: 'Total Income',
            backgroundColor: 'rgba(92, 184, 92, 0.2)',
            borderColor: 'rgba(92, 184, 92, 1)',
            borderWidth: 2,
            data: dataSetData1,
        },
        {
            label: 'Total Expenses',
            backgroundColor: 'rgba(217, 83, 79, 0.2)',
            borderColor: 'rgba(217, 83, 79, 1)',
            borderWidth: 2,
            data: dataSetData2,
        },
    ];

    const labelTransactionCategories: string[] = Array.from(new Set(
        transactions
            .flatMap(value => value.transaction_details.map(detail => detail.product.category?.category_name))
            .filter((name): name is string => name !== undefined)
    ));

    const labelPurchaseCategories: string[] = Array.from(new Set(
        purchases
            .flatMap(value => value.purchase_details.map(detail => detail.product.category?.category_name))
            .filter((name): name is string => name !== undefined)
    ));

    const dataChartCategoryTransactions: number[] = labelTransactionCategories.map(label => {
        // Filter transactions based on category label
        const transactionsForCategory = transactions
            .filter(transaction =>
                transaction.transaction_details.some(detail =>
                    detail.product.category?.category_name === label
                )
            );

        // Calculate total payment for the current category
        const totalTotalPayment = transactionsForCategory.reduce((sum, transaction) => {
            return sum + transaction.total_payment;  // Accessing total_payment from Transaction interface
        }, 0);

        return totalTotalPayment;
    });


    const dataChartCategoryPurchases: number[] = labelPurchaseCategories.map(label => {
        const purchasesForCategory = purchases
            .filter(purcahse =>
                purcahse.purchase_details.some(detail =>
                    detail.product.category?.category_name === label
                )
            );

        // Calculate total payment for the current category
        const totalTotalPayment = purchasesForCategory.reduce((sum, purchase) => {
            return sum + purchase.total_payment;  // Accessing total_payment from Transaction interface
        }, 0);

        return totalTotalPayment;
    });

    const color: string[] = labelTransactionCategories.map(() => randomColor());


    const datasetCategory = [
        {
            label: 'Total Income',
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            data: dataChartCategoryTransactions,
        },
        {
            label: 'Total Expenses',
            backgroundColor: color,
            borderColor: color,
            borderWidth: 1,
            data: dataChartCategoryPurchases,
        }
    ];

    const labelProductTransactions: string[] = Array.from(new Set(
        transactions
            .flatMap(value => value.transaction_details.map(detail => detail.product.product_name))
            .filter((name): name is string => name !== undefined)
    ));

    const labelProductPurchases: string[] = Array.from(new Set(
        purchases
            .flatMap(value => value.purchase_details.map(detail => detail.product.product_name))
            .filter((name): name is string => name !== undefined)
    ));

    const dataChartProductTransactions: number[] = labelProductTransactions.map(label => {
        // Filter transactions based on category label
        const transactionsForCategory = transactions
            .filter(transaction =>
                transaction.transaction_details.some(detail =>
                    detail.product.product_name === label
                )
            );

        // Calculate total payment for the current category
        const totalTotalPayment = transactionsForCategory.reduce((sum, transaction) => {
            return sum + transaction.total_payment;  // Accessing total_payment from Transaction interface
        }, 0);

        return totalTotalPayment;
    });

    const dataChartProductPurchases: number[] = labelProductTransactions.map(label => {
        // Filter transactions based on category label
        const purchasesForProduct = purchases
            .filter(transaction =>
                transaction.purchase_details.some(detail =>
                    detail.product.product_name === label
                )
            );

        // Calculate total payment for the current Product
        const totalTotalPayment = purchasesForProduct.reduce((sum, transaction) => {
            return sum + transaction.total_payment;  // Accessing total_payment from Transaction interface
        }, 0);

        return totalTotalPayment;
    });


    const datasetProduct = [
        {   label: 'Total Income',
            backgroundColor: 'rgba(92, 184, 92, 0.2)',
            borderColor: 'rgba(92, 184, 92, 1)',
            borderWidth: 1,
            data: dataChartProductTransactions
        },
        {
            label: 'Total Expenses',
            backgroundColor: 'rgba(217, 83, 79, 0.2)',
            borderColor: 'rgba(217, 83, 79, 1)',
            borderWidth: 2,
            data: dataChartProductPurchases,
        }

    ];


    return (
        <AuthenticatedLayout
            flash={flash}
            user={auth.user}
            header={
                <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                    {title}
                </h2>
            }
        >
            <Head title={title} />
            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                <h2>Filter</h2>
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
                            <option value="completed">Completed</option>
                            <option value="hold">Hold</option>
                            <option value="process">Process</option>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="payment_method" value="Payment Method" />
                        <Select
                            id="payment_method"
                            value={paymentMethodFilter}
                            onChange={onPaymentMethodChange}
                            required
                        >
                            <option value="">Select</option>
                            <option value="cash">Cash</option>
                            <option value="credit">Credit</option>
                        </Select>
                    </div>
                    {/* <div>
                        <Label htmlFor="category" value="Category" />
                        <Select
                            id="category"
                            value={categoryFilter}
                            onChange={onCategoryChange}
                            required
                        >
                            <option value="">Select</option>
                            {categories.map(value => (
                                <option key={value.id} value={value.id}>{value.category_name}</option>
                            ))}
                        </Select>
                    </div> */}
                </div>
            </div>

            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                <div className="grid grid-cols-2 gap-4 mt-5 mb-5">
                    <div className="bg-green-200 p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-2">Total Income with {rowsPerPageTransaction} Data</h3>
                        <p className="text-gray-700">Total: {formatRupiah(totalIncome)}</p>
                    </div>
                    <div className="bg-red-200 p-4 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold mb-2">Total Expenses with {rowsPerPagePurchase} Data</h3>
                        <p className="text-gray-700">Total: {formatRupiah(totalExpenses)}</p>
                    </div>
                </div>
                <div>
                    <h2>By Date</h2>
                    <div className="grid grid-cols-2 gap-4 mt-5 mb-5">
                        <LineChartComponent labels={dateRange} datasets={datasets} />
                        <BarChartComponent labels={dateRange} datasets={datasets} />
                    </div>
                </div>
                <div>
                    <h2>By Product</h2>
                    <div className="grid grid-cols-2 gap-4 mt-5 mb-5">
                        <LineChartComponent labels={labelProductTransactions} datasets={datasetProduct} />
                        <BarChartComponent labels={labelProductPurchases} datasets={datasetProduct} />
                    </div>
                </div>
                <div>
                    <h2>By Category</h2>
                    <div className="grid grid-cols-1 gap-4 mt-5 mb-5">
                        <PieChartComponent labels={labelTransactionCategories} datasets={datasetCategory}/>

                    </div>
                </div>

            </div>

            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                <h2>Transactions</h2>
                <div className="flex justify-end">
                    <FloatingLabel
                        variant="outlined"
                        value={searchQueryTransaction}
                        onChange={onSearchChangeTransaction}
                        label="Search..."
                    />
                </div>
                <div className="overflow-x-auto">
                    <DataTable
                        columns={columnsTransaction}
                        data={transactions}
                        pagination
                        paginationServer
                        paginationPerPage={rowsPerPageTransaction}
                        paginationTotalRows={transactionPagination}
                        paginationDefaultPage={currentPageTransaction}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, transactionPagination]}
                        onChangePage={onPageChangeTransaction}
                        onChangeRowsPerPage={onRowsPerPageChangeTransaction}
                        highlightOnHover
                        persistTableHead
                        onRowDoubleClicked={doubleClickTransactionDetail}
                        progressPending={pendingTransactions}
                    />
                </div>
            </div>

            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                <h2>Purchases</h2>
                <div className="flex justify-end">
                    <FloatingLabel
                        variant="outlined"
                        value={searchQueryPurchase}
                        onChange={onSearchChangePurchase}
                        label="Search..."
                    />
                </div>
                <div className="overflow-x-auto">
                    <DataTable
                        columns={columnsPurchase}
                        data={purchases}
                        pagination
                        paginationServer
                        paginationPerPage={rowsPerPagePurchase}
                        paginationTotalRows={purchasePagination}
                        paginationDefaultPage={currentPagePurchase}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, purchasePagination]}
                        onChangePage={onPageChangePurchase}
                        onChangeRowsPerPage={onRowsPerPageChangePurchase}
                        highlightOnHover
                        persistTableHead
                        onRowDoubleClicked={doubleClickPurchaseDetail}
                        progressPending={pendingPurchases}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                    <h2>Transaction Details</h2>
                    <DataTable
                        highlightOnHover
                        persistTableHead
                        pagination
                        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                        columns={columnsDetails}
                        data={transactions.flatMap(value => value.transaction_details)}
                    />
                </div>

                <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                    <h2>Purchase Details</h2>

                    <DataTable
                        highlightOnHover
                        persistTableHead
                        pagination
                        paginationRowsPerPageOptions={[5, 10, 25, 50, 100]}
                        columns={columnsDetails}
                        data={purchases.flatMap(value => value.purchase_details)}
                    />
                </div>
            </div>


        </AuthenticatedLayout>
    );
}

