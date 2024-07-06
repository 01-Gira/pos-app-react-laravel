import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, PageProps } from "@/types";
import { Button, FileInput, Label, Select, TextInput } from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useEffect, useState } from "react";
import InputError from "@/Components/InputError";

export default function Edit({ title, auth, flash, categories, product }: PageProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const { data, setData, put, processing, errors } = useForm({
        barcode: product.barcode,
        product_name: product.product_name,
        stock: product.stock, // Assuming product.stock is a string or number
        price: product.price, // Assuming product.price is a string or number
        category_id: product.category_id,
        picture: null as File | null
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        put(route('master.products.update', product.id));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Set the picture file in form data
            setData(prevData => ({
                ...prevData,
                picture: file,
            }));

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        if (product.pictureBase64) {
            setImagePreview(product.pictureBase64);
        }
    }, [product.pictureBase64]);
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
                            <Label htmlFor="barcode" value="Barcode" />
                            <TextInput
                                id="barcode"
                                value={product.barcode}
                                disabled
                            />
                            <InputError message={errors.barcode} className="mt-2" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-5">
                            <div>
                                <Label htmlFor="product_name" value="Product Name" />
                                <TextInput
                                    id="product_name"
                                    value={data.product_name}
                                    onChange={(e) => setData('product_name', e.target.value)}
                                    required
                                />
                                <InputError message={errors.product_name} className="mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="stock" value="Stock" />
                                <TextInput
                                    id="stock"
                                    type="number"
                                    value={data.stock}
                                    onChange={(e) => setData('stock', e.target.value)}
                                    required
                                />
                                <InputError message={errors.stock} className="mt-2" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-5">
                            <div>
                                <Label htmlFor="price" value="price" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    onChange={(e) => setData('price', e.target.value)}
                                    required
                                />
                                <InputError message={errors.price} className="mt-2" />
                            </div>
                            <div>
                                <Label htmlFor="category_id" value="Select your category" />
                                <Select
                                    id="category_id"
                                    value={data.category_id}
                                    onChange={(e) => setData('category_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select</option>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.category_name}</option>
                                    ))}
                                </Select>
                                <InputError message={errors.category_id} className="mt-2" />
                            </div>
                        </div>

                        <div className="mt-5">
                            <Label htmlFor="picture" value="Upload Picture" />
                            <FileInput id="picture" onChange={handleFileChange}
                                accept="image/*"/>
                            <InputError message={errors.picture} className="mt-2" />

                            {imagePreview && (
                                <div className="mt-5">
                                    <img src={imagePreview} alt="Preview" className="max-w-full h-auto" />
                                </div>
                            )}
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
