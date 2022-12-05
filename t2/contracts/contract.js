export async function handle(state, action) {
  switch (action.input.function) {
    case 'helloWrite': {
      const name = action.input.name;
      const caller = action.caller;
      logger.info(`name => ${name}`);
      logger.info(`caller => ${caller}`);
      if (!name) {
        throw new ContractError(`Creator must provide a name.`);
      }
      if (state.messages[caller]) {
        throw new ContractError(`Creator already added.`);
      }
      state.messages[caller] = name;

      return { state };
    }

    default: {
      throw new ContractError(`Unsupported contract function: ${functionName}`);
    }
  }
}
