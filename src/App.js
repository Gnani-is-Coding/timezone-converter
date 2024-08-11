import React, { useState } from 'react';
import moment from 'moment-timezone';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const App = () => {
  const [timezones, setTimezones] = useState(['UTC', 'Asia/Kolkata']);
  const [currentTime, setCurrentTime] = useState(moment());
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleAddTimezone = (newTimezone) => {
    if (newTimezone && !timezones.includes(newTimezone)) {
      setTimezones([...timezones, newTimezone]);
    }
  };

  const handleRemoveTimezone = (index) => {
    setTimezones(timezones.filter((_, i) => i !== index));
  };

  const handleTimeChange = (date) => {
    setCurrentTime(moment(date));
  };

  const handleSliderChange = (e) => {
    const minutes = parseInt(e.target.value);
    setCurrentTime(moment().startOf('day').add(minutes, 'minutes'));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(timezones);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTimezones(items);
  };

  const reverseOrder = () => {
    setTimezones([...timezones].reverse());
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const getShareableLink = () => {
    const baseUrl = window.location.origin;
    const params = new URLSearchParams({
      time: currentTime.toISOString(),
      zones: timezones.join(','),
    });
    return `${baseUrl}?${params.toString()}`;
  };

  const scheduleMeet = () => {
    const startTime = currentTime.format('YYYYMMDDTHHmmss');
    const endTime = currentTime.clone().add(2, 'hours').format('YYYYMMDDTHHmmss');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Meeting&dates=${startTime}/${endTime}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <h1>Timezone Converter</h1>
      <div className="controls">
        <DatePicker
          selected={currentTime.toDate()}
          onChange={handleTimeChange}
          showTimeSelect
          dateFormat="MMMM d, yyyy h:mm aa"
        />
        <input
          type="range"
          min="0"
          max="1440"
          value={currentTime.diff(moment().startOf('day'), 'minutes')}
          onChange={handleSliderChange}
        />
        <button onClick={reverseOrder}>Reverse Order</button>
        <button onClick={toggleDarkMode}>Toggle Dark Mode</button>
        <button onClick={scheduleMeet}>Schedule Meet</button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="timezones">
          {(provided) => (
            <ul {...provided.droppableProps} ref={provided.innerRef}>
              {timezones.map((zone, index) => (
                <Draggable key={`${zone}-${index}`} draggableId={`${zone}-${index}`} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <span>{zone}: {currentTime.tz(zone).format('MMMM D, YYYY h:mm A')}</span>
                      <button onClick={() => handleRemoveTimezone(index)}>×</button>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <div>
        <select onChange={(e) => handleAddTimezone(e.target.value)}>
          <option value="">Add Timezone</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Los_Angeles">Pacific Standard Time</option>
          <option value="Europe/London">London</option>
          <option value="Asia/Tokyo">Tokyo</option>
          <option value="Australia/Sydney">Sydney</option>
        </select>
      </div>
      <div>
        <p>Shareable Link: {getShareableLink()}</p>
      </div>
    </div>
  );
};

export default App;