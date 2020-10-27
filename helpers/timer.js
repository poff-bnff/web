const timer = () => {
    const timeUnit = (ms, unit) => {
        return {
            'ms': `[${ms}ms]`,
            'sec': `[${Math.round(ms / 100) / 10}sec]`
        }[unit];
    };
    let timers = {};
    return {
        start: name => {
            const now = new Date().getTime();
            timers[name] = {
                t0: now,
                check: now
            };
        },
        check: (name, unit = 'ms') => {
            if (!name in timers) {
                throw new Error(`No such timer - ${name}`);
            }
            const _timer = timers[name];
            const now = new Date().getTime();
            const from_start = now - _timer.t0;
            const from_check = now - _timer.check;
            _timer.check = now;
            return {
                interval: timeUnit(from_check, unit),
                total: timeUnit(from_start, unit)
            };
        }
    };
};

exports.timer = timer();
