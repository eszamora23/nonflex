async function initialize() {
  const response = await fetch('/tokens/conversations');
  const data = await response.json();
  const client = await Twilio.Conversations.Client.create(data.token);

  const button = document.getElementById('send-button');
  let activeConversation;

  async function getConversation() {
    if (activeConversation) return activeConversation;
    try {
      activeConversation = await client.createConversation({ uniqueName: 'sample' });
      await activeConversation.join();
    } catch (err) {
      activeConversation = await client.getConversationByUniqueName('sample');
    }
    return activeConversation;
  }

  button.addEventListener('click', async () => {
    const conversation = await getConversation();
    await conversation.sendMessage('Hello from Conversations!');
  });
}

initialize().catch(console.error);
