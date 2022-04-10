const db = require("quick.db")
const { ids, getEmoji } = require("../../config")

module.exports = {
    name: "extravote",
    description: "Use all the extra votes you got.",
    usage: `${process.env.PREFIX}extravote`,
    gameOnly: true,
    aliases: ["ev"],
    run: async (message, args, client) => {
        // general check
        if(!message.member.roles.cache.has(ids.alive)) return message.channel.send({content: "You can't do that right now."})
        if(db.get("gamephase")%3 == 0) return message.channel.send({content: "You can use your commands only when it's day."})

        // Role individual
        if(message.channel.name == "priv-preacher") {
            if(db.get(`preacherDid_${message.channel.id}`)) return message.channel.send({content: "You already used your ability!"})
            if((db.get(`preacher_${message.channel.id}`) ?? 0) == 0) return message.channel.send({content: "You don't have any extra votes to use!"})
            message.channel.send(`${getEmoji("preacher_extra_votes")} You used your ${db.get(`preacher_${message.channel.id}`)} extra votes.`)
            db.set(`preacherDid_${message.channel.id}`, true)
        }
    }
}