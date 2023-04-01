import { Sandbox } from '../sandbox';

export function messageChannel(_sandbox: Sandbox) {
  const messageChannelSet = new Set<MessageChannel>();

  class ProxyMessageChannel extends MessageChannel {
    constructor() {
      super();
      messageChannelSet.add(this);
    }
  }

  const recover = () => {
    messageChannelSet.forEach((messageChannel) => {
      messageChannel.port1.close();
      messageChannel.port2.close();
    });
    messageChannelSet.clear();
  };

  return {
    recover,
    override: {
      MessageChannel: ProxyMessageChannel,
    },
  };
}
