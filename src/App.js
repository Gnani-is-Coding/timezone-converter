import React, { useState } from 'react';
import moment from 'moment-timezone';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';

const SortableItem = ({ id, zone, currentTime, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleRemoveClick = (e) => {
    e.stopPropagation();
    onRemove(zone);
  };

  return (
    <li ref={setNodeRef} style={style} {...attributes} {...listeners} className="timezone-item">
      <div className="timezone-info">
        <span className="timezone-name">{zone}</span>
        <span className="timezone-time">{currentTime.tz(zone).format('h:mm A')}</span>
        <span className="timezone-date">{currentTime.tz(zone).format('ddd, MMM D')}</span>
      </div>
      <button 
        onClick={handleRemoveClick} 
        className="remove-btn"
        style={{ cursor: 'pointer', zIndex: 1000 }}
      >
        ×
      </button>
    </li>
  );
};

const App = () => {
  const [timezones, setTimezones] = useState(['UTC', 'Asia/Kolkata']);
  const [currentTime, setCurrentTime] = useState(moment());
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleAddTimezone = (newTimezone) => {
    if (newTimezone && !timezones.includes(newTimezone)) {
      setTimezones([...timezones, newTimezone]);
    }
  };

  const handleRemoveTimezone = (zoneToRemove) => {
    console.log('Removing timezone:', zoneToRemove);
    setTimezones(timezones.filter(zone => zone !== zoneToRemove));
  };

  const handleTimeChange = (date) => {
    setCurrentTime(moment(date));
  };

  const handleSliderChange = (e) => {
    const minutes = parseInt(e.target.value);
    setCurrentTime(moment().startOf('day').add(minutes, 'minutes'));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setTimezones((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newItems = [...items];
        newItems.splice(oldIndex, 1);
        newItems.splice(newIndex, 0, items[oldIndex]);
        return newItems;
      });
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const createGoogleCalendarEvent = () => {
    const startTime = currentTime.format('YYYYMMDDTHHmmss');
    const endTime = currentTime.clone().add(1, 'hour').format('YYYYMMDDTHHmmss');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=New Event&dates=${startTime}/${endTime}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <header>
        <h1>Timezone Converter</h1>
        <button onClick={toggleDarkMode} className="mode-toggle">
          {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
        </button>
      </header>
      <main>
        <section className="time-input">
          <h2>Select Time</h2>
          <DatePicker
            selected={currentTime.toDate()}
            onChange={handleTimeChange}
            showTimeSelect
            dateFormat="MMMM d, yyyy h:mm aa"
            className="date-picker"
          />
          <div className="slider-container">
            <input
              type="range"
              min="0"
              max="1439"
              value={currentTime.diff(currentTime.clone().startOf('day'), 'minutes')}
              onChange={handleSliderChange}
              className="time-slider"
            />
            <div className="slider-labels">
              <span>12 AM</span>
              <span>12 PM</span>
              <span>11:59 PM</span>
            </div>
          </div>
          <button onClick={createGoogleCalendarEvent} className="calendar-btn">
            Create Google Calendar Event
          </button>
        </section>
        <section className="timezone-list">
          <h2>Timezones</h2>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={timezones} strategy={verticalListSortingStrategy}>
              <ul>
                {timezones.map((zone) => (
                  <SortableItem key={zone} id={zone} zone={zone} currentTime={currentTime} onRemove={handleRemoveTimezone} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
          <div className="add-timezone">
            <select onChange={(e) => handleAddTimezone(e.target.value)}>
              <option value="">Add Timezone</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Los_Angeles">Pacific Standard Time</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Australia/Sydney">Sydney</option>
            </select>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;