// server/processPayloads.js
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');
const Message = require('./models/Message');

connectDB();

const processFiles = async () => {
  const directoryPath = path.join(__dirname, 'sample_payloads');

  try {
    const files = fs.readdirSync(directoryPath);

    for (const file of files) {
      if (path.extname(file) !== '.json') continue;

      const filePath = path.join(directoryPath, file);
      const rawData = fs.readFileSync(filePath);
      
      if (!rawData.toString().trim()) {
        console.warn(`⚠️  Skipping empty file: ${file}`);
        continue;
      }

      const payload = JSON.parse(rawData);

      // --- FINAL FIX: Use the full, correct path to the 'value' object ---
      const value = payload?.metaData?.entry?.[0]?.changes?.[0]?.value;

      // If the path is invalid or value doesn't exist, skip this file.
      if (!value) {
        console.warn(`⚠️  Skipping file with unexpected structure: ${file}`);
        continue;
      }

      // --- Process Incoming Messages ---
      if (value.messages && value.contacts) {
        const messageData = value.messages[0];
        const contactData = value.contacts[0];

        if (messageData.text && messageData.text.body) {
          const existingMessage = await Message.findOne({ message_id: messageData.id });
          if (!existingMessage) {
            const newMessage = new Message({
              wa_id: contactData.wa_id,
              name: contactData.profile.name,
              message_id: messageData.id,
              body: messageData.text.body,
              from_me: false,
              timestamp: new Date(parseInt(messageData.timestamp) * 1000),
              status: 'delivered'
            });
            await newMessage.save();
            console.log(`✅ Inserted message: ${newMessage.body}`);
          }
        }
      }

      // --- Process Status Updates ---
      if (value.statuses) {
        const statusData = value.statuses[0];
        const updatedMessage = await Message.findOneAndUpdate(
          { message_id: statusData.id },
          { $set: { status: statusData.status } },
          { new: true }
        );
        if (updatedMessage) {
            console.log(`🔄 Updated status for message ID ${statusData.id} to ${statusData.status}`);
        } else {
            console.warn(`❓ Could not find message with ID ${statusData.id} to update status.`);
        }
      }
    }
    console.log('--- Payload processing complete! ---');
    process.exit(0);

  } catch (err) {
    console.error('Error processing payloads:', err);
    process.exit(1);
  }
};

processFiles();