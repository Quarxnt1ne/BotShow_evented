const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'แสดงคำสั่งทั้งหมดของบอท',
    execute(message, args, config) {
        const prefix = config.prefix || 'mb.';

        const commands = [
            { name: `${prefix}help`, description: 'แสดงคำสั่งทั้งหมดของบอท' },
            { name: `${prefix}ping`, description: 'ตรวจสอบสถานะของบอท'},
            { name: `${prefix}event`, description: 'สำหรับกิจกรรม'},
            { name: `${prefix}tinetable`, description: 'สำหรับการเช็คตารางเรียน'},
            { name: `${prefix}remove`, description: 'สำหรับการกิจกรรม'}
        ];

        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('รายการคำสั่งของบอท')
            .setDescription('นี่คือรายการคำสั่งทั้งหมดที่คุณสามารถใช้ได้:')
            .addFields(
                commands.map(cmd => ({ name: cmd.name, value: cmd.description, inline: false }))
            )
            .setFooter({ text: `ใช้ ${prefix} ตามด้วยคำสั่งเพื่อเริ่มใช้งาน` });

        message.reply({ embeds: [embed], ephemeral: true});
    },
};
