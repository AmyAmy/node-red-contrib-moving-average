const NO_TOPIC = "_no_topic";

const avg = (data, config) => {
    const len = data.length;

    if (!len) {
        return 0;
    }

    switch (config.weight) {
        case "linear": {
            const num = data.reduce(
                (acc, cur, idx) => acc + ((len - idx) * cur),
                0
            );
            const denom = len * (len + 1) / 2;
            return num / denom;
        }

        case "cumulative":
        default: {
            const num = data.reduce((acc, cur) => acc + cur, 0);
            return num / len;
        }
    }
};

const status = (value, data, config, node) => {
    let fillValue = "green";

    if (!data.length) {
        fillValue = "red";
    } else if (data.length < (config.amount || 10)) {
        fillValue = "yellow";
    }

    node.status({
        fill: fillValue,
        shape: "dot",
        text: String(value)
    });
};

const parsePayload = (payload) => {
    switch (typeof payload) {
        case "number":
            return [payload, "add"];

        case "boolean":
            return [payload ? 1 : 0, "add"];

        case "string":
            switch (payload) {
                case "get":
                case "count":
                case "min":
                case "max":
                case "pop":
                case "clear":
                    return [0, payload];

                default:
                    return [null, "invalid"];
            }

        default:
            return [null, "invalid"];
    }
};

module.exports = function (RED) {
    function MovingAverageNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;
        const context = node.context();

        node.on("input", function (msg) {
            const topicKey =
                msg.topic == null || msg.topic === ""
                    ? NO_TOPIC
                    : `topic:${encodeURIComponent(String(msg.topic))}`;

            let data = context.get(topicKey) || [];
            let [payload, action] = parsePayload(msg.payload);

            if (action === "invalid") {
                node.error(
                    typeof msg.payload === "string"
                        ? 'Invalid payload: expected number, boolean, "get", "count", "min", "max", "pop", or "clear"'
                        : `Invalid payload type (${typeof msg.payload}): expected number, boolean, or string`,
                    msg
                );
                return;
            }

            switch (action) {
                case "add":
                    data = [payload, ...data].slice(0, config.amount || 10);
                    context.set(topicKey, data);
                    break;

                case "pop":
                    // Preserve the original behavior: remove the oldest value.
                    data = data.slice(0, data.length - 1);
                    context.set(topicKey, data);
                    break;

                case "clear":
                    data = [];
                    context.set(topicKey, data);
                    break;
            }

            if (action === "add" || action === "get") {
                action = config.algorithm ?? "avg";
            }

            let result;

            switch (action) {
                case "count":
                    result = data.length;
                    break;

                case "min":
                    result = data.length ? Math.min(...data) : 0;
                    break;

                case "max":
                    result = data.length ? Math.max(...data) : 0;
                    break;

                default:
                    result = avg(data, config);
                    break;
            }

            msg.payload_in = msg.payload;
            msg.payload = result;

            status(result, data, config, node);
            node.send(msg);
        });
    }

    RED.nodes.registerType("moving-average", MovingAverageNode);
};
