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
        Schema::create('devices_readings', function (Blueprint $table) {
            $table->id();
            $table->string('SOCid');
            $table->decimal('bulbv', 8, 2);
            $table->decimal('bulbc', 8, 2);
            $table->decimal('solv', 8, 2);
            $table->decimal('solc', 8, 2);
            $table->decimal('batv', 8, 2);
            $table->decimal('batc', 8, 2);
            $table->decimal('batsoc', 8, 2);
            $table->timestamp('date');
            $table->timestamps();

            // Foreign key constraint
            $table->foreign('SOCid')
                  ->references('SOCid')
                  ->on('devices')
                  ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('devices_readings');
    }
};
