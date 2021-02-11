const db = require("quick.db")

module.exports = {
  name: "as",
  run: async (message, args, client) => {
     let user = client.users.cache.get(args[0])
     if (!user) return message.channel.send("Unknown user!")
     let num = parseInt(args[1])
     if (!num) return message.channel.send("Dumb, that is not a number")
     db.add(`ranked_${user.id}`, num)
     message.react("👍")
  }
}
