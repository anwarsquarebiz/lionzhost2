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
        Schema::create('domain_orders', function (Blueprint $table) {
            $table->id();
            $table->string('orderable_type');
            $table->unsignedBigInteger('orderable_id');
            $table->string('domain');
            $table->foreignId('tld_id')->constrained()->onDelete('cascade');
            $table->integer('years');
            $table->json('nameservers')->nullable();
            $table->boolean('privacy_protection')->default(false);
            $table->string('auth_code')->nullable();
            $table->string('provider');
            $table->enum('status', ['pending', 'processing', 'registered', 'failed', 'cancelled'])->default('pending');
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->boolean('auto_renewal')->default(true);
            $table->timestamps();

            $table->index(['orderable_type', 'orderable_id']);
            $table->unique(['domain', 'tld_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('domain_orders');
    }
};
