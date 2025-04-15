const { SlashCommandBuilder } = require('discord.js');
require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require('discord.js');

const commands = [
    {
        name: 'add',
        description: 'Adds two numbers.',
        options: [
            {
                name: 'first-num',
                description: 'The first number',
                type: ApplicationCommandOptionType.Number,
                choices: [
                    {
                        name: 'one',
                        value: 1
                    },
                    {
                        name: 'two',
                        value: 2
                    },
                ],
                required: true,
            },
            {
                name: 'second-num',
                description: 'The first number',
                type: ApplicationCommandOptionType.Number,
                choices: [
                    {
                        name: 'one',
                        value: 1
                    },
                    {
                        name: 'two',
                        value: 2
                    },
                ],
                required: true,
            },
        ]
    },
    {
        name: 'subtract',
        description: 'Subtracts two numbers.',
        options: [
            {
                name: 'first-num',
                description: 'The first number',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
            {
                name: 'second-num',
                description: 'The first number',
                type: ApplicationCommandOptionType.Number,
                required: true,
            },
        ]
    },
    {
        name: 'embed',
        description: 'Sends an embed',
    },
];

const rest = new REST({ version: '10' }).setToken(process.env.Token);

(async () => {
    try {
        console.log('Registering slash commands...');
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        );

        console.log('Slash commands registered succesfully!');
    } catch(e) {
        console.log(e);
    }
})();