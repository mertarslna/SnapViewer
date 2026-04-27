const fs = require('fs');
const path = require('path');

const inboxPath = '/Users/mertarslan/Desktop/SnapViewer/instagramdata/your_instagram_activity/messages/inbox';
const outputPath = '/Users/mertarslan/Desktop/SnapViewer/snap-viewer/public/data/instagram_history.json';

const decodeString = (str) => {
    if (!str) return str;
    try {
        return Buffer.from(str, 'latin1').toString('utf8');
    } catch (e) {
        return str;
    }
};

const processJson = (obj) => {
    if (typeof obj === 'string') {
        return decodeString(obj);
    } else if (Array.isArray(obj)) {
        return obj.map(processJson);
    } else if (obj !== null && typeof obj === 'object') {
        const newObj = {};
        for (const key in obj) {
            newObj[key] = processJson(obj[key]);
        }
        return newObj;
    }
    return obj;
};

const run = () => {
    const folders = fs.readdirSync(inboxPath).filter(f => {
        return fs.statSync(path.join(inboxPath, f)).isDirectory();
    });

    // Get owner name
    let ownerName = 'Mert Arslan';
    try {
        const personalInfoPath = '/Users/mertarslan/Desktop/SnapViewer/instagramdata/personal_information/personal_information/personal_information.json';
        const personalInfo = JSON.parse(fs.readFileSync(personalInfoPath, 'utf8'));
        ownerName = decodeString(personalInfo.profile_user[0].string_map_data.Ad.value);
    } catch (e) {
        console.log("Could not find owner name, using default:", ownerName);
    }

    const conversations = [];

    folders.forEach(folder => {
        const folderPath = path.join(inboxPath, folder);
        const files = fs.readdirSync(folderPath).filter(f => f.startsWith('message_') && f.endsWith('.json'));
        
        let allMessages = [];
        let title = folder;
        let participants = [];

        files.forEach(file => {
            const filePath = path.join(folderPath, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            
            if (data.messages) {
                allMessages = allMessages.concat(data.messages);
            }
            if (data.title) {
                title = decodeString(data.title);
            }
            if (data.participants) {
                participants = data.participants.map(p => ({ name: decodeString(p.name) }));
            }
        });

        if (allMessages.length > 0) {
            // Sort messages newest first
            allMessages.sort((a, b) => b.timestamp_ms - a.timestamp_ms);

            conversations.push({
                id: folder,
                title: title,
                participants: participants,
                messages: processJson(allMessages),
            });
        }
    });

    // Sort conversations by the latest message timestamp
    conversations.sort((a, b) => {
        const aLast = a.messages[0]?.timestamp_ms || 0;
        const bLast = b.messages[0]?.timestamp_ms || 0;
        return bLast - aLast;
    });

    const finalData = {
        ownerName: ownerName,
        conversations: conversations
    };

    fs.writeFileSync(outputPath, JSON.stringify(finalData, null, 2));
    console.log(`Successfully processed ${conversations.length} conversations to ${outputPath} (Owner: ${ownerName})`);
};

run();
