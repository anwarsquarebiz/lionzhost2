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
        // Products table
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable(); // India, US, etc.
            $table->enum('product_type', ['shared-hosting', 'vps', 'dedicated-hosting', 'email', 'ssl']);
            $table->text('description')->nullable();
            $table->string('currency', 3)->default('USD');
            $table->string('resellerclub_key')->nullable()->unique();
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            
            $table->index(['product_type', 'is_active']);
            $table->index('resellerclub_key');
        });

        // Plans table
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->integer('resellerclub_plan_id')->nullable();
            $table->enum('plan_type', ['add', 'renew', 'restore', 'transfer'])->default('add');
            $table->integer('package_months'); // 1, 3, 6, 12, 24, 36
            $table->decimal('price_per_month', 10, 2);
            $table->decimal('setup_fee', 10, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->unique(['product_id', 'plan_type', 'package_months'], 'unique_product_plan');
            $table->index(['product_id', 'is_active']);
        });

        // Features table
        Schema::create('features', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('feature');
            $table->integer('sort_order')->default(0);
            $table->boolean('is_highlighted')->default(false);
            $table->string('icon')->nullable();
            $table->timestamps();
            
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('features');
        Schema::dropIfExists('plans');
        Schema::dropIfExists('products');
    }
};
