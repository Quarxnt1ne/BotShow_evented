const { EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'remove',
    description: 'ใช้สำหรับการลบไฟล์ข้อมูล',
    async execute(message, args, config) {
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
            .setCustomId('select-remove')
            .setPlaceholder('เลือกไฟล์ที่ต้องการลบ')
            .addOptions(activityFiles.map(file => ({
                label: file,
                description: `ลบไฟล์ ${file}`,
                value: file
            })));

        const embed = new EmbedBuilder()
            .setTitle('ลบไฟล์กิจกรรม')
            .setDescription('เลือกไฟล์จากเมนูด้านล่างเพื่อดำเนินการลบ')
            .setColor('#f72f47');

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await message.reply({ embeds: [embed], components: [row] });

        const filter = interaction => interaction.customId === 'select-remove' && interaction.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async interaction => {
            const selectedFile = interaction.values[0];
            const confirmRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirm-delete')
                    .setLabel('ยืนยัน')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('cancel-delete')
                    .setLabel('ยกเลิก')
                    .setStyle(ButtonStyle.Secondary)
            );

            const confirmEmbed = new EmbedBuilder()
                .setTitle('ยืนยันการลบไฟล์')
                .setDescription(`คุณแน่ใจหรือไม่ว่าต้องการลบไฟล์ **${selectedFile}**?`)
                .setColor('#f59417');

            await interaction.reply({ embeds: [confirmEmbed], components: [confirmRow], ephemeral: true });

            // Collector สำหรับการยืนยันหรือยกเลิก
            const confirmFilter = btnInteraction => 
                ['confirm-delete', 'cancel-delete'].includes(btnInteraction.customId) &&
                btnInteraction.user.id === message.author.id;

            const confirmCollector = interaction.channel.createMessageComponentCollector({ confirmFilter, time: 30000 });

            confirmCollector.on('collect', async btnInteraction => {
                if (btnInteraction.customId === 'confirm-delete') {
                    const filePath = path.join(activitiesPath, selectedFile);
                    try {
                        fs.unlinkSync(filePath);
                        await btnInteraction.reply({ content: `ไฟล์ **${selectedFile}** ถูกลบเรียบร้อยแล้ว!`, ephemeral: true });
                    } catch (error) {
                        console.error(error);
                        await btnInteraction.reply({ content: 'เกิดข้อผิดพลาดขณะพยายามลบไฟล์!', ephemeral: true });
                    }
                } else if (btnInteraction.customId === 'cancel-delete') {
                    await btnInteraction.reply({ content: 'การลบไฟล์ถูกยกเลิก.', ephemeral: true });
                }

                confirmCollector.stop();
            });

            confirmCollector.on('end', () => {
                console.log('Confirmation collector ended.');
            });
        });

        collector.on('end', () => {
            console.log('File selection collector ended.');
        });
    }
};
