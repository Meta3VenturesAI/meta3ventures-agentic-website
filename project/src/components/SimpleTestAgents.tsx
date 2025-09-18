import React from 'react';

const SimpleTestAgents: React.FC = () => {
  console.log('SimpleTestAgents component rendering...');
  
  return (
    <div style={{ 
      backgroundColor: 'red', 
      color: 'white', 
      padding: '20px', 
      textAlign: 'center',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      🚨 TEST AGENTS SECTION - VISIBLE ON HOMEPAGE 🚨
    </div>
  );
};

export default SimpleTestAgents;
