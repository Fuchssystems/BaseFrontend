import Echo from 'laravel-echo';

// https://github.com/laravel/echo/pull/110
window.Pusher = require('pusher-js');

const echo = new Echo({
  broadcaster: 'pusher',
  key: 'b1f88dd953191646eea6',
  cluster: 'eu',
  encrypted: true,
});

export default ({ Vue }) => {
  Vue.prototype.$echo = echo;
};
