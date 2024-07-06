import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, PageProps } from "@/types";
import { Button, FileInput, Label, Select, Textarea, TextInput } from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect } from "react";
import axios from "axios";
import InputError from "@/Components/InputError";

export default function Create({ title, auth, flash }: PageProps) {
    const { data, setData, post, processing, errors } = useForm({
        uniq_code: '',
        supplier_name: '',
        address: ''
    });

    useEffect(() => {
        if (data.uniq_code.length > 0) {
            getDataProduct(data.uniq_code);
        }
    }, [data.uniq_code]);

    const getDataProduct = async (uniq_code: string) => {
        try {
            const res = await axios.get(route("master.suppliers.get-data", { uniq_code }));

            const supplier = res.data.supplier;

            if (supplier) {
                setData(prevData => ({
                    ...prevData,
                    supplier_name: supplier.supplier_name,
                    address: supplier.address,
                }));
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
            setData(prevData => ({
                ...prevData,
                supplier_name: '',
                address: '',
            }));
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('master.suppliers.store'));
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
                    <form onSubmit={handleSubmit} className="mt-4">
                        <div className="mt-4">
                            <Label htmlFor="uniq_code" value="Unique Code" />
                            <TextInput
                                id="uniq_code"
                                value={data.uniq_code}
                                onChange={(e) => setData('uniq_code', e.target.value)}

                            />
                            <InputError message={errors.uniq_code} className="mt-2" />
                        </div>
                        <div className="mt-4">
                            <Label htmlFor="supplier_name" value="Supplier Name" />
                            <TextInput
                                id="supplier_name"
                                value={data.supplier_name}
                                onChange={(e) => setData('supplier_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.supplier_name} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <Label htmlFor="address" value="address" />
                            <Textarea
                                id="address"

                                value={data.address}
                                onChange={(e) => setData('address', e.target.value)}
                                required
                            />
                            <InputError message={errors.address} className="mt-2" />
                        </div>
                        <div className="flex space-x-4 mt-4">
                            <Button href={route('master.suppliers.index')}
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
