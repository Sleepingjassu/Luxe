import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { InteractionHelper } from '../../utils/interactionHelper.js';
// Import your PostgreSQL database connection
import db from '../../utils/postgresDatabase.js'; 

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

        // 2. Ensure the database table exists (Runs quietly in the background)
        try {
            await db.query(`CREATE TABLE IF NOT EXISTS noprefix_users (user_id VARCHAR(25) PRIMARY KEY)`);
        } catch (err) {
            console.error("Failed to create noprefix table:", err);
        }

        // 3. Grab the options
        const action = interaction.options.getString("action");
        const targetUser = interaction.options.getUser("target");

        // 4. Handle 'Add'
        if (action === 'add') {
            if (!targetUser) {
                return InteractionHelper.universalReply(interaction, { content: "Please specify a user to add." });
            }
            
            // Insert into Database (ON CONFLICT prevents crashing if they are already in the list)
            await db.query('INSERT INTO noprefix_users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [targetUser.id]);
            
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
            
            return InteractionHelper.universalReply(interaction, { embeds: [successEmbed] });
        }

        // 5. Handle 'Remove'
        if (action === 'remove') {
            if (!targetUser) {
                return InteractionHelper.universalReply(interaction, { content: "Please specify a user to remove." });
            }
            
            // Delete from Database
            await db.query('DELETE FROM noprefix_users WHERE user_id = $1', [targetUser.id]);
            
            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
            
            return InteractionHelper.universalReply(interaction, { embeds: [successEmbed] });
        }

        // 6. Handle 'List'
        if (action === 'list') {
            const result = await db.query('SELECT user_id FROM noprefix_users');
            
            if (result.rows.length === 0) {
                return InteractionHelper.universalReply(interaction, { content: "The No-Prefix list is currently empty." });
            }

            const userList = result.rows.map(row => `<@${row.user_id}>`).join('\n');
            const listEmbed = new EmbedBuilder()
                .setTitle("📝 No-Prefix Users")
                .setColor('Blue')
                .setDescription(userList);

            return InteractionHelper.universalReply(interaction, { embeds: [listEmbed] });
        }
    },
};
