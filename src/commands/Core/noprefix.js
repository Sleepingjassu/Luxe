import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Your Discord User ID
const ownerIds = ['1331197154622046211']; 

export default {
    data: new SlashCommandBuilder()
        .setName("noprefix")
        .setDescription("Add or remove users from the no-prefix list. (Owner Only)"),

    async prefixExecute(message) {
        // 1. Check Owner
        if (!ownerIds.includes(message.author?.id || message.user?.id)) {
            return message.reply({ content: "❌ Only the bot owner can use this command." });
        }

        // 2. Foolproof Parsing
        // Converts the whole message to lowercase and scans for the exact keywords
        const content = message.content?.toLowerCase() || "";
        let action = null;
        
        if (content.includes("add")) action = "add";
        else if (content.includes("remove")) action = "remove";
        else if (content.includes("list")) action = "list";

        if (!action) {
            return message.reply({ content: "Please specify a valid action: `add`, `remove`, or `list`.\nUsage: `!noprefix add @user`" });
        }

        // 3. Find the mentioned user
        const targetUser = message.mentions?.users?.first();

        // 4. Handle Actions
        if (action === 'add') {
            if (!targetUser) return message.reply({ content: "Please mention a user to add." });
            
            // Database integration will go here
            
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
            return message.reply({ embeds: [successEmbed] });
        }

        if (action === 'remove') {
            if (!targetUser) return message.reply({ content: "Please mention a user to remove." });
            
            // Database integration will go here
            
            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
            return message.reply({ embeds: [successEmbed] });
        }

        if (action === 'list') {
            return message.reply({ content: "The list feature will output database results here!" });
        }
    },

    async execute(interaction) {
        return interaction.reply({ content: "Please use the prefix version: `!noprefix add @user`", ephemeral: true });
    }
};
