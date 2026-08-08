import { EmbedBuilder } from 'discord.js';

// Your Discord User ID
const ownerIds = ['1331197154622046211']; 

export default {
    name: 'noprefix',
    description: 'Add or remove users from the no-prefix list. (Owner Only)',
    aliases: ['nop'],
    
    async execute(client, message, args) {
        // 1. Permission Check: Strict Bot Owner Check
        if (!ownerIds.includes(message.author.id)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription("❌ Only the bot owner can use this command.");
            return message.reply({ embeds: [errorEmbed] });
        }

        // 2. Parse arguments
        const action = args[0]?.toLowerCase();
        const targetUser = message.mentions.users.first() || client.users.cache.get(args[1]);

        // 3. Validate action
        if (!action || !['add', 'remove', 'list'].includes(action)) {
            return message.reply("Please specify a valid action: `add`, `remove`, or `list`.\nUsage: `!noprefix add @user`");
        }

        // 4. Handle 'add' action
        if (action === 'add') {
            if (!targetUser) return message.reply("Please mention a user to add.");

            // ==========================================
            // 💾 DATABASE LOGIC GOES HERE
            // ==========================================

            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
            
            return message.reply({ embeds: [successEmbed] });
        }

        // 5. Handle 'remove' action
        if (action === 'remove') {
            if (!targetUser) return message.reply("Please mention a user to remove.");

            // ==========================================
            // 💾 DATABASE LOGIC GOES HERE
            // ==========================================

            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
            
            return message.reply({ embeds: [successEmbed] });
        }

        // 6. Handle 'list' action
        if (action === 'list') {
            return message.reply("The list feature would output your database results here!");
        }
    },
    
    // Fallback: Some bot handlers expect 'run' instead of 'execute'
    async run(client, message, args) {
        return this.execute(client, message, args);
    }
};
