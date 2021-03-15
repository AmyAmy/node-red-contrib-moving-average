const NO_TOPIC = "_no_topic";

const avg = (data, config) => {
    const len = data.length;

    if (!len) {
        return 0;
    }

    switch (config.weight) {
        case "linear": {
            let num = data.reduce((acc, cur, idx) => acc + ((len - idx) * cur), 0);
            let denom = len * (len + 1) / 2;
            return num / denom;
        }

        case "cumulative":
        default: { 
            let num = data.reduce((acc, cur) => acc + cur);
            return num / len;
        }
    }
}

const parsePayload = (payload, error) => {
    switch (typeof (payload)) {
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
                    error(`Invalid payload: expected number, boolean, "get", "count", "min", "max", "pop", "clear"`);
                    return [0, "get"];
            }

        default:
            error(`Invalid payload type (${typeof (payload)}): expected number, boolean, string`);
            return [0, "get"];
    }
}

module.exports = function(RED) {
    function MovingAverageNode(config) {
        RED.nodes.createNode(this, config);
        
        const node = this;
        const context = node.context();
        
        node.on('input', function(msg) {
            const topic = msg.topic || NO_TOPIC;
            let data = context.get(topic) || [];
            const [payload, action] = parsePayload(msg.payload, node.error);

            switch (action) {
                case 'add':
                    data = [payload, ...data].slice(0, config.amount || 10);
                    context.set(topic, data);
                    break;
                    
                case 'pop':
                    data = data.slice(0, data.length - 1);
                    context.set(topic, data);
                    break;
                    
                case 'clear':
                    data = [];
                    context.set(topic, data);
                    break;
            }
            
            switch (action) {
                case 'count':
                    result = data.length;
                    break;
                    
                case 'min':
                    result = Math.min(...data);
                    break;
                    
                case 'max':
                    result = Math.max(...data);
                    break;
                    
                default:
                    result = avg(data, config);
                    break;
            }
        
            msg.payload_in = msg.payload;
            msg.payload = result;
            node.send(msg);
        });
    }
    
    RED.nodes.registerType("moving-average", MovingAverageNode);
}