const fs = require('fs');
const path = require('path');

const ANNOUNCEMENT_CHANNEL_ID = '1332911968096620684';

async function checkAndAnnounce(client) {
    const activitiesDir = path.join(__dirname, '../Createdata');
    if (!fs.existsSync(activitiesDir)) return;

    const files = fs.readdirSync(activitiesDir);

    const now = new Date();
    const currentDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}.${String(now.getMinutes()).padStart(2, '0')}`;

    for (const file of files) {
        if (file.replace('.txt', '') === currentDateTime) {
            const filePath = path.join(activitiesDir, file);
            const messageContent = fs.readFileSync(filePath, 'utf8');

            try {
                const channel = await client.channels.fetch(ANNOUNCEMENT_CHANNEL_ID);
                if (channel) {
                    await channel.send(`${messageContent}\n || @everyone ||`);
                    fs.unlinkSync(filePath);
                    console.log(`✅ ประกาศแล้ว: ${file}`);
                }
            } catch (error) {
                console.error(`❌ ไม่สามารถส่งประกาศได้: ${error}`);
            }
        }
    }
}

function startAnnouncementScheduler(client) {
    console.log('🔄 เริ่มการตรวจสอบการแจ้งเตือน...');
    setInterval(() => checkAndAnnounce(client), 60 * 1000);
}

module.exports = { startAnnouncementScheduler };
