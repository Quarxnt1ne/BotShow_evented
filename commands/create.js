const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, Events } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: 'create',
    description: 'สร้างกิจกรรมใหม่',
    async execute(message, args, config) {
        const embed = new EmbedBuilder()
            .setTitle('สร้างกิจกรรมใหม่')
            .setDescription('กดปุ่มด้านล่างเพื่อเริ่มต้นสร้างกิจกรรม')
            .setColor(0x00AE86);

        const button = new ButtonBuilder()
            .setCustomId('create_activity')
            .setLabel('สร้างกิจกรรม')
            .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(button);

        await message.reply({ embeds: [embed], components: [row] });
    },
};

module.exports.setup = (client) => {
    client.on(Events.InteractionCreate, async (interaction) => {
        if (interaction.isButton() && interaction.customId === 'create_activity') {
            const modal = new ModalBuilder()
                .setCustomId('activity_modal')
                .setTitle('สร้างกิจกรรม');

            const dayInput = new TextInputBuilder()
                .setCustomId('day')
                .setLabel('วัน')
                .setStyle(TextInputStyle.Short)
                .setPlaceholder('เช่น วันจันทร์');

            const eventInput = new TextInputBuilder()
                .setCustomId('event')
                .setLabel('กิจกรรม')
                .setStyle(TextInputStyle.Paragraph)
                .setPlaceholder('กิจกรรมที่ต้องการสร้าง');

            modal.addComponents(
                new ActionRowBuilder().addComponents(dayInput),
                new ActionRowBuilder().addComponents(eventInput)
            );

            await interaction.showModal(modal);
        }

        if (interaction.isModalSubmit() && interaction.customId === 'activity_modal') {
            const day = interaction.fields.getTextInputValue('day');
            const event = interaction.fields.getTextInputValue('event');

            const content = `วัน: ${day}\nกิจกรรม: ${event}`;
            const filePath = `./Createdata/${day}.txt`;

            fs.writeFileSync(filePath, content);

            await interaction.reply({ content: `กิจกรรมของคุณถูกบันทึกไว้ในไฟล์ ${day}.txt แล้ว!`, ephemeral: true });
        }
    });
};
