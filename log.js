import kv from "@/api/webasisjs/kv";
import updater from "@/api/webasisjs/updater";

function log(sync, rpc, id) {
    const TOPIC = `log:${id}`;

    let logs = [];
    let remote = {
        line: 0,
        version: 0
    }

    let onChanges = () => {}
    const getOnChanges = () => (onChanges)

    // load
    const loaded = JSON.parse(kv.get(TOPIC, JSON.stringify({
        logs,
        remote,
    })))
    logs = loaded.logs;
    remote = loaded.remote;

    const save = () => {
        getOnChanges()(logs)
        kv.set(TOPIC, JSON.stringify({
            logs: logs,
            remote: remote,
        }))
    }

    let upr;
    upr = updater(done => {
        (async () => {
            try {
                let resp = await rpc.call("log/get", id, logs.length, "100");
                logs = logs.concat(resp.rets);
                save();
                if (logs.length < remote.line) {
                    upr.update();
                }
            } catch ({
                status,
                rets
            }) {
                console.log("err", status, rets);
            } finally {
                done();
            }
        })();
    }, 100);
    upr.update();

    sync.on(({
        topic,
        metas
    }) => {
        if (topic != TOPIC) {
            return
        }
        if (metas.length > 0) {
            remote.line = Number(metas[0])
        }
        if (metas.length > 1) {
            const version = Number(metas[1])
            if (version != remote.version) {
                remote.version = version
                logs = [];
                save();
            }
        }
        upr.update();
    });
    sync.sub(TOPIC);

    function gc() {
        kv.map((k) => {
            if (k.startsWith('log@') || (k.startsWith('log:') && !k.startsWith(`log:${rpc.name()}@`))) {
                kv.rm(k)
            }
        })
    }
    return {
        changes(cb) {
            onChanges = cb;
            cb(logs)
        },
        close() {
            upr.close();
            sync.unsub();
            setTimeout(() => {
                gc()
            }, 0)
        },
    }
}

export default log;