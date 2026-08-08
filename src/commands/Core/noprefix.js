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
                .setDescription(` 💔 can't add ${targetuser} to No-prefix list (list full) .`);
            
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
            if (!targetUser) {
                return interaction.reply({ content: "Please specify a user to remove by mentioning them." });
            }
            
            await db.query('DELETE FROM noprefix_users WHERE user_id = $1', [targetUser.id]);
            
            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
            
            return interaction.reply({ embeds: [successEmbed] });
        }

        if (action === 'list') {
            const result = await db.query('SELECT user_id FROM noprefix_users');
            
            if (result.rows.length === 0) {
                return interaction.reply({ content: "The No-Prefix list is currently empty." });
            }

            const userList = result.rows.map(row => `<@${row.user_id}>`).join('\n');
            const listEmbed = new EmbedBuilder()
                .setTitle("📝 No-Prefix Users")
                .setColor('Blue')
                .setDescription(userList);

            return interaction.reply({ embeds: [listEmbed] });
        }
    },
};
