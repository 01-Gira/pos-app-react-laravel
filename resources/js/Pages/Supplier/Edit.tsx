import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, PageProps } from "@/types";
import { Button, FileInput, Label, Select, Textarea, TextInput } from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useEffect, useState } from "react";
import InputError from "@/Components/InputError";

export default function Edit({ title, auth, flash, supplier }: PageProps) {
    const { data, setData, put, processing, errors } = useForm({
        uniq_code: supplier.uniq_code,
        supplier_name: supplier.supplier_name,
        address: supplier.address
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('master.suppliers.update', supplier.id));
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">{title}</h2>}
            flash={flash}
        >
            <Head title={title} />
                <div className='p-7 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg'>
                    <h1 className="dark:text-white text-lg">{title}</h1>
                    <form onSubmit={handleSubmit} className="mt-5">
                        <div className="mt-5">
                            <Label htmlFor="uniq_code" value="Unique Code" />
                            <TextInput
                                id="uniq_code"
                                value={supplier.uniq_code}
                                disabled
                            />
                            <InputError message={errors.uniq_code} className="mt-2" />
                        </div>
                        <div className="mt-5">
                            <Label htmlFor="supplier_name" value="Supplier Name" />
                            <TextInput
                                id="supplier_name"
                                value={data.supplier_name}
                                onChange={(e) => setData('supplier_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.supplier_name} className="mt-2" />
                        </div>

                        <div className="mt-5">
                            <Label htmlFor="address" value="address" />
                            <Textarea
                                id="address"

                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                required
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>
                        <div className="flex space-x-4 mt-5">
                            <Button href={route('master.products.index')}
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
                                {processing ? 'Saving...' : 'Save'}
                            </Button>
                        </div>


                    </form>
                </div>
        </AuthenticatedLayout>
    );
}
