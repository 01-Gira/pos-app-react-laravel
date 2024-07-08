<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('supplier_id')->nullable();
            $table->timestamp('purchase_date');
            $table->string('payment_method')->nullable();
            $table->bigInteger('subtotal')->nullable();
            $table->bigInteger('ppn')->nullable();
            $table->bigInteger('total_payment')->nullable();
            $table->string('status')->nullable();
            $table->timestamps();

            $table->foreign('supplier_id')->references('id')->on('suppliers')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
