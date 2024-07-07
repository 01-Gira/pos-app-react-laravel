import React, { useEffect } from "react";
import { formatRupiah } from "@/utils/Utils";
import { PageProps, Product } from "@/types";

export default function Receipt({ title, auth, transaction }: PageProps) {
    useEffect(() => {
        window.print(); // Memanggil window.print() saat komponen dimuat
    }, []); // Dependensi kosong agar useEffect hanya berjalan sekali saat komponen dimuat
    return (
        <div className="receipt p-4 w-[80mm]">
            <div className="header text-center mb-6">
                <h1 className="text-2xl font-bold">
                    {auth.user.store.store_name}
                </h1>
                <p className="text-sm">{auth.user.store.address}</p>
                {/* <p className="text-sm"></p> */}
                <p className="text-sm">Phone: {auth.user.store.phone_no}</p>
            </div>
            <table className="items w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border-b border-dashed border-black text-center font-bold p-1 text-sm">
                            Item
                        </th>
                        <th className="border-b border-dashed border-black text-center font-bold p-1 text-sm">
                            Qty
                        </th>
                        <th className="border-b border-dashed border-black text-center font-bold p-1 text-sm">
                            Price
                        </th>
                        <th className="border-b border-dashed border-black text-center font-bold p-1 text-sm">
                            Discount
                        </th>
                        <th className="border-b border-dashed border-black text-center font-bold p-1 text-sm">
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {transaction.transaction_details.map((detail, index) => (
                        <tr key={index}>
                            <td className="border-b border-dashed border-black p-1 text-sm">
                                {detail.product.product_name}
                            </td>
                            <td className="border-b border-dashed border-black p-1 text-sm text-center">
                                {detail.quantity}
                            </td>
                            <td className="border-b border-dashed border-black p-1 text-sm text-right">
                                {formatRupiah(detail.price)}
                            </td>
                            <td className="border-b border-dashed border-black p-1 text-sm text-center">
                                {detail.discount}
                            </td>

                            <td className="border-b border-dashed border-black p-1 text-sm text-right">
                                {formatRupiah(detail.total_price)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <table className="totals w-full mt-6 text-sm">
                <tbody>
                    <tr>
                        <td className="label p-1">Subtotal:</td>
                        <td className="amount p-1 text-right">
                            {formatRupiah(transaction.subtotal)}
                        </td>
                    </tr>
                    <tr>
                        <td className="label p-1">PPN (10%):</td>
                        <td className="amount p-1 text-right">
                            {formatRupiah(transaction.ppn)}
                        </td>
                    </tr>
                    <tr>
                        <td className="label p-1">Total:</td>
                        <td className="amount p-1 text-right">
                            {formatRupiah(transaction.total_payment)}
                        </td>
                    </tr>
                    <tr>
                        <td className="label p-1">Payment Method:</td>
                        <td className="amount p-1 text-right">
                            {transaction.payment_method}
                        </td>
                    </tr>
                </tbody>
            </table>
            <div className="footer text-center mt-6 text-sm">
                <p>Thank you for your purchase!</p>
                <p>Visit us again!</p>
            </div>
        </div>
    );
}
