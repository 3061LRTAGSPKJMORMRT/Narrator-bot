const shuffle = require("shuffle-array")
const db = require("quick.db")
const pull = require("array-pull")
const { getRole, getEmoji, fn, ids } = require("../../config")

module.exports = {
    command: {
        name: "srole",
        description: "Set the roles and settings for the game!",
        options: [
            {
                type: "STRING",
                name: "gamemode",
                description: "Select the gamemode for this game.",
                required: true,
                choices: [
                    { name: "Quick", value: "quick" },
                    { name: "Sandbox", value: "sandbox" },
                    { name: "Custom", value: "custom" },
                    { name: "Chain Reaction", value: "chainreaction" },
                    { name: "Pure Random", value: "random" },
                    { name: "Ranked", value: "ranked" },
                ],
            },
            {
                type: "STRING",
                name: "roles",
                description: "List the roles for the game, separated by spaces.",
                required: false,
            },
            {
                type: "STRING",
                name: "hideroles",
                description: "Should the rolelist be hidden? (Default: false)",
                required: false,
                choices: [
                    { name: "True", value: "true" },
                    { name: "False", value: "false" },
                ],
            },
        ],
        defaultPermission: false,
    },
    permissions: {
        game: [
            { id: ids.narrator, type: "ROLE", permission: true }, // @Narrator
            { id: ids.mini, type: "ROLE", permission: true }, // @Narrator Trainee
            { id: "892046210536468500", type: "ROLE", permission: false }, // @Player
        ],
    },
    server: ["game"],
    run: async (interaction, client) => {

        // ---------- OPTIONS ----------
        let gamemode = interaction.options.getString("gamemode")
        let roles = interaction.options.getString("roles")
        let hideroles = interaction.options.getString("hideroles")
        let gamemode = interaction.options.getString("gamemode")
        
        // ---------- DISCORD CHANNELS AND ROLES ----------
        let alive = interaction.guild.roles.cache.find((r) => r.name === "Alive")
        let narrator = interaction.guild.roles.cache.find((r) => r.name === "Narrator")
        let mininarr = interaction.guild.roles.cache.find((r) => r.name === "Narrator Trainee")
        let revealed = interaction.guild.roles.cache.find((r) => r.name === "Revealed")
        let bot = interaction.guild.roles.cache.find((r) => r.name === "Bots")
        let wwsChat = interaction.guild.channels.cache.find((c) => c.name === "werewolves-chat")
        let wwsVote = interaction.guild.channels.cache.find((c) => c.name === "ww-vote")
        let dayChat = interaction.guild.channels.cache.find((c) => c.name === "day-chat")
        let gamlobi = interaction.guild.channels.cache.find((c) => c.name === "game-lobby")
        let sib = interaction.guild.channels.cache.find((c) => c.name === "sibling-chat")
        let bandits = interaction.guild.channels.cache.find((c) => c.name === "bandits")
        let sl = interaction.guild.channels.cache.find((c) => c.name === `sect-members`)
        let zomb = interaction.guild.channels.cache.find((c) => c.name === "zombies")

        // ---------- GAME RELATED ----------
        let rolelist = []
        let players = []
        let excludes = db.get("excludes") || []
        let banned = ["Bandit", "Accomplice", "Sect Leader", "Grave Robber", "Astral Wolf", "Split Wolf", "Preacher", "Wolf Trickser", "Ghost Lady", "Evil Detective"]
        let randoms = ["rrv", "rv", "rsv", "rww", "rk", "random", "random-regular-villager", "random-voting", "random-strong-villager", "random-werewolf", "random-killer"]
        let random = ["aura-seer", "avenger", "beast-hunter", "bodyguard", "cupid", "cursed", "doctor", "flower-child", "grave-robber", "grumpy-grandma", "loudmouth", "marksman", "mayor", "pacifist", "priest", "red-lady", "seer-apprentice", "sheriff", "spirit-seer", "tough-guy", "villager", "witch", "president", "detective", "forger", "fortune-teller", "gunner", "jailer", "medium", "seer", "alpha-werewolf", "guardian-wolf", "junior-werewolf", "kitten-wolf", "nightmare-werewolf", "shadow-wolf", "werewolf", "werewolf-berserk", "wolf-pacifist", "wolf-seer", "wolf-shaman", "sorcerer", "alchemist", "arsonist", "bomber", "cannibal", "corruptor", "illusionist", "serial-killer", "zombie", "fool", "headhunter"]
        let rrv = ["aura-seer", "avenger", "beast-hunter", "bodyguard", "doctor", "flower-child", "grave-robber", "grumpy-grandma", "loudmouth", "marksman", "mayor", "pacifist", "priest", "red-lady", "seer-apprentice", "sheriff", "spirit-seer", "tough-guy", "villager", "witch", "forger"]
        let rsv = ["detective", "fortune-teller", "gunner", "jailer", "medium", "seer"]
        let rww = ["alpha-werewolf", "guardian-wolf", "junior-werewolf", "kitten-wolf", "nightmare-werewolf", "shadow-wolf", "werewolf", "werewolf-berserk", "wolf-pacifist", "wolf-seer", "wolf-shaman"]
        let rk = ["alchemist", "arsonist", "bomber", "cannibal", "corruptor", "illusionist", "serial-killer"]
        let rv = ["fool", "headhunter"]
        let seerdet = ["seer", "detective"]
        let auraspirit = ["aura-seer", "spirit-seer"]
        let beastbunny = ["beast-hunter"] // , "easter-bunny"]
        let jailerwitch = ["jailer", "witch"]
        let mortrrv = ["mortician", "rrv"]
        let alphashaman = ["alpha-werewolf", "wolf-shaman"]
        let skcanni = ["serial-killer", "cannibal"]
        let foolhh = ["fool", "headhunter"]
        let foolhhrv = foolhh.concat("rv")
        let ftprog = ["fortune-teller", "prognosticator"]
        let dcrk = ["dreamcatcher", "rk"]
        let docbg = ["doctor", "bodyguard"]
        let gunnermarks = ["gunner", "marksman"]
        let cupidgr = ["cupid"] //, "grave-robber"]
        

        // get all the channels
        let channels = interaction.guild.channels.cache.filter(c => c.name.startsWith("priv-") && c.parentId === "892046231516368906")
        if (channels) return interaction.reply(`${getEmoji("error", client)} Please delete the following channels, and use this command again\n\nChannels to delete: ${channels.map(c => `<@${c.id}>`).join("\n")}`)

        // check if mode is custom AND includes invalid roles
        if (gamemode === "custom") {
            let customRoles = roles.split(" ")
            if (customRoles.length !== alive.members.cache.size) return interaction.reply(`${getEmoji("error")} The number of roles do not match the number of players in game!`)

            customRoles.forEach(role => {
                let roleData = getRole(role)
                if (!roleData || roleData.name === "Unknown Role") return interaction.reply(`${getEmoji("error")} Role \`${role}\` could not be found!`)
                if (!roleData.description) return interaction.reply(`${getEmoji("error")} The description for the \`${roleData.name}\` role is missing!`)
                if (banned.includes(roleData.name)) return interaction.reply(`The ${roleData.name} role is currently not available`)        
            })
        }

        // loop through each player and set their correct nickname
        alive.members.cache.sort((a, b) => Number(b.nickname) - Number(a.nickname)).map(a => a.id).forEach((player, i) => {
            if (player.nickname !== i+1) player.setNickname(`${i+1}`)
            players.push(player.id)
            db.set(`player_${player}`, { id: player.id, username: player.user.username })
        })

        db.set(`players`, players)

        if (gamemode == "ranked") excludes = ["grave-robber", "villager", "mayor", "pacifist", "seer-apprentice", "werewolf", "kitten-wolf", "wolf-pacifist"]
        
        random = pull(random, ...excludes, ...banned)
        rrv = pull(rrv, ...excludes, ...banned)
        rsv = pull(rsv, ...excludes, ...banned)
        rww = pull(rww, ...excludes, ...banned)
        rk = pull(rk, ...excludes, ...banned)
        rv = pull(rv, ...excludes, ...banned)

        if (gamemode == "quick") {
            alphashaman = shuffle(alphashaman)
            foolhh = shuffle(foolhh)
            jailerwitch = shuffle(jailerwitch)
            skcanni = shuffle(skcanni)
            seerdet = shuffle(seerdet)
            roleOptions = [
                ["Aura Seer", "Wolf Seer", "Doctor", "Avenger", "Detective", "Wolf Shaman", "Gunner", rv[0], "Witch", "Cannibal", "Medium", "Seer", "Alpha Werewolf", "Cursed", "Werewolf", "Cupid"],
                ["Aura Seer", "Wolf Seer", "Doctor", "Beast Hunter", "Aura Seer", "Wolf Shaman", "Gunner", rv[0], "Witch", "Bomber", "Medium", "Seer", "Alpha Werewolf", "Cursed", "Avenger", "Werewolf"],
                ["Aura Seer", "Wolf Seer", "Doctor", "Priest", "Tough Guy", alphashaman[0], "Marksman", foolhh[0], jailerwitch[0], skcanni[0], "Medium", seerdet[0], "Junior Werewolf", "Cursed", "Beast Hunter", "Werewolf"],
                ["Aura Seer", "Wolf Seer", "Doctor", "Priest", "Detective", "Wolf Shaman", "Gunner", foolhh[0], "Jailer", "Arsonist", "Medium", "Seer", "Alpha Werewolf", "Cursed", "Bodyguard", "Werewolf"],
            ]
        } else if (gamemode == "chainreaction") {
            roleOptions = [["avenger", "witch", "avenger", "detective", "avenger", "witch", "avenger", "corruptor", "fool", "avenger", "avenger", "aura", "illusionist", "avenger", "fool", "avenger", "medium"]]
        } else if (gamemode == "random") {
            roleOptions = [["random", "random", "random", "random", "random", "random", "random", "random", "random", "random", "random", "random", "random", "random", "random", "random", "random", "random"]]
        } else if (gamemode == "ranked") {
            if (alive.members.size < 9) {
                rww.splice(rww.indexOf("Shadow Wolf"), 1)
                rww.splice(rww.indexOf("Werewolf Berserk"), 1)
                rww.splice(rww.indexOf("Junior Werewolf"), 1)
                rww.splice(rww.indexOf("Guardian Wolf"), 1)
            }

            roleOptions = [
                ["Aura Seer", "rww", "rrv", "Doctor", "Detective", "Wolf Seer", "Marksman", "Headhunter", "Junior Werewolf", "Medium", "Jailer", "Arsonist", "rrv", "rww", "Priest", "rrv"],
                ["Aura Seer", "rww", "rrv", "Doctor", "Detective", "Wolf Seer", "Marksman", "Headhunter", "Junior Werewolf", "Medium", "Witch", "Cannibal", "rrv", "rww", "Priest", "rrv"],
                ["Detective", "Wolf Seer", "rrv", "Bodyguard", "Spirit Seer", "Wolf Shaman", "Gunner", "rv", "Nightmare Werewolf", "Medium", "Aura Seer", "Jailer", "Arsonist", "Corruptor", "Beast Hunter", "Priest", "Alpha Werewolf"],
                ["Detective", "Wolf Seer", "rrv", "Bodyguard", "Spirit Seer", "Wolf Shaman", "Gunner", "rv", "Nightmare Werewolf", "Medium", "Aura Seer", "Jailer", "Illusionist", "Cannibal", "Beast Hunter", "Priest", "Alpha Werewolf"],
            ]
        } else if (gamemode == "sandbox") {
            shuffle(auraspirit)
            shuffle(docbg)
            shuffle(rrv)
            shuffle(beastbunny)
            shuffle(gunnermarks)

            shuffle(cupidgr)
            roleOptions = [
                [auraspirit[0], "alpha-werewolf", docbg[0], "rrv", beastbunny[0], "wolf-seer", gunnermarks[0], foolhhrv[0], ftprog[0], dcrk[0], "medium", "seer", "werewolf-berserk", "rrv", "rww", cupidgr[0]],
                ["aura-seer", "alpha-werewolf", "bodyguard", "rrv", mortrrv[0], "wolf-seer", "gunner", "rv", "jailer", "hacker", "medium", "seer", "shadow-wolf", "rrv", "rww", "cupid"],
            ]
        } else if (gamemode == "custom") {
            excludes.forEach((role) => {
                role = role.replace(/ /g, "-")
                random = pull(random, role)
                rrv = pull(rrv, role)
                rsv = pull(rsv, role)
                rww = pull(rww, role)
                rk = pull(rk, role)
                rv = pull(rv, role)
            })
            roleOptions.push(args)
        }

    }
}
