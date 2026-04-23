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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->morphs('auditable'); // order, domain_order, hosting_order, etc.
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('action'); // domain:check, domain:register, contact:create, etc.
            $table->string('provider'); // centralnic, resellerclub
            $table->string('method'); // GET, POST, EPP
            $table->string('endpoint')->nullable();
            $table->text('request_data')->nullable(); // Masked request
            $table->text('response_data')->nullable(); // Masked response
            $table->integer('response_code')->nullable();
            $table->string('status'); // success, failed, error
            $table->integer('duration_ms')->nullable();
            $table->text('error_message')->nullable();
            $table->string('transaction_id')->nullable()->index(); // clTRID or request ID
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();

            $table->index(['provider', 'action']);
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
