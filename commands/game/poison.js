const db = require("quick.db")
const config = require("../../config")

module.exports = {
    name: "poison",
    description: "Poison a player.",
    usage: `${process.env.PREFIX}poison <player>`,
    gameOnly: true,
    run: async (message, args, client) => {

        const gamePhase = db.get(`gamePhase`)
        const players = db.get(`players`)
        const daychat = message.guild.channels.cache.find(c => c.name === "day-chat")
        let player = db.get(`player_${message.author.id}`) || { status: "Dead" }

        if (!message.channel.name.startsWith("priv")) return; // if they are not in the private channel

        if (player.status !== "Alive") return await message.channel.send("Listen to me, you need to be ALIVE to poison players.")
        if (!["Sect Hunter"].includes(player.role) && !["Sect Hunter"].includes(player.dreamRole)) return;
        if (["Sect Hunter"].includes(player.dreamRole)) player = db.get(`player_${player.target}`)
        if (gamePhase % 3 != 0) return await message.channel.send("You do know that you can only poison during the night right? Or are you delusional?")
        if (db.get(`game.peace`) === Math.floor(gamePhase/3)+1) return await message.channel.send("This is a peaceful night! You cannot poison anyone!")
        if (player.jailed) return await message.channel.send("You are jailed. You cannot use your abilities while in jail!")
        if (player.nightmared) return await message.channel.send("You are nightmared. You cannot use your abilities while you're asleep.")
        if (player.usesK === 0) return await message.channel.send("You already used up your ability!")
        if (args.length !== 1) return await message.channel.send("You need to select a player to poison!")

        let target = players[Number(args[0])-1] || players.find(p => p === args[0]) || players.map(p => db.get(`player_${p}`)).find(p => p.username === args[0])

        if (!target) return await message.channel.send(`I could not find the player with the query: \`${args[0]}\`!`)

        if (db.get(`player_${target}`).status !== "Alive") return await message.channel.send("You need to select an ALIVE player!")

        if (db.get(`player_${target}`).role === "President") return await message.channel.send("You cannot poison the President!")

        if (!player.hypnotized) {

            if (db.get(`player_${player.id}`).couple === target)  return await message.channel.send("You cannot poison your own couple!")

            if (player.id === target) return await message.channel.send("You do know that you cannot poison yourself right?")

        }

        db.subtract(`player_${player.id}.usesK`, 1)

        let guy = await message.guild.members.fetch(target)
        let roles = guy.roles.cache.map(r => r.name === "Alive" ? "892046207428476989" : r.id)
        await message.channel.send(`${getEmoji("poison", client)} You have succesfully used your ability!`)
        await daychat.send(`${getEmoji("poison", client)} The Witch poisoned **${players.indexOf(target)+1} ${db.get(`player_${target}`).username} (${getEmoji(db.get(`player_${target}`).role.toLowerCase().replace(/\s/g, "_"), client)} ${db.get(`player_${target}`).role})**!`)
        await guy.roles.set(roles)
        client.emit("playerKilled", db.get(`player_${target}`), player)
    },
}
