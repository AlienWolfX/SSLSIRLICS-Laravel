<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{
    protected $fillable = [
        'SOCid',
        'SOCadd',
        'date_installed',
        'status',
        'lat',
        'long'
    ];

    protected $casts = [
        'date_installed' => 'date',
        'lat' => 'decimal:8',
        'long' => 'decimal:8',
    ];

    public function readings()
    {
        return $this->hasMany(DeviceReading::class, 'SOCid', 'SOCid');
    }

    const STATUS_ACTIVE = 'active';
    const STATUS_INACTIVE = 'inactive';
    const STATUS_MAINTENANCE = 'maintenance';

    public static function getStatusOptions()
    {
        return [
            self::STATUS_ACTIVE,
            self::STATUS_INACTIVE,
            self::STATUS_MAINTENANCE
        ];
    }
}
