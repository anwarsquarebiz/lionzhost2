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
        Schema::create('epp_poll_messages', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('message_id')->unique();
            $table->timestamp('message_date');
            $table->text('message');
            $table->json('response_data')->nullable();
            $table->boolean('processed')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->index(['provider', 'processed']);
            $table->index('message_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('epp_poll_messages');
    }
};
