
import LineChartComponent from "@/Components/LineChartComponent";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PageProps, Transaction } from "@/types";
import { Head, router } from "@inertiajs/react";
import { format } from "date-fns";
import { Button, Datepicker, FloatingLabel, Label, Select } from "flowbite-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import DataTable, { TableColumn } from "react-data-table-component";
import { HiOutlinePlus, HiOutlineExclamationCircle } from "react-icons/hi";


export default function Transactios({title, auth, flash, transactions, pagination, search, start_date, end_date, status} : PageProps){

    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [searchQuery, setSearchQuery] = useState(search || "");
    const [rowsPerPage, setRowsPerPage] = useState(pagination.per_page);
    const [startDate, setStartDate] = useState(format(new Date(start_date), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(end_date), "yyyy-MM-dd"));
    const [statusFilter, setStatusFilter] = useState(status || "");

    useEffect(() => {
        setCurrentPage(pagination.current_page);
    }, [pagination.current_page]);

    useEffect(() => {
        setSearchQuery(search || "");
    }, [search]);

    const onPageChange = (page: number) => {
        router.get(
            route("report.transactions.index"),
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
            route("report.transactions.index"),
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
            route("report.transactions.index"),
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
                route("report.transactions.index"),
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
                route("report.transactions.index"),
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
            route("report.transactions.index"),
            { search: searchQuery, page: 1, start_date: startDate, end_date: endDate, status: event.target.value },
              {
                preserveState: true,
                onStart:() => setPending(true),
                onFinish:() => setPending(false)
            }
        );
    };


    const [selectedRows, setSelectedRows] = useState<Transaction[]>([]);
    const [toggledClearRows, setToggleClearRows] = useState(false);
    const [toggleCleared, setToggleCleared] = useState(false);

    const columns: TableColumn<Transaction>[] = [
        {
            name: "Transaction ID",
            selector: (row: Transaction) => row.id,
            sortable: true,
        },
        {
            name: "Status",
            selector: (row: Transaction) => row.status,
            sortable: true,
        },
        {
            name: "Subtotal",
            selector : (row: Transaction) => row.subtotal,
            sortable: true,
        },
        {
            name: "PPN",
            selector : (row: Transaction) => row.ppn,
            sortable: true,
        },
        {
            name: "Total Payment",
            selector : (row: Transaction) => row.total_payment,
            sortable: true,
        },
        {
            name: "Created At",
            selector: (row: Transaction) =>
                format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
        },
    ];

    const doubleClick = (row: Transaction) =>{
        console.log(row);
    }

    const handleChange = (rows : any) => {
        console.log(rows);
      };


    const handleClearRows = () => {
        setToggleClearRows(!toggledClearRows);
    }

    const contextActions = useMemo(() => {
		const handleDelete = () => {

			if (window.confirm(`Are you sure you want to delete:\r ${selectedRows.map(r => r.id )}?`)) {

			}
		};

		return (
			<Button onClick={handleDelete} style={{ backgroundColor: 'red' }}>
				Delete
			</Button>
		);
	}, [selectedRows, toggleCleared]);

    const chartLabels = ['January', 'February', 'March', 'April', 'May'];
    const chartData1 = [65, 59, 80, 81, 56];
    const chartData2 = [30, 20, 40, 100, 156];

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
                <div className="grid grid-cols-2 gap-4 mt-5 mb-5">
                    {/* <Bar data={dataConfig} options={options}/> */}
                    <LineChartComponent labels={chartLabels} dataset1Data={chartData1} dataset2Data={chartData2}/>
                    <LineChartComponent labels={chartLabels} dataset1Data={chartData1} dataset2Data={chartData2} />

                </div>
            </div>

            <div className="p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg">
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
                </div>
                <div className="flex justify-end">
                    <FloatingLabel
                        variant="outlined"
                        value={searchQuery}
                        onChange={onSearchChange}
                        label="search..."
                        />
                </div>
                <div className="overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={transactions}
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
                        onRowDoubleClicked={doubleClick}
                        selectableRows
                        onSelectedRowsChange={handleChange}
                        clearSelectedRows={toggledClearRows}
                        progressPending={pending}
                        contextActions={contextActions}
                    />
                </div>
            </div>

         </AuthenticatedLayout>
    )
}
