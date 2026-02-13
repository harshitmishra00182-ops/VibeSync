import React from 'react'
import Mood from '../components/Mood'; 


const Explore = ({ isMinimalist }) => {
  return (
    <div>
      <Mood isMinimalist={isMinimalist} />
      
      
    </div>
  );
};

export default Explore;