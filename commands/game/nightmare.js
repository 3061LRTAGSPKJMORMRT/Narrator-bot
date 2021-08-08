const db = require("quick.db")
const { getEmoji } = require("../../config")

module.exports = {
    name: "nightmare",
    gameOnly: true,
    run: async (message, args, client) => {
        if (message.channel.name == "priv-nightmare-werewolf") {
            let isDay = db.get(`isDay`)
            let alive = message.guild.roles.cache.find((r) => r.name === "Alive")
            let wolfChat = message.guild.channels.cache.find((c) => c.name === "werewolves-chat")
            let guy = message.guild.members.cache.find((m) => m.nickname === args[0]) || message.guild.members.cache.find((m) => m.user.username === args[0]) || message.guild.members.cache.find((m) => m.user.tag === args[0]) || message.guild.members.cache.find((m) => m.id === args[0])
            let nightmares = db.get(`nightmare_${message.channel.id}`) || 2
            console.log(nightmares)
            if (!message.member.roles.cache.has(alive.id)) return message.chanenl.send("You cannot use the ability now!")
            if (isDay != "yes") return message.channel.send("You can use your ability only during the day!")
            if (!guy || guy == message.member) return message.channel.send("The player is not in game! Mention the correct player number.")
            if (!guy.roles.cache.has(alive.id)) return message.channel.send("You can play with alive people only!")
            if (wolfChat.permissionsFor(guy).has(["VIEW_CHANNEL", "READ_MESSAGE_HISTORY"])) return message.channel.send("You cannot nightmare your fellow wolves.")
            if (nightmares < 1) return message.channel.send("You have finished using your ability.")
            message.channel.send(`${getEmoji("nightmare", client)} You decided to nightmare **${guy.nickname} ${guy.user.username}**`)
            db.set(`sleepy_${message.channel.id}`, guy.nickname)
        }
    },
}
