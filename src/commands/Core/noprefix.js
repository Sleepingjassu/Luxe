const { EmbedBuilder } = require('discord.js');

// If you are using PostgreSQL, import your database utility here:
// const db = require('../../utils/postgresDatabase.js');

// Add your Discord User ID(s) here
const ownerIds = ['1331197154622046211']; 

module.exports = {
    name: 'noprefix',
    description: 'Add or remove users from the no-prefix list. (Owner Only)',
    aliases: ['np'],
    async execute(client, message, args) {
        // 1. Permission Check: Strict Bot Owner Check
        if (!ownerIds.includes(message.author.id)) {
            const errorEmbed = new EmbedBuilder()
                .setColor('Red')
                .setDescription("❌ Only the bot owner can use this command.");
            return message.reply({ embeds: [errorEmbed] });
        }

        // 2. Parse arguments (e.g., "!noprefix add @user")
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
            // Example for PostgreSQL:
            // await db.query('INSERT INTO noprefix_users (user_id) VALUES ($1) ON CONFLICT DO NOTHING', [targetUser.id]);
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
            // Example for PostgreSQL:
            // await db.query('DELETE FROM noprefix_users WHERE user_id = $1', [targetUser.id]);
            // ==========================================

            const successEmbed = new EmbedBuilder()
                .setColor('Orange')
                .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
            
            return message.reply({ embeds: [successEmbed] });
        }

        // 6. Handle 'list' action
        if (action === 'list') {
            // Fetch users from your database here and map them to mentions
            return message.reply("The list feature would output your database results here!");
        }
    }
};

