import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, PageProps, Product, TransactionDetail } from "@/types";
import {
    Button,
    FileInput,
    FloatingLabel,
    Label,
    Modal,
    Select,
    Textarea,
    TextInput,
} from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import {
    FormEventHandler,
    useState,
    useEffect,
    useRef,
    ChangeEvent,
} from "react";
import axios from "axios";
import InputError from "@/Components/InputError";
import { CircleLoader, ClipLoader } from "react-spinners";
import Swal from "sweetalert2";
import DataTable, { TableColumn } from "react-data-table-component";
import { format } from "date-fns";
import { classCustomSwal, formatRupiah, Toast } from "@/utils/Utils";
import withReactContent from "sweetalert2-react-content";

export default function View({ title, auth, flash, claimcustomer }: PageProps) {
    const { data, setData, post, put, processing, errors } = useForm({
        id: claimcustomer.id,
        transaction_id: claimcustomer.transaction?.id,
        product_id: claimcustomer.product?.id,
        product_name: claimcustomer.product?.product_name,
        description: claimcustomer.description,
        quantity: claimcustomer.quantity,
        status: "",
    });

    const setUpdateStatus = async (status: string) => {
        await setData("status", status);
        if (data.status != "") {
            await withReactContent(Swal).fire({
                title: <i>Enter password to access this view</i>,
                input: "password",
                showCancelButton: true,
                showConfirmButton: true,
                showLoaderOnConfirm: true,
                preConfirm: async () => {
                    const input = Swal.getInput()?.value;

                    if (input === "") {
                        await Toast.fire({
                            icon: "warning",
                            title: "Warning",
                            text: `Input can not be empty`,
                        });
                        return;
                    }

                    try {
                        const res = await axios.get(route("check-password"), {
                            params: {
                                password: input,
                            },
                        });

                        if (res.data.indctr === 1) {
                            const claimCustomerId = data.id;

                            if (!claimCustomerId) {
                                throw new Error("Claim customer ID is missing");
                            }

                            await put(
                                route("transaction.claim-customers.update", {
                                    claim_customer: claimCustomerId,
                                })
                            );
                        } else {
                            await Toast.fire({
                                icon: "warning",
                                title: "Warning",
                                text: res.data.message,
                            });
                        }
                    } catch (error: any) {
                        Swal.showValidationMessage(`
                            Request failed: ${error}
                        `);
                    }
                },
            });
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
                <h1 className="dark:text-white text-lg">{title}</h1>
                <div className="mt-5 grid grid-cols-12">
                    <div className="col-span-12 mt-5">
                        <div>
                            <Label
                                htmlFor="transaction_id"
                                value="Transcation ID"
                            />
                            <TextInput
                                id="transaction_id"
                                value={data.transaction_id}
                                onChange={(e) =>
                                    setData("transaction_id", e.target.value)
                                }
                                readOnly
                            />
                            <InputError
                                message={errors.transaction_id}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <div className="col-span-12 mt-5 grid grid-cols-12 gap-4">
                        <div className="col-span-6">
                            <Label htmlFor="product_id" value="Product ID" />
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
                        <div className="col-span-6">
                            <Label htmlFor="quantity" value="Quantity" />
                            <TextInput
                                id="quantity"
                                type="number"
                                value={data.quantity}
                                readOnly
                            />
                            <InputError
                                message={errors.quantity}
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <div className="col-span-12 mt-5">
                        <Label htmlFor="description" value="Description" />
                        <Textarea
                            id="description"
                            value={data.description}
                            onChange={(e) =>
                                setData("description", e.target.value)
                            }
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
                        {claimcustomer.status === "on_process" && (
                            <>
                                <Button
                                    color="red"
                                    type="button" // Gunakan type="button" jika tidak ingin tombol ini mengirimkan form
                                    className="mt-4 w-40"
                                    disabled={processing}
                                    onClick={() => setUpdateStatus("rejected")}
                                >
                                    {processing ? (
                                        <ClipLoader size={20} />
                                    ) : (
                                        "Reject"
                                    )}
                                </Button>

                                <Button
                                    color="success"
                                    type="button" // Gunakan type="button" jika tidak ingin tombol ini mengirimkan form
                                    className="mt-4 w-40"
                                    disabled={processing}
                                    onClick={() => setUpdateStatus("approved")}
                                >
                                    {processing ? (
                                        <ClipLoader size={20} />
                                    ) : (
                                        "Approve"
                                    )}
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
