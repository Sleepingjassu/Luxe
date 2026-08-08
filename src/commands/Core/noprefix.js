import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Your Discord User ID
const ownerIds = ['1331197154622046211']; 

export default {
    // 1. The blueprint Luxe needs to actually load the command
    data: new SlashCommandBuilder()
        .setName("noprefix")
        .setDescription("Add or remove users from the no-prefix list. (Owner Only)"),

    // 2. The custom prefix handler specific to Titanbot/Luxe
    async prefixExecute(interaction) {
        // Check Owner
        if (!ownerIds.includes(interaction.author?.id || interaction.user?.id)) {
            return interaction.reply({ content: "❌ Only the bot owner can use this command." });
        }

        // Get the arguments (e.g., ["add", "<@123456>"])
        const args = interaction.content ? interaction.content.trim().split(/ +/).slice(1) : [];
        const action = args[0]?.toLowerCase();
        
        // Find the targeted user
        let targetUser = interaction.mentions?.users?.first();
        if (!targetUser && args[1]) {
            targetUser = interaction.client.users.cache.get(args[1].replace(/<@!?|>/g, ''));
        }

        if (!action || !['add', 'remove', 'list'].includes(action)) {
            return interaction.reply({ content: "Please specify a valid action: `add`, `remove`, or `list`.\nUsage: `!noprefix add @user`" });
        }

        if (action === 'add') {
            if (!targetUser) return interaction.reply({ content: "Please mention a user to add." });
            
            // ==========================================
            // 💾 DATABASE LOGIC GOES HERE
            // ==========================================
            
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
            return interaction.reply({ embeds: [successEmbed] });
        }

        if (action === 'remove') {
            if (!targetUser) return interaction.reply({ content: "Please mention a user to remove." });
            
            // ==========================================
            // 💾 DATABASE LOGIC GOES HERE
            // ==========================================
            
            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
            return interaction.reply({ embeds: [successEmbed] });
        }

        if (action === 'list') {
            return interaction.reply({ content: "The list feature would output your database results here!" });
        }
    },

    // 3. Fallback for slash command usage
    async execute(interaction) {
        return interaction.reply({ content: "Please use the prefix version: `!noprefix add @user`", ephemeral: true });
    }
};
