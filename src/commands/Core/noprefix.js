import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import db from '../../utils/postgresDatabase.js'; 

const ownerIds = ['1331197154622046211']; 

async function handleAction(context, args, client) {
    const isInteraction = !!context.isChatInputCommand || !!context.options;
    const user = isInteraction ? context.user : context.author;

    if (!ownerIds.includes(user?.id)) {
        const replyOpts = { content: "❌ Only the bot owner can use this command.", ephemeral: true };
        return context.reply ? context.reply(replyOpts) : context.channel.send(replyOpts);
    }

    try {
        await db.query(`CREATE TABLE IF NOT EXISTS noprefix_users (user_id VARCHAR(25) PRIMARY KEY)`);
    } catch (err) {
        console.error("Failed to create noprefix table:", err);
    }

    let action = null;
    let targetUser = null;

    if (isInteraction) {
        action = context.options.getString("action");
        targetUser = context.options.getUser("target");
    } else {
        const contentArgs = args && args.length > 0 ? args : (context.content ? context.content.trim().split(/ +/).slice(1) : []);
        action = contentArgs[0]?.toLowerCase();
        targetUser = context.mentions?.users?.first();
        
        if (!targetUser && contentArgs[1]) {
            const rawId = contentArgs[1].replace(/<@!?|>/g, '');
            targetUser = context.client?.users?.cache?.get(rawId);
        }
    }

    if (!action || !['add', 'remove', 'list'].includes(action)) {
        const msg = "Please specify a valid action: `add`, `remove`, or `list`.\nUsage: `!noprefix add @user`";
        return context.reply ? context.reply({ content: msg }) : context.channel.send({ content: msg });
    }

    if (action === 'add') {
        if (!targetUser) {
            const msg = "Please specify a user to add.";
            return context.reply ? context.reply({ content: msg }) : context.channel.send({ content: msg });
        }
        
        await db.query('INSERT INTO noprefix_users (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING', [targetUser.id]);
        
        const successEmbed = new EmbedBuilder()
            .setColor('Green')
            .setDescription(`✅ Successfully added ${targetUser} to the No-Prefix list.`);
        
        return context.reply ? context.reply({ embeds: [successEmbed] }) : context.channel.send({ embeds: [successEmbed] });
    }

    if (action === 'remove') {
        if (!targetUser) {
            const msg = "Please specify a user to remove.";
            return context.reply ? context.reply({ content: msg }) : context.channel.send({ content: msg });
        }
        
        await db.query('DELETE FROM noprefix_users WHERE user_id = $1', [targetUser.id]);
        
        const successEmbed = new EmbedBuilder()
            .setColor('Orange')
            .setDescription(`✅ Successfully removed ${targetUser} from the No-Prefix list.`);
        
        return context.reply ? context.reply({ embeds: [successEmbed] }) : context.channel.send({ embeds: [successEmbed] });
    }

    if (action === 'list') {
        const result = await db.query('SELECT user_id FROM noprefix_users');
        
        if (result.rows.length === 0) {
            const msg = "The No-Prefix list is currently empty.";
            return context.reply ? context.reply({ content: msg }) : context.channel.send({ content: msg });
        }

        const userList = result.rows.map(row => `<@${row.user_id}>`).join('\n');
        const listEmbed = new EmbedBuilder()
            .setTitle("📝 No-Prefix Users")
            .setColor('Blue')
            .setDescription(userList);

        return context.reply ? context.reply({ embeds: [listEmbed] }) : context.channel.send({ embeds: [listEmbed] });
    }
}

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
        return handleAction(interaction, [], client);
    },

    async prefixExecute(message, args, client, prefix, guildConfig) {
        return handleAction(message, args, client);
    }
};
