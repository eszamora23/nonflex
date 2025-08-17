import useAgentStore from '../store/useAgentStore';

export default function AIAssistBubble() {
  const { aiEnabled } = useAgentStore();
  return <div>AI Assist: {aiEnabled ? 'Enabled' : 'Disabled'}</div>;
}
