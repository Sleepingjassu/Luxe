import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';

// Your Discord User ID
const ownerIds = ['1331197154622046211']; 

export default {
    data: new SlashCommandBuilder()
        .setName("noprefix")
        .setDescription("Add or remove users from the no-prefix list. (Owner Only)")
        .addStringOption((option) =>
            option
                .setName("action")
                .setDescription("Type: add, remove, or list")
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove', value: 'remove' },
                    { name: 'List', value: 'list' }
                )
        )
        .addUserOption((option) =>
            option
                .setName("target")
                .setDescription("The user to add or remove (leave blank if listing)")
                .setRequired(false)
        ),
    category: "Core",

    async execute(interaction, config, client) {
        // 1. Owner Check
        const userId = interaction.user ? interaction.user.id : interaction.author?.id;
        if (!ownerIds.includes(userId)) {
            return InteractionHelper.universalReply(interaction, {
                content: "❌ Only the bot owner can use this command.",
                ephemeral: true
            });
        }

        // 2. Safely grab the options using Discord's official method
        const action = interaction.options.getString("action");
        const targetUser = interaction.options.getUser("target");

        // 3. Handle 'Add'
        if (action === 'add') {
            if (!targetUser) {
                return InteractionHelper.universalReply(interaction, { content: "Please specify a user to add." });
            }
            
            // ==========================================
            // 💾 DATABASE LOGIC GOES HERE
            // ==========================================
            
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
            
            return InteractionHelper.universalReply(interaction, { embeds: [successEmbed] });
        }

        // 4. Handle 'Remove'
        if (action === 'remove') {
            if (!targetUser) {
                return InteractionHelper.universalReply(interaction, { content: "Please specify a user to remove." });
            }
            
            // ==========================================
            // 💾 DATABASE LOGIC GOES HERE
            // ==========================================
            
            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
            
            return InteractionHelper.universalReply(interaction, { embeds: [successEmbed] });
        }

        // 5. Handle 'List'
        if (action === 'list') {
            return InteractionHelper.universalReply(interaction, { content: "The database list will appear here!" });
        }
    },
};
