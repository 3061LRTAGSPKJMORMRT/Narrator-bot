const db = require("quick.db")
const config = require("../../config")

module.exports = {
    name: "hunt",
    description: "Hunt a player if they belong to the sect.",
    usage: `${process.env.PREFIX}hunt <player>`,
    gameOnly: true,
    run: async (message, args, client) => {

        const gamePhase = db.get(`gamePhase`)
        const players = db.get(`players`)
        const wwchat = message.guild.channels.cache.find(c => c.name === "werewolves-chat")
        let player = db.get(`player_${message.author.id}`) || { status: "Dead" }

        if (!message.channel.name.startsWith("priv")) return; // if they are not in the private channel

        if (player.status !== "Alive") return await message.channel.send("Listen to me, you need to be ALIVE to snap players.")
        if (!["Illusionist"].includes(player.role) && !["Illusionist"].includes(player.dreamRole)) return;
        if (["Illusionist"].includes(player.dreamRole)) player = db.get(`player_${player.target}`)
        if (gamePhase % 3 === 0) return await message.channel.send("You do know that you can only snap during the day right? Or are you delusional?")
        if (player.disguisedPlayers?.filter(p => db.get(`player_${p}`)?.status === "Alive").length === 0 || !player.disguisedPlayers) return await message.channel.send("You have to have at least 1 alive disguised player to start snapping them!")

        player.disguisedPlayers.forEach(async target => {
            if (db.get(`player_${target}`).status === "Dead") continue;
            let guy = await message.guild.members.fetch(target)
            let roles = guy.roles.cache.map(r => r.name === "Alive" ? "892046207428476989" : r.id)
            db.set(`player_${target}.status`, "Dead")
            await guy.roles.set(roles)
            await daychat.send(`${getEmoji("snap", client)} The Illusionist killed **${players.indexOf(target)+1} ${db.get(`player_${target}`).username} (${getEmoji(db.get(`player_${target}`).role.toLowerCase().replace(/\s/g, "_"), client)} ${db.get(`player_${target}`).role})**!`)
            client.emit("playerKilled", db.get(`player_${target}`), player)
        })

        await message.channel.send(`${getEmoji("snap", client)} All disguised players have been snapped!`)
        
        

    },
}
