module.exports = function(prefix){
    return `
    The prefix for the bot is \`${prefix}\`.
    **Commands:**
    ${prefix}start - starts the server
    ${prefix}status - gets the status of the server
    ${prefix}help - shows this message
    `;
}