<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceReading extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'devices_readings';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'SOCid',
        'bulbv',
        'bulbc',
        'solv',
        'solc',
        'batv',
        'batc',
        'batsoc',
        'date'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'bulbv' => 'decimal:2',
        'bulbc' => 'decimal:2',
        'solv' => 'decimal:2',
        'solc' => 'decimal:2',
        'batv' => 'decimal:2',
        'batc' => 'decimal:2',
        'batsoc' => 'decimal:2',
        'date' => 'datetime',
    ];

    /**
     * Get the device that owns the reading.
     */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class, 'SOCid', 'SOCid');
    }
}