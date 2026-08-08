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
        const userId = interaction.user?.id || interaction.author?.id;
        if (!ownerIds.includes(userId)) {
            return interaction.reply({ content: "❌ Only the bot owner can use this command.", ephemeral: true });
        }

        try {
            await db.query(`CREATE TABLE IF NOT EXISTS noprefix_users (user_id VARCHAR(25) PRIMARY KEY)`);
        } catch (err) {
            console.error("Failed to create noprefix table:", err);
        }

        // Try getting action from options first (Slash command style)
        let action = interaction.options?.getString("action");
        let targetUser = interaction.options?.getUser("target");

        // If options are missing (Prefix command style), parse raw content directly
        if (!action) {
            const content = interaction.content || "";
            // Example: "!noprefix add @user" -> splits into ["!noprefix", "add", "@user"]
            const args = content.trim().split(/\s+/);
            
            // Find which part matches our actions
            const foundActionIndex = args.findIndex(arg => ['add', 'remove', 'list'].includes(arg.toLowerCase()));
            
            if (foundActionIndex !== -1) {
                action = args[foundActionIndex].toLowerCase();
            }
        }

        // Grab target user from standard mentions if not caught by options
        if (!targetUser) {
            targetUser = interaction.mentions?.users?.first();
        }

        if (!action || !['add', 'remove', 'list'].includes(action)) {
            return interaction.reply({ 
                content: `Please specify a valid action: \`add\`, \`remove\`, or \`list\`.\nUsage: \`!noprefix add @user\`` 
            });
        }

        if (action === 'add') {
            if (!targetUser) {
                return interaction.reply({ content: "Please specify a user to add by mentioning them." });
            }
            
            await db.query('INSERT INTO noprefix_users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [targetUser.id]);
            
            const successEmbed = new EmbedBuilder()
                .setColor('Green')
                .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
            
            return interaction.reply({ embeds: [successEmbed] });
        }

        if (action === 'remove') {
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
