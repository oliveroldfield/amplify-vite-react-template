import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { Authenticator } from '@aws-amplify/ui-react'
import { fetchAuthSession } from 'aws-amplify/auth'
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import '@aws-amplify/ui-react/styles.css'
import { Auth } from 'aws-amplify';

const client = generateClient<Schema>();

function App() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

    
  function deleteTodo(id: string) {
    client.models.Todo.delete({ id })
  }

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: (data) => setTodos([...data.items]),
    });
  }, []);

  function createTodo() {
    client.models.Todo.create({ content: window.prompt("Todo content") });
  }
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState(null);
  const [faceLivenessAnalysis, setFaceLivenessAnalysis] = useState(null);

  const fetchCreateLiveness = async () => {
    try {
      /* const session = await Auth.currentSession();
      const token = session.getIdToken().getJwtToken(); */
      const session = await fetchAuthSession();
      const token = session.tokens?.idToken

      const response = await fetch('https://z9p24rpnxe.execute-api.us-east-1.amazonaws.com/api/session', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        },
        body: JSON.stringify({}),
      });
      const data = await response.json();
      setSessionId(data.sessionId);
      setLoading(false);
    } catch (error) {
      console.error('Error creating liveness session:', error);
      setLoading(false);
    }
  };
  fetchCreateLiveness();

  const handleAnalysisComplete = async () => {
    setLoading(false);
    const session = await fetchAuthSession();
    const token = session.tokens?.idToken
    const response = await fetch(
      `https://z9p24rpnxe.execute-api.us-east-1.amazonaws.com/api/result?sessionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `${token}`
        }
      }
    );
    const data = await response.json();
    setFaceLivenessAnalysis(data);
    console.log(faceLivenessAnalysis);
  };

  return (
        
    <Authenticator>
      {({ signOut }) => (
    <main>
      <h1>My todos</h1>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li 
          onClick={() => deleteTodo(todo.id)}
          key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      {loading && <p>Loading...</p>}
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
      <button onClick={signOut}>Sign out</button>
      <FaceLivenessDetector
            sessionId={sessionId ?? ''}
            onAnalysisComplete={handleAnalysisComplete} region={"us-east-1"}        />
    </main>
        
      )}
      </Authenticator>
  );
}

export default App;
