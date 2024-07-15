import React, { useEffect } from "react";
import { formatRupiah } from "@/utils/Utils";
import { PageProps, Product } from "@/types";
import Barcode from "react-barcode";

interface PrintProps {
    product: Product;
    loop: number;
}
export default function Print({ product, loop }: PrintProps) {
    // useEffect(() => {
    //     window.print(); // Memanggil window.print() saat komponen dimuat
    // }, []); // Dependensi kosong agar useEffect hanya berjalan sekali saat komponen dimuat
    return (

        <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: loop }).map((_, index) => (
                    <Barcode value={product.barcode} />

            ))}
        </div>
    );
}
