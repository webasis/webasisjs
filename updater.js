function updater(handler, interval) {
    let needUpdate = false;
    let lock = false;
    let intervaler = setInterval(() => {
        if (!needUpdate) {
            return;
        }
        if (lock) {
            return;
        }
        lock = true;
        needUpdate = false;
        let done = () => {
            lock = false
        }
        handler(done);
    }, interval);

    return {
        update() {
            needUpdate = true;
        },
        close() {
            clearInterval(intervaler);
        }
    }
}

export default updater;