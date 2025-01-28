const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'edit',
    description: 'สำหรับการแก้กิจกรรม',
    async execute(message) {
        const activitiesPath = path.join(__dirname, '../Createdata');

        let activityFiles;
        try {
            activityFiles = fs.readdirSync(activitiesPath).filter(file => file.endsWith('.txt'));
        } catch (error) {
            console.error(error);
            return message.reply('ไม่สามารถเข้าถึงโฟลเดอร์กิจกรรมได้!');
        }

        if (activityFiles.length === 0) {
            return message.reply('ไม่มีไฟล์กิจกรรมในโฟลเดอร์ activities!');
        }

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-edit')
            .setPlaceholder('เลือกไฟล์ที่ต้องการแก้ไข')
            .addOptions(activityFiles.map(file => ({
                label: file,
                description: `แก้ไขไฟล์ ${file}`,
                value: file
            })));

        const embed = new EmbedBuilder()
            .setTitle('แก้ไขไฟล์กิจกรรม')
            .setDescription('เลือกไฟล์จากเมนูด้านล่างเพื่อดำเนินการแก้ไข')
            .setColor('#34a8eb');

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await message.reply({ embeds: [embed], components: [row] });

        const filter = interaction => interaction.customId === 'select-edit' && interaction.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async interaction => {
            const selectedFile = interaction.values[0];
            const filePath = path.join(activitiesPath, selectedFile);

            let fileContent;
            try {
                fileContent = fs.readFileSync(filePath, 'utf8');
            } catch (error) {
                console.error(error);
                return interaction.reply({ content: 'เกิดข้อผิดพลาดในการอ่านไฟล์!', ephemeral: true });
            }

            const modal = new ModalBuilder()
                .setCustomId('edit-modal')
                .setTitle(selectedFile.length > 45 ? selectedFile.slice(0, 42) + '...' : selectedFile);

            const textInput = new TextInputBuilder()
                .setCustomId('file-content')
                .setLabel('เนื้อหาของไฟล์')
                .setStyle(TextInputStyle.Paragraph)
                .setValue(fileContent)
                .setRequired(true);

            const modalRow = new ActionRowBuilder().addComponents(textInput);
            modal.addComponents(modalRow);

            await interaction.showModal(modal);

            try {
                const submitted = await interaction.awaitModalSubmit({
                    filter: i => i.customId === 'edit-modal' && i.user.id === message.author.id,
                    time: 60000
                });

                const updatedContent = submitted.fields.getTextInputValue('file-content');
                fs.writeFileSync(filePath, updatedContent, 'utf8');
                await submitted.reply({ content: `ไฟล์ **${selectedFile}** ถูกแก้ไขเรียบร้อยแล้ว!`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.followUp({ content: 'หมดเวลาการแก้ไขหรือเกิดข้อผิดพลาด!', ephemeral: true });
            }
        });

        collector.on('end', () => {
            console.log('File selection collector ended.');
        });
    }
};
