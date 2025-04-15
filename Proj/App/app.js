const { Client, Events, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const dotenv = require("dotenv").config();
const { OpenAI } = require('openai');

const token = process.env.Token;
const IGNORE_PREFIX = '!';
const CHANNELS = ['']; // Replace with your channel IDs
const openai = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

const client = new Client({ intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages, 
    GatewayIntentBits.MessageContent
    ],
});

client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.login(token);

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (message.content.startsWith(IGNORE_PREFIX)) return;
    if (!CHANNELS.includes(message.channel.id) && !message.mentions.has(client.user.id)) return;

    await message.channel.sendTyping();

    const typingInterval = setInterval(() => {
        message.channel.sendTyping();
    }, 5000);

    const conversation = [];
    conversation.push({ role: 'system', content: 'You are a helpful assistant.' });

    let previousMessages = await message.channel.messages.fetch({ limit: 13 });
    previousMessages.reverse();

    previousMessages.forEach(msg => {
        if (msg.author.bot && msg.author.id !== client.user.id) return;
        if (msg.content.startsWith(IGNORE_PREFIX)) return;

        const username = msg.author.username.replace(/\s+/g, '_').replace(/[^\w\s]/gi, '');

        if (msg.author.id === client.user.id) {
            conversation.push({ role: 'assistant', name: username, content: msg.content });
            return;
        }

        conversation.push({ role: 'user', name: username, content: msg.content });
    });

    const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: conversation
    }).catch((err) => {
        console.log('OpenAI error: ', err);
    });

    clearInterval(typingInterval);

    if(!response){
        message.reply('There was an error processing your request. Please try again.');
        return;
    };

    const respMessage = response.choices[0].message.content;
    const sizeLimit = 2000;

    for(let i = 0; i < respMessage.length; i += sizeLimit){
        const chunk = respMessage.substring(i, i + sizeLimit);

        await message.reply(chunk);
    }
});

client.on('interactionCreate', (interaction) => {
    if(!interaction.isChatInputCommand()) return;

    if(interaction.commandName === 'add'){
        const num1 = interaction.options.get('first-num')?.value;
        const num2 = interaction.options.get('second-num')?.value;

        interaction.reply(`The sum of ${num1}, and ${num2}, is ${calculator(num1, num2, 'add')}!`);
    }

    if(interaction.commandName === 'embed'){
        const embed = new EmbedBuilder()
        .setTitle('Embed title!')
        .setDescription('Description for the embed.')
        .setColor('Random')
        .addFields({
            name: 'Field title', value: 'Some random value', inline: true,
        }, {
            name: 'Another field title', value: 'Some random value', inline: true,
        });

        interaction.reply({ embeds: [embed] });
    }
});

function calculator(num1, num2, choice) {
    const addition = num1 + num2;
    const subtraction = num1 - num2;
    const division = num1 / num2;
    const multiplication = num1 * num2;

    if(choice === 'add'){
        return addition;
    } else if (choice === 'subtract'){
        return subtraction;
    } else if (choice === 'divide'){
        return division;
    } else if (choice === 'multiply'){
        return multiplication;
    }
}

