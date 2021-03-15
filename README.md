# Moving average for Node-RED

A [Node-RED](https://github.com/node-red/node-red) node that calculates
moving averages.

Moving averages are calculated on a per topic basis.

The amount of messages over which the moving average is calculated can be
configured. It handles moving averages over numbers and booleans. Booleans
are converted to 1 and 0.

Additionally you can send some commands to the node to
manipulate it:

- "get": Gets the current moving average whithout adding a new number.
- "pop": Removes the oldest stored number.
- "clear": Removes all stored numbers.
- "count": Counts the number of currently stored numbers.
- "min": Returns the minimum of the currently stored numbers.
- "max": Returns the maximum of the currently stored numbers.

The original payload is returned as payload_in.

## Links

GitHub: https://github.com/AmyAmy/node-red-contrib-moving-average

NPM: https://www.npmjs.com/package/node-red-contrib-moving-average

Node-RED: https://flows.nodered.org/node/node-red-contrib-moving-average

