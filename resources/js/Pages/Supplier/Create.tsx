import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, PageProps } from "@/types";
import {
    Button,
    FileInput,
    Label,
    Select,
    Textarea,
    TextInput,
} from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect } from "react";
import axios from "axios";
import InputError from "@/Components/InputError";

export default function Create({ title, auth, flash }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        supplier_name: "",
        phone_no: "",
        address: "",
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("master.suppliers.store"));
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
                <form onSubmit={handleSubmit} className="mt-4">

                    <div className="mt-4">
                        <Label htmlFor="supplier_name" value="Supplier Name" />
                        <TextInput
                            id="supplier_name"
                            value={data.supplier_name}
                            onChange={(e) =>
                                setData("supplier_name", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.supplier_name}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4">
                        <Label htmlFor="phone_no" value="Phone No" />
                        <TextInput
                            id="phone_no"
                            type="number"
                            value={data.phone_no}
                            onChange={(e) =>
                                setData("phone_no", e.target.value)
                            }
                            required
                        />
                        <InputError
                            message={errors.phone_no}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-4">
                        <Label htmlFor="address" value="address" />
                        <Textarea
                            id="address"
                            value={data.address}
                            onChange={(e) => setData("address", e.target.value)}
                            required
                        />
                        <InputError message={errors.address} className="mt-2" />
                    </div>
                    <div className="flex space-x-4 mt-4">
                        <Button
                            href={route("master.suppliers.index")}
                            type="button"
                            color="gray"
                            className="mt-4 w-40"
                            disabled={processing}
                        >
                            Back
                        </Button>

                        <Button
                            type="submit"
                            className="mt-4 w-40"
                            disabled={processing}
                        >
                            {processing ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
