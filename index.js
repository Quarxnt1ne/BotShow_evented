const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('../config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions
    ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.js'));

const createCommand = require('../commands/create.js');
const eventCommand = require('../commands/event.js');

client.commands.set(eventCommand.name, eventCommand);
createCommand.setup(client);

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    client.commands.set(command.name, command);
}

const announcer = require('../commands/announce.js');

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);

    client.user.setActivity({
        name: 'mb.help || ใช้เพื่อดูคำสั่งทั้งหมด',
        type: ActivityType.Competing
    });

    announcer.startAnnouncementScheduler(client);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const args = message.content.slice(config.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);

    if (!command) return;

    try {
        await command.execute(message, args, config);
    } catch (error) {
        console.error(error);
        message.reply('เกิดข้อผิดพลาดขณะพยายามเรียกใช้คำสั่งนี้!');
    }
});

client.login(config.token);
