const Extra = require('telegraf/extra');

module.exports = () => {
  return async ctx => {
    const { axios, helpers, message, reply, replyWithMarkdown, state } = ctx;
    const { kyber } = axios;
    const { inReplyTo } = Extra;
    const { args } = state.command;

    if (!state.allowed) {
      reply('You are not whitelisted to use this bot', inReplyTo(message.message_id));
      return;
    }

    if (args.length < 1) {
      reply(
        `ERROR: Invalid number of arguments. ${args.length} of required 1 provided.`,
        inReplyTo(message.message_id),
      );
      return;
    }

    const network = (args[1]) ? args[1].toLowerCase() : 'mainnet';
    const currencies = (await kyber.get('/currencies')).data.data;
    let token = args[0];

    if (token.toUpperCase() === 'ETH') {
      token = { address: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' };
    } else if (
      !token.startsWith('0x') &&
      (network.toLowerCase() == 'mainnet' || network.toLowerCase() == 'staging')
    ) {
      token = currencies.find(o => o.symbol === token.toUpperCase());
    } else if (
      token.length === 42 &&
      token.startsWith('0x')
    ) {
      token = { address: token };
    } else {
      token = undefined;
    }

    if (!token) {
      reply('Invalid token symbol or address.', inReplyTo(message.message_id));
      return;
    }

    const reservesPerTokenSrc = helpers.getStorageFunction(network, 'getReserveIdsPerTokenSrc');
    const reservesPerTokenDest = helpers.getStorageFunction(network, 'getReserveIdsPerTokenDest');
    const srcReserveIds = await reservesPerTokenSrc(token.address).call();
    const destReserveIds = await reservesPerTokenDest(token.address).call();

    replyWithMarkdown(
      `Src ReserveIds: \`${srcReserveIds.join('`, `')}\`\nDest ReserveIds: \`${destReserveIds.join('`, `')}\``,
      inReplyTo(message.message_id),
    );
  };
};
