const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`, inReplyTo(message.message_id),
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = (args[1]) ? args[1].toLowerCase() : 'mainnet';
    const reserve = args[0].toLowerCase();

    const getReserves = helpers.getNetworkFunction(network, 'getReserves');
    const reserves = await getReserves().call();

    const result = reserves.findIndex(r => reserve.toLowerCase() === r.toLowerCase());

    if (result === -1) {
      reply('Reserve not found.', inReplyTo(message.message_id));
    } else {
      replyWithMarkdown(`${result}`, inReplyTo(message.message_id));
    }
  };
};
