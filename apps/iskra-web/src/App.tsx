import React from 'react';
import { supabase } from '@iskra/engine';

function App() {
  const [status, setStatus] = React.useState('Connecting...');

  React.useEffect(() => {
    supabase.from('graph_nodes').select('count', { count: 'exact', head: true })
      .then(({ status }) => setStatus(status === 200 || status === 204 ? 'Connected' : 'Error'))
      .catch((err) => setStatus('Error: ' + err.message));
  }, []);

  return (
    <div>
      <h1>Iskra Web</h1>
      <p>Supabase Status: {status}</p>
    </div>
  );
}

export default App;
