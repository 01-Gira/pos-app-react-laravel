import React, { useEffect } from "react";
import { formatRupiah } from "@/utils/Utils";
import { PageProps, Product } from "@/types";
import Barcode from "react-barcode";

export default function Print({ products }: PageProps) {
    // useEffect(() => {
    //     window.print(); // Memanggil window.print() saat komponen dimuat
    // }, []); // Dependensi kosong agar useEffect hanya berjalan sekali saat komponen dimuat
    console.log(products);
    return (

        <div className="grid grid-cols-4">
            {/* <Barcode value={barcode}/> */}
        </div>
    );
}
