import { useEffect, useState } from 'react';
import axios from 'axios';
import useAgentStore from '../store/useAgentStore';

export default function OmnichannelInbox() {
  const [tasks, setTasks] = useState([]);
  const { claimConversation } = useAgentStore();

  useEffect(() => {
    axios
      .get('/tasks/list')
      .then((res) => setTasks(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Omnichannel Inbox</h2>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            {task.subject}
            <button onClick={() => claimConversation(task.id)}>Claim</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
