import { MockAgent, setGlobalDispatcher, _getGlobalDispatcher } from "undici";

const agent = new MockAgent();
agent.disableNetConnect();
setGlobalDispatcher(agent);

// Make agent accessible in tests
// @ts-expect-error attach for convenience
global.__mockAgent = agent;

export const getMockAgent = () => agent;
