import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../../utils/postgresDatabase.js'; 

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
                .setDescription("The user to add or remove")
                .setRequired(false)
        ),
    category: "Core",

    async execute(interaction, config, client) {
        // 1. Owner Check
        const userId = interaction.user?.id || interaction.author?.id;
        if (!ownerIds.includes(userId)) {
            return interaction.reply({ content: "❌ Only the bot owner can use this command.", ephemeral: true });
        }

        // 2. Ensure database table exists
        try {
            await db.query(`CREATE TABLE IF NOT EXISTS noprefix_users (user_id VARCHAR(25) PRIMARY KEY)`);
        } catch (err) {
            console.error("Failed to create noprefix table:", err);
        }

        // 3. Extract action and target user safely (supports both Slash and Prefix via adapter)
        let action = null;
        let targetUser = null;

        try {
            action = interaction.options?.getString("action");
            targetUser = interaction.options?.getUser("target");
        } catch (e) {
            // Fallback if options aren't present
        }

        // If action wasn't caught by options, parse it from the message content directly
        if (!action) {
            const content = interaction.content || "";
            const parts = content.trim().split(/ +/);
            const potentialAction = parts.find(p => ['add', 'remove', 'list'].includes(p.toLowerCase()));
            
            action = potentialAction ? potentialAction.toLowerCase() : parts[1]?.toLowerCase();
            targetUser = interaction.mentions?.users?.first();

            if (!targetUser && parts.length > 2) {
                const userArg = parts.find(p => p.startsWith('<@') && p.endsWith('>'));
                if (userArg) {
                    const rawId = userArg.replace(/<@!?|>/g, '');
                    targetUser = interaction.client?.users?.cache?.get(rawId);
                }
            }
        }

        if (!action || !['add', 'remove', 'list'].includes(action)) {
            return interaction.reply({ 
                content: "Please specify a valid action: `add`, `remove`, or `list`.\nUsage: `!noprefix add @user`" 
            });
        }

        // 4. Handle Actions
        if (action === 'add') {
            if (!targetUser) {
                return interaction.reply({ content: "Please specify a user to add." });
            }
            
            await db.query('INSERT INTO noprefix_users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [targetUser.id]);
            
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
            
            return interaction.reply({ embeds: [successEmbed] });
        }

        if (action === 'remove') {
            if (!targetUser) {
                return interaction.reply({ content: "Please specify a user to remove." });
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
