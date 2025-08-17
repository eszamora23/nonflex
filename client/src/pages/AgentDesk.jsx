import { useEffect, useState } from 'react';
import axios from 'axios';
import OmnichannelInbox from '../components/OmnichannelInbox';
import AIAssistBubble from '../components/AIAssistBubble';
import useAgentStore from '../store/useAgentStore';

export default function AgentDesk() {
  const [tasks, setTasks] = useState([]);
  const { claimedConversations, toggleAI } = useAgentStore();

  useEffect(() => {
    axios
      .get('/tasks/list')
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <button onClick={toggleAI}>Toggle AI</button>
      <AIAssistBubble />
      <h1>Agent Desk</h1>
      <p>Total Tasks: {tasks.length}</p>
      <OmnichannelInbox />
      <div>
        <h3>Claimed Conversations</h3>
        <ul>
          {claimedConversations.map((id) => (
            <li key={id}>{id}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
