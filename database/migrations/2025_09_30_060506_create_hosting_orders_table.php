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
        Schema::create('hosting_orders', function (Blueprint $table) {
            $table->id();
            $table->morphs('orderable'); // Polymorphic relation to Order
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('provider'); // resellerclub, etc.
            $table->string('provider_order_id')->nullable();
            $table->string('domain');
            $table->string('package_name');
            $table->enum('status', ['pending', 'active', 'suspended', 'cancelled', 'failed'])->default('pending');
            $table->integer('billing_cycle'); // in months
            $table->decimal('price', 10, 2);
            $table->string('currency', 3)->default('USD');
            $table->json('features')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('auto_renewal')->default(true);
            $table->text('notes')->nullable();
            $table->json('provider_data')->nullable();
            $table->timestamps();

            $table->index(['provider', 'provider_order_id']);
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hosting_orders');
    }
};
