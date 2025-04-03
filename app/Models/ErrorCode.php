<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ErrorCode extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'error_code',
        'problem',
        'action'
    ];

    /**
     * The primary key for the model.
     *
     * @var string
     */
    protected $primaryKey = 'error_code';

    /**
     * The "type" of the primary key ID.
     *
     * @var string
     */
    protected $keyType = 'string';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;
}
