import React from 'react';
import { contacts } from '@prisma/client';
interface ContactFietsenstallingenProps {
  contact: contacts | undefined;
}

const ContactFietsenstallingen: React.FC<ContactFietsenstallingenProps> = ({ contact }) => {
    console.log("#### contact", contact);
    
  return (
    <div>
      <h2>Fietsenstallingen</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="py-2">Naam</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* {contact.map((fietsenstalling) => (
            <tr key={'fietsenstalling-' + fietsenstalling.id}>
              <td className="border px-4 py-2">{fietsenstalling.title}</td>
              <td className="border px-4 py-2">
                <button className="text-yellow-500 mx-1 disabled:opacity-40">✏️</button>
                <button className="text-red-500 mx-1 disabled:opacity-40">🗑️</button>
              </td>
            </tr>
          ))} */}
        </tbody>
      </table>
      <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Add New Fietsenstalling</button>
    </div>
  );
};

export default ContactFietsenstallingen;
