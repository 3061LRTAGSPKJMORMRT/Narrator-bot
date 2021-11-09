const db = require("quick.db")

module.exports = {
    name: "bless",
    description: "Bless someone with the powers of seer for 1 night.",
    usage: `${process.env.PREFIX}bless <player>`,
    gameOnly: true,
    run: async (message, args, client) => {
        if (message.channel.name == "priv-astral-wolf") {
            let alive = message.guild.roles.cache.find((r) => r.name === "Alive")
            let dead = message.guild.roles.cache.find((r) => r.name === "Dead")
            let gamePhase = db.get("gamePhase")
            let usedBless = db.get(`usedBless_${message.channel.id}`)
            if (message.member.roles.cache.has(dead.id)) return message.channel.send("You are dead, it would be pretty op if you could use your abilities now.")
            let guy = message.guild.members.cache.find((m) => m.nickname === args[0]) || message.guild.members.cache.find((m) => m.user.username === args[0]) || message.guild.members.cache.find((m) => m.id === args[0]) || message.guild.members.cache.find((m) => m.user.tag === args[0])
            if (gamePhase % 3 != 0 || gamePhase % 3 != 1) return message.channel.send("You can only use your ability during the day!")

            let role = db.get(`role_${guy.id}`)
            if (!guy || guy.roles.cache.has(dead.id)) return message.channel.send("This player is either dead or not in game.")
            if (role.includes("wolf")) return message.channel.send("You cannot bless a wolf!")
            if (usedBless == true) return message.channel.send("You have already used this command!")
            message.channel.send(`You will bless ${guy.nickname} ${guy.user.username}`)
            db.set(`bless_${message.channel.id}`, guy.nickname)
        }
    },
}
