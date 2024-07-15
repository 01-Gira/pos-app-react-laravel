<?php

namespace App\Jobs;

use App\Models\User;
use App\Notifications\ExportCompleted;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class NotifyUserOfCompletedExport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $user;
    protected $array;

    /**
     * Create a new job instance.
     */
    public function __construct(User $user, array $array)
    {
        $this->user = $user;
        $this->array = $array;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $this->user->notify(new ExportCompleted($this->array));
    }
}
