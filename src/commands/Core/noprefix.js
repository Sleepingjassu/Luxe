import { EmbedBuilder } from 'discord.js';

// Your Discord User ID
const ownerIds = ['1331197154622046211']; 

export default {
    name: 'noprefix',
    description: 'Add or remove users from the no-prefix list. (Owner Only)',
    aliases: ['np'],
    
    async execute(client, message, args) {
        if (!ownerIds.includes(message.author.id)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription("❌ Only the bot owner can use this command.");
            return message.reply({ embeds: [errorEmbed] });
        }

        const action = args[0]?.toLowerCase();
        const targetUser = message.mentions.users.first() || client.users.cache.get(args[1]);

        if (!action || !['add', 'remove', 'list'].includes(action)) {
            return message.reply("Please specify a valid action: `add`, `remove`, or `list`.\nUsage: `!noprefix add @user`");
        }

        if (action === 'add') {
            if (!targetUser) return message.reply("Please mention a user to add.");
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
            return message.reply({ embeds: [successEmbed] });
        }

        if (action === 'remove') {
            if (!targetUser) return message.reply("Please mention a user to remove.");
            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
            return message.reply({ embeds: [successEmbed] });
        }

        if (action === 'list') {
            return message.reply("The list feature would output your database results here!");
        }
    },
    
    async run(client, message, args) {
        return this.execute(client, message, args);
    }
};
