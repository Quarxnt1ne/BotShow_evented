const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'event',
    description: 'สำหรับการเช็คกิจกรรม',
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
            .setCustomId('select-activity')
            .setPlaceholder('เลือกไฟล์กิจกรรมที่คุณต้องการดู')
            .addOptions(activityFiles.map(file => {
                const fileName = path.parse(file).name;
                return {
                    label: fileName,
                    description: `ดูข้อมูลในไฟล์ ${fileName}`,
                    value: file
                };
            }));

        const embed = new EmbedBuilder()
            .setTitle('กิจกรรมที่มีอยู่')
            .setDescription('เลือกไฟล์จากเมนูด้านล่างเพื่อดูข้อมูล')
            .setColor('#85baee');

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await message.reply({ embeds: [embed], components: [row] });

        const filter = interaction => interaction.customId === 'select-activity' && interaction.user.id === message.author.id;
        const collector = message.channel.createMessageComponentCollector({ filter, time: 60000 });

        collector.on('collect', async interaction => {
            const selectedFile = interaction.values[0];
            const filePath = path.join(activitiesPath, selectedFile);

            try {
                // อ่านข้อมูลจากไฟล์ .txt
                const fileData = fs.readFileSync(filePath, 'utf8');

                // แสดงข้อมูลในรูปแบบข้อความ
                await interaction.reply({ content: `**${selectedFile}**:\n\n${fileData}`, ephemeral: true });
            } catch (error) {
                console.error(error);
                await interaction.reply({ content: 'ไม่สามารถอ่านข้อมูลในไฟล์ได้!', ephemeral: true });
            }
        });

        collector.on('end', () => {
            console.log('Collector has ended.');
        });
    }
};
