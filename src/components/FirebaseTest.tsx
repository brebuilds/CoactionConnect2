import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export function FirebaseTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<{
    connection?: any;
    data?: any;
  }>({});

  const runTests = async () => {
    setTesting(true);
    setResults({});
    
    try {
      console.log('🔥 Starting Firebase tests...');
      
      // Test connection by reading from a collection
      const testCollection = collection(db, 'test');
      const snapshot = await getDocs(testCollection);
      
      const connectionResult = {
        success: true,
        message: 'Connected to Firestore successfully'
      };
      setResults(prev => ({ ...prev, connection: connectionResult }));
      
      // Test data operations
      const testData = {
        message: 'Hello from CoactionConnect!',
        timestamp: new Date(),
        project: 'test-project'
      };
      
      const docRef = await addDoc(collection(db, 'test'), testData);
      
      const dataResult = {
        success: true,
        message: 'Data written successfully',
        docId: docRef.id
      };
      setResults(prev => ({ ...prev, data: dataResult }));
      
    } catch (error) {
      console.error('Test failed:', error);
      setResults(prev => ({ 
        ...prev, 
        error: { success: false, error: error.message } 
      }));
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔥 Firebase Integration Test
        </CardTitle>
        <CardDescription>
          Test your Firebase connection and data operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Firebase...
            </>
          ) : (
            'Run Firebase Tests'
          )}
        </Button>

        {results.connection && (
          <Alert className={results.connection.success ? "border-green-500" : "border-red-500"}>
            <div className="flex items-center gap-2">
              {results.connection.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <strong>Connection Test:</strong> {results.connection.success ? 'Success!' : 'Failed'}
                {results.connection.message && (
                  <div className="text-sm mt-1">
                    {results.connection.message}
                  </div>
                )}
                {results.connection.error && (
                  <div className="text-sm mt-1 text-red-600">
                    Error: {results.connection.error}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {results.data && (
          <Alert className={results.data.success ? "border-green-500" : "border-red-500"}>
            <div className="flex items-center gap-2">
              {results.data.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <strong>Data Operations Test:</strong> {results.data.success ? 'Success!' : 'Failed'}
                {results.data.success && (
                  <div className="text-sm mt-1">
                    Document ID: {results.data.docId}
                  </div>
                )}
                {results.data.error && (
                  <div className="text-sm mt-1 text-red-600">
                    Error: {results.data.error}
                  </div>
                )}
              </AlertDescription>
            </div>
          </Alert>
        )}

        {results.connection?.success && results.data?.success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>🎉 All tests passed!</strong> Firebase is properly configured and working.
              Your app can now use persistent storage with more generous limits.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}