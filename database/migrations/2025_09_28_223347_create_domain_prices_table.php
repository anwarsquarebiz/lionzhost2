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
        Schema::create('domain_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tld_id')->constrained()->onDelete('cascade');
            $table->integer('years');
            $table->decimal('cost', 10, 2);
            $table->decimal('margin', 10, 2);
            $table->decimal('sell_price', 10, 2);
            $table->boolean('is_premium')->default(false);
            $table->boolean('is_promotional')->default(false);
            $table->timestamp('promotional_start')->nullable();
            $table->timestamp('promotional_end')->nullable();
            $table->timestamps();

            $table->unique(['tld_id', 'years']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('domain_prices');
    }
};
