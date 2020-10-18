const NO_TOPIC = "_no_topic";

module.exports = function(RED) {
    function MovingAverageNode(config) {
        RED.nodes.createNode(this, config);
        
        const node = this;
        const context = node.context();
        
        node.on('input', function(msg) {
            let action = 'add';
            let payload = 0;
            let topic = msg.topit || NO_TOPIC;
            
            let data = context.get(topic) || [];
            
            switch (typeof (msg.payload)) {
                case "number":
                    payload = msg.payload;
                    break;
                    
                case "boolean":
                    payload = msg.payload ? 1 : 0;
                    break;

                case "string":
                    switch (msg.payload) {
                        case "get":
                        case "count":
                        case "pop":
                        case "clear":
                            action = msg.payload;
                            break;
                        
                        default:
                            node.error('Invalid payload: expected number, boolean, "get", "count", "pop", "clear"');
                            break;
                    }
                    break;                    

                default:                    
                    node.error("Invalid payload type: expected number, boolean, string");
                    action = "get";
                    break;
            }
            
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
                    
                default:
                    if (data.length) {
                        result = data.reduce((acc, cur) => acc + cur) / data.length;
                    }
                    else {
                        result = 0;
                    }
            }
        
            msg.payload = result;
            node.send(msg);
        });        
    }
    
    RED.nodes.registerType("moving-average", MovingAverageNode);
}