const db = require("quick.db")
const config = require("../../config")

module.exports = {
    name: "ignite",
    description: "Ignite all doused players.",
    usage: `${process.env.PREFIX}ignite`,
    gameOnly: true,
    run: async (message, args, client) => {

        const gamePhase = db.get(`gamePhase`)
        const players = db.get(`players`)
        const daychat = message.guild.channels.cache.find(c => c.name === "day-chat")
        let player = db.get(`player_${message.author.id}`) || { status: "Dead" }

        if (!message.channel.name.startsWith("priv")) return; // if they are not in the private channel

        if (player.status !== "Alive") return await message.channel.send("Listen to me, you need to be ALIVE to ignite players.")
        if (!["Arsonist"].includes(player.role) && !["Arsonist"].includes(player.dreamRole)) return;
        if (["Arsonist"].includes(player.dreamRole)) player = db.get(`player_${player.target}`)
        if (gamePhase % 3 != 0) return await message.channel.send("You do know that you can only ignite during the night right? Or are you delusional?")
        if (db.get(`game.peace`) === Math.floor(gamePhase/3)+1) return await message.channel.send("This is a peaceful night! You cannot ignite anyone!")
        if (player.jailed) return await message.channel.send("You are jailed. You cannot use your abilities while in jail!")
        if (player.nightmared) return await message.channel.send("You are nightmared. You cannot use your abilities while you're asleep.")
        if (player.target) return await message.channel.send("You already doused players tonight! If you want to ignite, do `+douse cancel` and then run this command again!")
        if (player.doused?.filter(p => db.get(`player_${p}`)?.status === "Alive").length === 0 || !player.doused) return await message.channel.send("You can't ignite if you don't have any alive players doused!")

        player.doused.forEach(async target => {
            if (db.get(`player_${target}`).status === "Dead") continue;
            let guy = await message.guild.members.fetch(target)
            let roles = guy.roles.cache.map(r => r.name === "Alive" ? "892046207428476989" : r.id)
            db.set(`player_${target}.status`, "Dead")
            await guy.roles.set(roles)
            await daychat.send(`${getEmoji("ignite", client)} The Arsonist ignited **${players.indexOf(target)+1} ${db.get(`player_${target}`).username} (${getEmoji(db.get(`player_${target}`).role.toLowerCase().replace(/\s/g, "_"), client)} ${db.get(`player_${target}`).role})**!`)
            client.emit("playerKilled", db.get(`player_${target}`), player)
        })

        await message.channel.send(`${getEmoji("ignite", client)} All doused players have been burnt to crisps!`)

    },
}
