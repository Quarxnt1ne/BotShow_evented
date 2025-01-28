// ./commands/ping.js

module.exports = {
    name: 'ping',
    description: 'ทดสอบการตอบสนองของบอท',
    execute(message, args, config) {
        const sentMessage = Date.now(); 
        message.channel.send('กำลังทดสอบการตอบสนอง...').then(reply => {
            const latency = Date.now() - sentMessage;
            reply.edit(`🏓 Ping! Latency: \`${latency}ms\` | API Latency: \`${Math.round(message.client.ws.ping)}ms\``);
        });
    },
};
