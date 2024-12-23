import React, { useState, useEffect } from 'react';

type TimeInputProps = {
  value?: Date;
  onChange: (date: Date) => void;
};

const TimeInput: React.FC<TimeInputProps> = ({ value, onChange }) => {
  const [hours, setHours] = useState<string>('00');
  const [minutes, setMinutes] = useState<string>('00');

  useEffect(() => {
    if (value!==undefined) {
        console.log("value", value);
      setHours(value.getHours().toString().padStart(2, '0'));
      setMinutes(value.getMinutes().toString().padStart(2, '0'));
    }
  }, [value]);

  const handleChange = () => {
    const newDate = new Date();
    newDate.setHours(parseInt(hours, 10));
    newDate.setMinutes(parseInt(minutes, 10));
    onChange(newDate);
  };

  return (
    <div className="flex space-x-2">
      <input
        type="number"
        value={hours}
        onChange={(e) => {
          setHours(e.target.value);
          handleChange();
        }}
        min="0"
        max="23"
        className="border px-2 py-1"
      />
      <span>:</span>
      <input
        type="number"
        value={minutes}
        onChange={(e) => {
          setMinutes(e.target.value);
          handleChange();
        }}
        min="0"
        max="59"
        className="border px-2 py-1"
      />
    </div>
  );
};

export default TimeInput; 