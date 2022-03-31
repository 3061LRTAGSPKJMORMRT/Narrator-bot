const { MessageEmbed } = require("discord.js")
const { ids } = require("../../config")
const { sleep } = require("../../config/src/fn")

module.exports = {
    name: "contact",
    description: "Contact the staff to get out of jail.",
    usage: `${process.env.PREFIX}contact`,
    run: async (message, args, client) => {
        let links = [
            "https://imgur.com/EbvnA84",
            "https://imgur.com/RqWXkjz",
            "https://imgur.com/zJZhaYG",
            "https://imgur.com/s7gWTSm",
            "https://imgur.com/eKO15kY",
            "https://imgur.com/2JpPxj9"
        ]
        let msg = await message.channel.send("Please check the DMs")
        try{
            let m = await message.author.send({embeds: [new MessageEmbed({title: "Please wait till a staff member is ready!"})]})
            setTimeout( async () => {
                await m.edit({embeds: [], content: links[Math.floor(Math.random() * links.length)]})
                client.channels.cache.get("606123726966358037").send("Succesfully rickrolled: " + message.author.tag)
            }, 2000)
        } catch(err) {
            client.channels.cache.get("606123726966358037").send("Failed to rickroll " + message.author.tag)
        }
        setTimeout( async () => {
            await msg.delete()
            await message.delete()
        }, 2000)
        
    },
}
