import axios from 'axios';
const { proto, generateWAMessageFromContent, prepareWAMessageMedia, generateWAMessageContent, getDevice } = (await import("@whiskeysockets/baileys")).default;

let SH = async (message, { conn, text, usedPrefix, command }) => {
    if (!text) return conn.reply(message.chat, '🫒 _Que quieres buscar en TikTok._', message, fake);

    async function createVideoMessage(url) {
        const { videoMessage } = await generateWAMessageContent({ video: { url } }, { upload: conn.waUploadToServer });
        return videoMessage;
    }

    async function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    try {
        await message.react('⏳️');
     
        const { data: response } = await axios.get(`${global.APIs.light.url}/search/tiktok?q=${encodeURIComponent(text)}`);

        if (!response.status) {
            return conn.reply(message.chat, '✘ No se encontraron resultados.', message);
        }

        let searchResults = response.data || [];

        shuffleArray(searchResults);
        let selectedResults = searchResults.slice(0, 7);

        let results = [];
        for (let result of selectedResults) {

            let caption = 
`❤️ ${result.likes}
💬 ${result.comments}
👁️ ${result.views}
🔁 ${result.shares}

⏱️ ${result.duration}
🌎 ${result.region}
📦 ${result.size_mb}

👤 ${result.author}
📅 ${result.date}`.trim()

            results.push({
                body: proto.Message.InteractiveMessage.Body.fromObject({ 
                    text: caption
                }),

                footer: proto.Message.InteractiveMessage.Footer.fromObject({ 
                    text: 'TikTok Search - Shadow API'
                }),

                header: proto.Message.InteractiveMessage.Header.fromObject({
                    title: result.title,
                    hasMediaAttachment: true,
                    videoMessage: await createVideoMessage(result.download)
                }),

                nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({ 
                    buttons: [] 
                })
            });
        }

        const responseMessage = generateWAMessageFromContent(message.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },

                    interactiveMessage: proto.Message.InteractiveMessage.fromObject({
                        body: proto.Message.InteractiveMessage.Body.create({ 
                            text: '☁️ Resultado de: ' + text 
                        }),

                        footer: proto.Message.InteractiveMessage.Footer.create({ 
                            text: `🔎 TikTok Search • ${response.count} resultados`
                        }),

                        header: proto.Message.InteractiveMessage.Header.create({ 
                            hasMediaAttachment: false 
                        }),

                        carouselMessage: proto.Message.InteractiveMessage.CarouselMessage.fromObject({ 
                            cards: [...results] 
                        })
                    })
                }
            }
        }, { quoted: message });

        await message.react('✅');
        await conn.relayMessage(message.chat, responseMessage.message, { messageId: responseMessage.key.id });

    } catch (error) {ᴅ
        console.log(error)
        await conn.reply(message.chat, error.toString(), message);
    }
}

SH.help = ['tiktoksearch *« ǫᴜᴇʀʏ »*'];
SH.register = true;
SH.tags = ['buscador'];
SH.command = ['tiktoksearch', 'tts'];

export default SH;