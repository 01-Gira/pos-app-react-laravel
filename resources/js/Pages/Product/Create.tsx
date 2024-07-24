import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Category, PageProps } from "@/types";
import { Button, FileInput, Label, Select, TextInput } from "flowbite-react";
import { Head, useForm } from "@inertiajs/react";
import { FormEventHandler, useState, useEffect } from "react";
import axios from "axios";
import InputError from "@/Components/InputError";
import { CircleLoader, ClipLoader } from "react-spinners";

export default function Create({ title, auth, flash, categories }: PageProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const { data, setData, post, processing, errors } = useForm({
        barcode: "",
        product_name: "",
        category_id: "",
        stock: "",
        type: "",
        price: "",
        picture: null as File | null,
    });

    useEffect(() => {
        if (data.barcode.length > 0) {
            getDataProduct(data.barcode);
        }
    }, [data.barcode]);

    const getDataProduct = async (barcode: string) => {
        try {
            const res = await axios.get(
                route("master.products.get-data-barcode", { barcode })
            );

            const product = res.data.product;

            if (product) {
                console.log("Product found:", product);
                setData((prevData) => ({
                    ...prevData,
                    product_name: product.product_name,
                    stock: product.stock,
                    price: product.price,
                    category_id: product.category_id,
                }));

                if (product.pictureBase64) {
                    setImagePreview(product.pictureBase64);
                }
            }
        } catch (error) {
            console.error("Error fetching product data:", error);
            setData((prevData) => ({
                ...prevData,
                product_name: "",
                stock: "",
                price: "",
                category_id: "",
                picture: null,
            }));
        }
    };

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route("master.products.store"));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Set the picture file in form data
            setData((prevData) => ({
                ...prevData,
                picture: file,
            }));

            // Display image preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
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
                <form onSubmit={handleSubmit} className="mt-5">
                    <div className="grid grid-cols-1 gap-4 mt-5">
                        <div>
                            <Label htmlFor="barcode" value="Barcode" />
                            <TextInput
                                id="barcode"
                                value={data.barcode}
                                onChange={(e) => setData("barcode", e.target.value)}
                            />
                            <InputError message={errors.barcode} className="mt-2" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <div>
                            <Label
                                htmlFor="product_name"
                                value="Product Name"
                            />
                            <TextInput
                                id="product_name"
                                value={data.product_name}
                                onChange={(e) =>
                                    setData("product_name", e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={errors.product_name}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="stock" value="Stock" />
                            <TextInput
                                id="stock"
                                type="number"
                                value={data.stock}
                                onChange={(e) =>
                                    setData("stock", e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={errors.stock}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-5">
                        <div>
                            <Label htmlFor="price" value="Price" />
                            <TextInput
                                id="price"
                                value={data.price}
                                onChange={(e) =>
                                    setData("price", e.target.value)
                                }
                                required
                            />
                            <InputError
                                message={errors.price}
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label
                                htmlFor="category_id"
                                value="Select product category"
                            />
                            <Select
                                id="category_id"
                                value={data.category_id}
                                onChange={(e) =>
                                    setData("category_id", e.target.value)
                                }
                                required
                            >
                                <option value="">Select</option>
                                {categories.map((category) => (
                                    <option
                                        key={category.id}
                                        value={category.id}
                                        selected
                                    >
                                        {category.category_name}
                                    </option>
                                ))}
                            </Select>
                            <InputError
                                message={errors.category_id}
                                className="mt-2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 mt-5">
                        {/* <div>
                            <Label htmlFor="picture" value="Upload Picture" />
                            <FileInput
                                id="picture"
                                onChange={handleFileChange}
                                accept="image/*"
                            />
                            <InputError message={errors.picture} className="mt-2" />

                            {imagePreview && (
                                <div className="mt-5">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-w-full h-auto"
                                    />
                                </div>
                            )}
                        </div> */}
                        <div>
                            <Label
                                htmlFor="type"
                                value="Select product type"
                            />
                            <Select
                                id="type"
                                value={data.type}
                                onChange={(e) =>
                                    setData("type", e.target.value)
                                }
                                required
                            >
                                <option value="">Select</option>
                                <option value="pcs">pcs</option>
                                <option value="pack">pack</option>
                            </Select>
                            <InputError
                                message={errors.type}
                                className="mt-2"
                            />
                        </div>
                    </div>



                    <div className="flex space-x-4 mt-5">
                        <Button
                            href={route("master.products.index")}
                            type="button"
                            color="gray"
                            className="mt-4 w-40"
                            disabled={processing}
                        >
                            Back
                        </Button>

                        <Button
                            color="success"
                            type="submit"
                            className="mt-4 w-40"
                            disabled={processing}
                        >
                            {processing ? (
                                <>
                                    <ClipLoader size={20} />
                                </>
                            ) : (
                                "Save"
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
