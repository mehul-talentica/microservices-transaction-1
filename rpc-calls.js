const amqp = require('amqplib/callback_api');
const logger = require('./logger');

const requestQueue1 = 'rpc_request_queue2';

let channel, responseQueue, correlationIds = [], i = 1;
amqp.connect('amqp://localhost', function(err, conn) {
  conn.createChannel(function(err, ch) {
    if(err){
        logger.log("Transaction 1 Microservice -" + err);
        conn.close(); 
        process.exit(0);
    }
    ch.assertQueue('', {exclusive: true}, function(err, q) {
        channel = ch;
        responseQueue = q;
    });
  });
});

const sendTransactionRequest = function(message){
    logger.log("Transaction 1 Microservice - in sendTransactionRequest")
    let correlationId = i++;
    correlationIds.push(correlationId.toString());
    channel.sendToQueue(requestQueue1, new Buffer(message.toString()), { 
        correlationId: correlationId.toString(), 
        replyTo: responseQueue.queue,
        persistent: true
    });
}

const consumeRpcResponse = function(callback) {
    channel.consume(responseQueue.queue, function(msg) {
        logger.log("Transaction 1 Microservice - consuming RpcResponse")
        if ( correlationIds.includes(msg.properties.correlationId)) {
            correlationIds.splice(correlationIds.indexOf(msg.properties.correlationId), 1);
            logger.log("Transaction 1 Microservice - Response Received = "+ msg.content.toString());
            channel.ack(msg);
            return callback(msg.content.toString())
        }
    }, {noAck: false});
}
module.exports = {
    sendTransactionRequest,
    consumeRpcResponse
}