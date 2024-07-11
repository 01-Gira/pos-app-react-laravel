<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class Logs extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = ['user_id', 'description', 'ip'];

    public function insertLog($description)
    {
        $log_ip = Request::session()->get('client_ip');

        $this->create([
        	'user_id' => Auth::user()->id,
        	'description' => $description,
        	'ip' => $log_ip
        ]);
    }
}
