function poff_chat_main () {
    const CHAT_SERVER = 'https://chat.poff.ee'
    let SOCKET = null
    let USER_ID = null
    let LOCATION = null
    const SUBSCRIBERS = {}

    function slugify(text) {
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-') // Replace spaces with -
            .replace(/[^\w\-]+/g, '') // Remove all non-word chars
            .replace(/\-\-+/g, '-') // Replace multiple - with single -
            .replace(/^-+/, '') // Trim - from start of text
            .replace(/-+$/, ''); // Trim - from end of text
    }

    function initSocket(_user_id, _location) {
        if (!_user_id || !_location) {
            console.log('Not going to join that anonymously', { _user_id, _location });
            return;
        }
        if (SOCKET) {
            console.log('Enjoy already existing socket', { _user_id, _location });
            return;
        }
        console.log('Brand new socket for you', { _user_id, _location });
        USER_ID = _user_id;
        LOCATION = slugify(_location);
        SOCKET = io(CHAT_SERVER);
        SOCKET.on('ping', () => {
            SOCKET.emit('pong', { user_id: USER_ID, room_name: LOCATION });
        });
    }
    function subscribe(message_type, callback) {
        if (SUBSCRIBERS.hasOwnProperty(message_type)) {
            SUBSCRIBERS[message_type].push(callback);
        } else {
            SUBSCRIBERS[message_type] = [callback];
            SOCKET.on(message_type, (message) => {
                for (const cbf of SUBSCRIBERS) {
                    cbf(message);
                }
            });
        }
    }
    function send(message_type, message) {
        SOCKET.emit(message_type, {
            user_id: USER_ID,
            room_name: LOCATION,
            ...message
        });
    }
    return {
        initSocket: initSocket,
        subscribe: subscribe,
        send: send,

        // track: (user_id, location) => {
        //     initSocket(user_id, location)
        //     // Join
        //     socket.emit('Track me', {user_id: user_id, room_name: location})
        //     // ReJoin
        //     socket.on('Rejoin, please', () => {
        //         socket.emit('Track me', {user_id: user_id, room_name: location})
        //     })
        // },
    }
}
const poff_o_matic = poff_chat_main()
