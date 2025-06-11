//import {patientUrl} from '@/constants';

const {patientUrl}= require('..src/constants.js');
async function addPatient(patient){
     const response = await fetch(patientUrl, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ patient: formData }) 
          });
    
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to add patient');
          }
    
          const responseData = await response.json();
          console.log('✅ User added:', responseData);

}
module.exports={addPatient};