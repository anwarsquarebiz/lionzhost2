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
        Schema::create('tlds', function (Blueprint $table) {
            $table->id();
            $table->string('extension')->unique(); // e.g., 'com', 'in', 'org'
            $table->string('name'); // e.g., 'Commercial', 'India', 'Organization'
            $table->enum('registry_operator', ['centralnic', 'resellerclub']);
            $table->boolean('is_active')->default(true);
            $table->integer('min_years')->default(1);
            $table->integer('max_years')->default(10);
            $table->boolean('auto_renewal')->default(true);
            $table->boolean('privacy_protection')->default(true);
            $table->boolean('dns_management')->default(true);
            $table->boolean('email_forwarding')->default(true);
            $table->boolean('id_protection')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tlds');
    }
};
