import React from "react";
import { formatRupiah } from "@/utils/Utils";
import { PageProps, Product } from "@/types";

const Receipt: React.FC<PageProps> = ({ auth, transactions }) => {
    return (
        <div className="receipt p-4 w-[80mm]">
            <div className="header text-center mb-6">
                <h1 className="text-2xl font-bold"></h1>
                <p className="text-sm"></p>
                <p className="text-sm"></p>
                <p className="text-sm">Phone: </p>
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
                            Total
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {/* {items.map((item, index) => (
                        <tr key={index}>
                            <td className="border-b border-dashed border-black p-1 text-sm">
                                {item.product_name}
                            </td>
                            <td className="border-b border-dashed border-black p-1 text-sm text-center">
                                {item.quantity}
                            </td>
                            <td className="border-b border-dashed border-black p-1 text-sm text-right">
                                {formatRupiah(item.price)}
                            </td>
                            <td className="border-b border-dashed border-black p-1 text-sm text-right">
                                {formatRupiah(item.total)}
                            </td>
                        </tr>
                    ))} */}
                </tbody>
            </table>
            <table className="totals w-full mt-6 text-sm">
                <tbody>
                    <tr>
                        <td className="label p-1">Subtotal:</td>
                        <td className="amount p-1 text-right">
                            {/* {formatRupiah(subtotal)} */}
                        </td>
                    </tr>
                    <tr>
                        <td className="label p-1">PPN (10%):</td>
                        <td className="amount p-1 text-right">
                            {/* {formatRupiah(ppn)} */}
                        </td>
                    </tr>
                    <tr>
                        <td className="label p-1">Total:</td>
                        <td className="amount p-1 text-right">
                            {/* {formatRupiah(total)} */}
                        </td>
                    </tr>
                    <tr>
                        <td className="label p-1">Payment Method:</td>
                        <td className="amount p-1 text-right">
                            {/* {paymentMethod} */}
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
};

export default Receipt;
