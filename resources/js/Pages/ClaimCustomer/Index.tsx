import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    ClaimCustomer,
    HoldTransaction,
    PageProps,

} from "@/types";
import { Head, router } from "@inertiajs/react";
import axios from "axios";
import {
    Button,
    Datepicker,
    FileInput,
    FloatingLabel,
    Label,
    Modal,
    Select,
    Table,
    TextInput,
} from "flowbite-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { formatRupiah } from "@/utils/Utils";
import { BeatLoader, ClipLoader } from "react-spinners";
import { HiOutlineExclamationCircle, HiOutlinePlus } from "react-icons/hi";
import DataTable, { TableColumn } from "react-data-table-component";
import { format } from "date-fns";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
export default function Index({ title, auth, flash, search, claimcustomers, pagination, start_date, end_date }: PageProps) {

    const [pending, setPending] = useState(false);
    const [currentPage, setCurrentPage] = useState(pagination.current_page);
    const [searchQuery, setSearchQuery] = useState(search || "");
    const [rowsPerPage, setRowsPerPage] = useState(pagination.per_page);
    const [startDate, setStartDate] = useState(format(new Date(start_date), "yyyy-MM-dd"));
    const [endDate, setEndDate] = useState(format(new Date(end_date), "yyyy-MM-dd"));
    const [statusFilter, setStatusFilter] = useState(status || "");

    console.log(claimcustomers);
    const onPageChange = (page: number) => {
        router.get(
            route("transaction.claim-customer.index"),
            { search: searchQuery, page, status: statusFilter },
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
            route("transaction.claim-customer.index"),
            { search: searchQuery, page, per_page: newRowsPerPage, status: statusFilter },
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
            route("transaction.claim-customer.index"),
            { search: event.target.value, page: 1, status: statusFilter },
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
                route("transaction.claim-customer.index"),
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
                route("transaction.claim-customer.index"),
                { search: searchQuery, page: 1, start_date: startDate, end_date: formattedDate, status: statusFilter },
                {
                    preserveState: true,
                    onStart:() => setPending(true),
                    onFinish:() => setPending(false)
                }
            );
        }
    };

    const columns: TableColumn<ClaimCustomer>[] = [
        {
            name: "ID",
            selector: (row: ClaimCustomer) => row.id,
            sortable: true,
        },
        {
            name: "Transaction ID",
            selector: (row: ClaimCustomer) => row.transaction?.id,
            sortable: true,
        },
        {
            name: "Product Name",
            selector: (row: ClaimCustomer) => row.product?.product_name,
            sortable: true,
            width: '10%'
        },
        {
            name: "Quantity",
            selector: (row: ClaimCustomer) => row.quantity,
            sortable: true,
            width: '10%'
        },
        {
            name: "Status",
            selector: (row: ClaimCustomer) => row.status,
            sortable: true,
            width: '10%'
        },
        {
            name: "Created At",
            selector: (row: ClaimCustomer) =>
                format(new Date(row.created_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
            width: '15%'
        },
        {
            name: "Updated At",
            selector: (row: ClaimCustomer) =>
                format(new Date(row.updated_at), "yyyy-MM-dd HH:mm:ss"),
            sortable: true,
            width: '15%'
        },
        {
            name: "Action",
            width: '30%',
            center: true,
            cell: (row: ClaimCustomer) => (
                <div className="flex space-x-4">
                    <button
                        onClick={() => viewDetailClaimCustomer(row.id)}
                        className="font-medium text-green-500 hover:underline dark:text-red-300"
                    >
                        Detail
                    </button>
                </div>
            ),
        },
    ];

    const viewDetailClaimCustomer = async (id : string) => {
        withReactContent(Swal).fire({
            title: <i>Enter password to access this view</i>,
            input: 'password',
            showCancelButton: true,
            showConfirmButton: true,
            showLoaderOnConfirm: true,
            preConfirm: async () => {
              const input = Swal.getInput()?.value;
              console.log();
              if(input == ''){
                Swal.fire({
                    icon: "warning",
                    title: `Input can not be empty`,
                    confirmButtonText: 'OK'
                });
              }else{
                try {
                    const res = await axios.get(route('check-password'), { params : {
                        password: input
                    }});

                    if(res.data.indctr === 1){
                        router.get(route('transaction.claim-customers.show', {claim_customer : id}));
                    }else{
                        Swal.fire({
                            icon: "warning",
                            title: res.data.message,
                            confirmButtonText: 'OK'
                        });
                    }
                } catch (error : any) {
                    Swal.fire({
                        icon: "warning",
                        title: error.message,
                        confirmButtonText: 'OK'
                    });
                }

              }
            },
          })
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
                            // onChange={onStatusChange}
                            required
                        >
                            <option>Select</option>
                            <option value="on_process">On Process</option>
                            <option value="approve">Approve</option>
                        </Select>
                    </div>
                </div>
                <div className="flex space-x-4">
                    <div>
                        <Label htmlFor="btn-add" value="Add Claim" />

                        <Button
                            href={route("transaction.claim-customers.create")}
                            className="w-40 hover:bg-cyan-800"
                        >
                            <HiOutlinePlus className="mr-2 h-5 w-5" />
                            Add Claim
                        </Button>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="flex space-x-4">
                        <Button.Group>
                            <Button href={route('master.exports.products.export-data', 'xlsx')} color="green">
                                Excel
                            </Button>
                        </Button.Group>
                    </div>
                    <div className="flex justify-end">
                        <FloatingLabel
                            variant="outlined"
                            value={searchQuery}
                            onChange={onSearchChange}
                            label="search..."
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={claimcustomers}
                        pagination
                        paginationServer
                        paginationPerPage={5}
                        paginationTotalRows={pagination.total_items}
                        paginationDefaultPage={currentPage}
                        paginationRowsPerPageOptions={[5, 10, 25, 50]}
                        persistTableHead
                        progressPending={pending}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
