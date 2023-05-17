import React from 'react';
import { v4 as uuidv4 } from 'uuid'; 
import {Navigate} from 'react-router-dom'
import {BrowserRouter as Router, 
  Routes, 
  Route,
  Redirect
} from "react-router-dom";
import TextEditor from './components/TextEditor';
function App() {
  return (
      <Router> {/*tell what to display in a particular path*/}
        <Routes> {/*redirects to that particular path */}
        <Route path="/" element={<Navigate to={`/document/${uuidv4()}`} />}>
  
        </Route>
        <Route path="/document/:id" element={<TextEditor />} />
        </Routes>
      </Router> 
    
  );
}

export default App;
//uuid 