const db = require("quick.db") // database
const { getEmoji, getRole } = require("../../../config") // function

module.exports = async client => {
  
  const guild = client.guilds.cache.get("890234659965898813") // get the guild object - Object 
  const dayChat = guild.channels.cache.find(c => c.name === "day-chat") // get the day channel - Object 
  const werewolvesChat = guild.channels.cache.find(c => c.name === "werewolves-chat") // get the werewolves channel - Object 
  const players = db.get(`players`) || [] // get the players array - Array<Snowflake> 
  const alivePlayers = players.filter(p => db.get(`player_${p}`).status === "Alive") // get the alive players array - Array<Snowflake> 
  const naughtyboys = alivePlayers.filter(p => db.get(`player_${p}`).role === "Naughty Boy") // get the alive nb array - Array<Snowflake>
  const narrator = guild.roles.cache.find((r) => r.name === "Narrator")
  const mininarr = guild.roles.cache.find((r) => r.name === "Narrator Trainee")
  
  // loop through each naughty boy
  for (const boy of naughtyboys) {
  
    let nb = db.get(`player_${boy}`) // get the naughty bot player object - Object
    
    db.set(`player_${boy}.uses`, 0) // set the uses to 0 regardless if the swap was succesful or not.
    
    if (nb.target?.length !== 2) continue; // skip if the naughty boy doesn't have a target
    
    if (nb.target?.filter(p => alivePlayers.includes(p)).length !== 2) continue; // skip if one of them are not alive.
    
    let player1 = db.get(`player_${nb.target[0]}`) // get the player1 object - Object
    let player2 = db.get(`player_${nb.target[1]}`) // get the player2 object - Object
    
    let channel1 = guild.channels.cache.get(player1.channel) // get the channel from player 1 - Object
    let channel2 = guild.channels.cache.get(player2.channel) // get the channel from player 2 - Object
    
    // copy every data from player 1 to player 2
    Object.entries(player1).forEach(entry => {
      if (!["username", "id", "status", "channel", "allRoles"].includes(entry[0])) {
        db.set(`player_${nb.target[1]}.${entry[0]}`, entry[1])
        let allRoles = player1.allRoles || []
        allRoles.push(player1.role)
        db.set(`player_${nb.target[1]}.allRoles`, allRoles)
      }
    })
    
    // copy every data from player 2 to player 1
    Object.entries(player2).forEach(entry => {
      if (!["username", "id", "status", "channel", "allRoles"].includes(entry[0])) {
        db.set(`player_${nb.target[0]}.${entry[0]}`, entry[1])
        let allRoles = player1.allRoles || []
        allRoles.push(player2.role)
        db.set(`player_${nb.target[0]}.allRoles`, allRoles)
      }
    })
    
    // create the channels
    
    const newChannel1 = await guild.channels.create(`priv-${player2.role.toLowerCase().replace(/\s/g, "-")}`, { 
        parent: "892046231516368906", // the category id
        position: channel1.position - 1 // the same position where the channel is
    })

    // give permissions to the grave robber
    await newChannel1.permissionOverwrites.create(player1.id, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true
    })

    // disable permissions for the everyone role
    await newChannel1.permissionOverwrites.create(guild.id, {
        VIEW_CHANNEL: false,
    })

    // give permissions to narrator
    await newChannel1.permissionOverwrites.create(narrator.id, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true,
        MANAGE_CHANNELS: true,
        MENTION_EVERYONE: true,
        ATTACH_FILES: true,
    })

    // give permissions to narrator trainee
    await newChannel1.permissionOverwrites.create(mininarr.id, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true,
        MANAGE_CHANNELS: true,
        MENTION_EVERYONE: true,
        ATTACH_FILES: true,
    })
    
    const newChannel2 = await guild.channels.create(`priv-${player1.role.toLowerCase().replace(/\s/g, "-")}`, { 
        parent: "892046231516368906", // the category id
        position: channel2.position - 1 // the same position where the channel is
    })

    // give permissions to the grave robber
    await newChannel2.permissionOverwrites.create(player2.id, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true
    })

    // disable permissions for the everyone role
    await newChannel2.permissionOverwrites.create(guild.id, {
        VIEW_CHANNEL: false,
    })

    // give permissions to narrator
    await newChannel2.permissionOverwrites.create(narrator.id, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true,
        MANAGE_CHANNELS: true,
        MENTION_EVERYONE: true,
        ATTACH_FILES: true,
    })

    // give permissions to narrator trainee
    await newChannel2.permissionOverwrites.create(mininarr.id, {
        SEND_MESSAGES: true,
        VIEW_CHANNEL: true,
        READ_MESSAGE_HISTORY: true,
        MANAGE_CHANNELS: true,
        MENTION_EVERYONE: true,
        ATTACH_FILES: true,
    })
    
    await channel1.delete() // delete the old channel
    await channel2.delete() // delete the old channel
    
    await newChannel1.send(`Your role has been swapped by the Naughty Boy!\n\n${getRole(player2.role.toLowerCase().replace(/\s/g, "-")).description}`)
    .then(c => { await c.pin() ; await c.channel.bulkDelete(1) }) // sends the description, pins the message and deletes the last message
    await newChannel1.send(`<@${player1.id}>`)
    .then(c => setTimeout(() => c.delete(), 3000)) // pings the player and deletes the ping after 3 seconds
    
    await newChannel1.send(`Your role has been swapped by the Naughty BoY!\n\n${getRole(player1.role.toLowerCase().replace(/\s/g, "-")).description}`)
    .then(c => { await c.pin() ; await c.channel.bulkDelete(1) }) // sends the description, pins the message and deletes the last message
    await newChannel1.send(`<@${player2.id}>`)
    .then(c => setTimeout(() => c.delete(), 3000)) // pings the player and deletes the ping after 3 seconds
    
    db.set(`player_${nb.target[0]}.channel`, newChannel1.id) // set the new channel id in the database
    db.set(`player_${nb.target[1]}.channel`, newChannel2.id) // set the new channel id in the database
  
  }
  
}