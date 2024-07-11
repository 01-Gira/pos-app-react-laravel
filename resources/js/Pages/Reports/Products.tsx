import BarChartComponent from "@/Components/BarChartComponent";
import LineChartComponent from "@/Components/LineChartComponent";
import PieChartComponent from "@/Components/PieChartComponent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Product, ProductTransaction, Purchase, PurchaseDetail, Transaction, TransactionDetail } from "@/types";
import { formatRupiah, getFirstDayOfMonth, getLastDayOfMonth, randomColor } from "@/utils/Utils";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import { eachDayOfInterval, format, isValid, parseISO } from "date-fns";
import { id } from "date-fns/locale/id";
import { Button, Datepicker, FloatingLabel, Label, Modal, Select } from "flowbite-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import DataTable, { TableColumn } from "react-data-table-component";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";
import Swal from "sweetalert2";

export default function Products({ title, auth, flash, categories }: PageProps) {

    const [products, setProducts] = useState<ProductTransaction[]>([]);
    const [transactionDetails, setTransactionDetails] = useState<TransactionDetail[]>([]);
    const [purchaseDetails, setPurchaseDetails] = useState<PurchaseDetail[]>([]);


    const [pagination, setPagination] = useState<any>({});

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('');

    const [searchQuery, setSearchQuery] = useState<string>('');

    const [currentPage, setCurrentPage] = useState<number>(1);

    const [rowsPerPage, setRowsPerPage] = useState<number>(5);

    const [selectedRows, setSelectedRows] = useState<[]>([]);
    const [toggleCleared, setToggleCleared] = useState<boolean>(false);

    const [pendings, setPendings] = useState<boolean>(false);

    const fetchData = async (params:any) => {
        setPendings(true);
        try {
            const res = await axios.get(route('report.products.get-products'), { params });
            const data = res.data;
            const products = data.products;
            const transactionDetails = products.flatMap((value : ProductTransaction) => value.transaction_details)
            transactionDetails.map((value : TransactionDetail) => value);

            const purchaseDetails = products.flatMap((value : ProductTransaction) => value.purchase_details)
            transactionDetails.map((value : PurchaseDetail) => value);

            if (data) {
                setProducts(products);
                setTransactionDetails(transactionDetails);
                setPurchaseDetails(purchaseDetails);
                setCurrentPage(data.pagination.current_page);
                setPagination(data.pagination.total_items);
                setRowsPerPage(data.pagination.per_page);

                setStartDate(data.start_date || startDate);
                setEndDate(data.end_date || endDate);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setPendings(false);
        }
    };

    const onPageChangeProduct = (page: number) => {
        setCurrentPage(page);
        fetchData({
            search: searchQuery,
            page,
            start_date: startDate,
            end_date: endDate,
            category: categoryFilter
        });
    };

    const onRowsPerPageChange = (newRowsPerPage: number, page: number) => {
        setRowsPerPage(newRowsPerPage);
        fetchData({
            search: searchQuery,
            page,
            per_page: newRowsPerPage,
            start_date: startDate,
            end_date: endDate,
            category: categoryFilter
        });
    };

    const onSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        fetchData({
            search: event.target.value,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            category: categoryFilter
        });
    };

    const onStartDateChange = (date: Date) => {
        const newDate = format(new Date(date), "yyyy-MM-dd");

        setStartDate(newDate);

        fetchData({
            search: searchQuery,
            page: 1,
            start_date: newDate,
            end_date: endDate,
            category: categoryFilter
        });
    };

    const onEndDateChange = (date: Date) => {
        const newDate = format(new Date(date), "yyyy-MM-dd");

        setEndDate(newDate);

        fetchData({
            search: searchQuery,
            page: 1,
            start_date: startDate,
            end_date: newDate,
            status: categoryFilter
        });
    };

    const onCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setCategoryFilter(e.target.value);

        fetchData({
            search: searchQuery,
            page: 1,
            start_date: startDate,
            end_date: endDate,
            category: e.target.value
        });
    };

    const columnsProduct: TableColumn<ProductTransaction>[] = [
        {
            name: "Product Name",
            selector: (row: ProductTransaction) => row.product_name,
            sortable: true,
        },
        {
            name: "Category",
            selector: (row: ProductTransaction) => row.category?.category_name || '',
            sortable: true,
        },
        {
            name: "Stock",
            selector: (row: ProductTransaction) => row.stock,
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: ProductTransaction) =>
                format(new Date(row.created_at), "dd MMMM yyyy HH:mm:ss"),
            sortable: true,
        },
    ];

    const handleChangeTransaction = (rows: any) => {
        console.log(rows);
    };

    const handleChangePurchase = (rows: any) => {
        console.log(rows);
    };

    const handleClearRows = () => {
        setToggleCleared(!toggleCleared);
    };

    let dateRange: string[] = [];

    if (startDate && endDate) {
        dateRange = eachDayOfInterval({
            start: parseISO(format(startDate, 'yyyy-MM-dd')),
            end: parseISO(format(endDate, 'yyyy-MM-dd')),
        }).map(date => format(date, 'dd MMMM yyyy'));
    }

    console.log(transactionDetails);
    const dataDateTransactionProducts = dateRange.map(date => {
        const transactionDetailsOnDate = transactionDetails.filter(detail => {
            const createdAt = new Date(detail.created_at);
            const formattedPurchaseDate = format(createdAt, 'dd MMMM yyyy');
            return formattedPurchaseDate === date;

        })

        const totalQuantity = transactionDetailsOnDate.reduce((sum, value) => sum + value.quantity, 0);
        return totalQuantity;
    });

    const dataDatePurchaseProducts = dateRange.map(date => {
        const purchaseDetailsOnDate = purchaseDetails.filter(detail => {
            const createdAt = new Date(detail.created_at);
            const formattedPurchaseDate = format(createdAt, 'dd MMMM yyyy');
            return formattedPurchaseDate === date;

        })

        const totalQuantity = purchaseDetailsOnDate.reduce((sum, value) => sum + value.quantity, 0);
        return totalQuantity;
    });

    const datasetDateProduct = [
        {   label: 'Total Income',
            backgroundColor: 'rgba(92, 184, 92, 0.2)',
            borderColor: 'rgba(92, 184, 92, 1)',
            borderWidth: 1,
            data: dataDateTransactionProducts
        },
        {
            label: 'Total Expenses',
            backgroundColor: 'rgba(217, 83, 79, 0.2)',
            borderColor: 'rgba(217, 83, 79, 1)',
            borderWidth: 2,
            data: dataDatePurchaseProducts
        }

    ];

    const labels = Array.from(new Set(products
        .map(value => value.category?.category_name)
        .filter((name): name is string => name !== undefined)
    ));

    let dataChart: number[] = [];

    if (products && products.length > 0) {
    dataChart = labels.map(label => {
        const productsPerCategory = products.filter(
        product => product.category?.category_name === label
        );

        const totalQuantity = productsPerCategory.reduce((sum, product) => sum + product.stock, 0);

        return totalQuantity;
    });
    }

    const color: string[] = labels.map(() => randomColor());

    const datasets = [{
    label: 'Total product',
    backgroundColor: color,
    borderColor: color,
    borderWidth: 1,
    data: dataChart,
    }];

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
                        <Label htmlFor="end_date_" value="End Date" />
                        <Datepicker
                            id="end_date_"
                            onSelectedDateChanged={date => onEndDateChange(date)}
                            value={endDate}
                        />
                    </div>
                    <div>
                        <Label htmlFor="category_" value="category" />
                        <Select
                            id="category_"
                            value={categoryFilter}
                            onChange={onCategoryChange}
                            required
                        >
                            <option value="">Select</option>
                            {categories.map(value => (
                                <option key={value.id} value={value.id}>{value.category_name}</option>

                            ))}
                        </Select>
                    </div>
                </div>
            </div>

            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                <div className="grid grid-cols-2 gap-4 mt-5 mb-5">
                    <LineChartComponent labels={dateRange} datasets={datasetDateProduct} />
                    <BarChartComponent labels={dateRange} datasets={datasetDateProduct} />
                </div>
            </div>

            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                <h2>Charts</h2>
                <PieChartComponent labels={labels} datasets={datasets} />

            </div>

            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg mb-5">
                <h2>Products</h2>
                <div className="flex justify-end">
                    <FloatingLabel
                        variant="outlined"
                        value={searchQuery}
                        onChange={onSearchChange}
                        label="Search..."
                    />
                </div>
                <div className="overflow-x-auto">
                    <DataTable
                        columns={columnsProduct}
                        data={products}
                        pagination
                        paginationServer
                        paginationPerPage={rowsPerPage}
                        paginationTotalRows={pagination}
                        paginationDefaultPage={currentPage}
                        paginationRowsPerPageOptions={[5, 10, 25, 50, pagination]}
                        onChangePage={onPageChangeProduct}
                        onChangeRowsPerPage={onRowsPerPageChange}
                        highlightOnHover
                        persistTableHead
                    />
                </div>
            </div>



        </AuthenticatedLayout>
    );
}

