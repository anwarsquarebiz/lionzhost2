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
        Schema::create('registry_accounts', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('username');
            $table->text('password'); // encrypted
            $table->string('api_key')->nullable();
            $table->text('api_secret')->nullable(); // encrypted
            $table->enum('mode', ['live', 'test', 'sandbox'])->default('test');
            $table->boolean('is_active')->default(true);
            $table->boolean('test_credentials')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registry_accounts');
    }
};
