module.exports = function(RED) {
    function MovingAverageNode(config) {
        RED.nodes.createNode(this, config);
        
        let node = this;
        node.on('input', function(msg) {
            // TODO
            // node.send(msg);
        });
        
    }
    
    RED.nodes.registerType("moving-average", MovingAverageNode);
}