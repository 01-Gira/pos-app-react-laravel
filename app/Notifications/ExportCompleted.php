<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ExportCompleted extends Notification
{
    use Queueable;

    protected $array;

    /**
     * Create a new notification instance.
     */
    public function __construct($array)
    {
        $this->array = $array;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->line('The introduction to the notification.')
                    ->action('Notification Action', url('/'))
                    ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable)
    {
        return [
            'message' => 'File export ' . $this->array['type'] . ' is ready to download',
            'fileName' => $this->array['fileName'],
        ];
    }

    public function toBroadcast($notifiable)
    {
        return new BroadcastMessage([
            'message' => 'File export ' . $this->data['type'] . ' is ready to download',
            'fileName' => $this->data['fileName'],
            'filePath' => $this->data['filePath']
        ]);
    }
}
