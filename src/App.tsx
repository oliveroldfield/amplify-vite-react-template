import { useEffect, useState } from "react";
import { Loader, ThemeProvider } from '@aws-amplify/ui-react';
import { FaceLivenessDetector } from '@aws-amplify/ui-react-liveness';
import '@aws-amplify/ui-react/styles.css'


function App() {
  const [loading, setLoading] = useState(true);
  const [createLivenessApiData, setCreateLivenessApiData] = useState<any>(null);
  const [faceLivenessAnalysis, setFaceLivenessAnalysis] = useState<any>(null);

  useEffect(() => {
    const fetchCreateLivenessSession = async () => {
      try {
        const response = await fetch('https://z9p24rpnxe.execute-api.us-east-1.amazonaws.com/api/session', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const data = await response.json();
        setCreateLivenessApiData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error creating liveness session:', error);
        setLoading(false);
      }
    };
    fetchCreateLivenessSession();
  }, []);
  

  const handleAnalysisComplete = async () => {
    setLoading(false);
    const response = await fetch(
      `https://z9p24rpnxe.execute-api.us-east-1.amazonaws.com/api/results?sessionId=${createLivenessApiData?.sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    setFaceLivenessAnalysis(data.response);
    console.log(faceLivenessAnalysis);
  };

  return (
        
    <ThemeProvider>
      {loading ? (
        <Loader />
      ) : (
        <FaceLivenessDetector
          sessionId={createLivenessApiData?.sessionId || ''}
          region="us-east-1"
          onAnalysisComplete={handleAnalysisComplete}
          onError={(error) => {
            console.error(error);
          }}
        />
      )}
      {faceLivenessAnalysis.Status === "SUCCEEDED" ? (
        <div>
          <h1>Liveness Detection Result: {faceLivenessAnalysis.Status}</h1>          
          <p>Confidence Score: {faceLivenessAnalysis.Confidence}</p>
        </div>
      ) : (
        <div>
          <h1>Liveness Detection Result: {faceLivenessAnalysis?.Status || "PENDING"}</h1>
        </div>
      )}
    </ThemeProvider>  
  );
}

export default App;
