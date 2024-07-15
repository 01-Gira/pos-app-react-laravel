import cluster from 'cluster';
import Echo from 'laravel-echo';

import Pusher from 'pusher-js';
window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.MIX_APP_PUSHER_KEY,
    cluster: import.meta.env.MIX_APP_CLUSTER,
    forceTLS: true,
    encryption: true
});
