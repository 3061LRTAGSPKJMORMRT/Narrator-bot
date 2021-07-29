const { MessageSelectMenu, MessageActionRow } = require("discord.js")
const { getLangNameFromCode } = require('language-name-map')


module.exports = {
    name: "settings",
    aliases: ["config"],
    run: async (message, args) => {
        let languageDropdown = new MessageSelectMenu().setCustomId(`configLanguage-${message.author.id}`).setMaxValues(1).setPlaceholder("Language")
        let allLanguages = require("../../i10n/allLanguages.js")
        allLanguages.forEach((x) => {
            let langName = getLangNameFromCode(x).native
            languageDropdown.addOptions({ label: langName, value: x })
        })
        message.channel.send({ content: message.i10n("customizeSettings"), components: [new MessageActionRow().addComponents(languageDropdown)] })
    },
}
