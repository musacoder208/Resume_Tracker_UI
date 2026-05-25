// src/components/ui/DateTimePickerRefactor/FormTimePicker.tsx

import { useState, type JSX } from 'react';
import { useFormContext } from 'react-hook-form';
import { DateTimePicker } from '../DateTimePicker';

interface FormTimePickerProps {
  timeFieldName: string;
  ampmFieldName: string;
  placeholder?: string;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function FormTimePicker({
  timeFieldName,
  ampmFieldName,
  placeholder = 'Select time',
  disabled = false,
  size = 'medium',
}: FormTimePickerProps): JSX.Element {
  const { setValue, getValues } = useFormContext();

  const [timeValue, setTimeValue] = useState<string | undefined>(
    getValues(timeFieldName) as string | undefined
  );
  const [ampmValue, setAmpmValue] = useState<'AM' | 'PM' | undefined>(
    getValues(ampmFieldName) as 'AM' | 'PM' | undefined
  );

  const parseTimeToDate = (time?: string, ampm?: 'AM' | 'PM'): Date | undefined => {
    if (!time) return undefined;
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return undefined;
    const date = new Date();
    let adjustedHours = hours;
    if (ampm === 'PM' && hours !== 12) adjustedHours += 12;
    if (ampm === 'AM' && hours === 12) adjustedHours = 0;
    date.setHours(adjustedHours, minutes, 0, 0);
    return date;
  };

  const formatTimeFromDate = (date?: Date): { time: string; ampm: 'AM' | 'PM' } => {
    if (!date) return { time: '', ampm: 'AM' };
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return {
      time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
      ampm,
    };
  };

  const handleTimeChange = (date: Date | undefined): void => {
    if (!date) {
      setTimeValue('');
      setAmpmValue('AM');
      setValue(timeFieldName, '', { shouldValidate: true });
      setValue(ampmFieldName, 'AM', { shouldValidate: true });
      return;
    }
    const { time, ampm } = formatTimeFromDate(date);
    setTimeValue(time);
    setAmpmValue(ampm);
    setValue(timeFieldName, time, { shouldValidate: true });
    setValue(ampmFieldName, ampm, { shouldValidate: true });
  };

  return (
    <DateTimePicker
      mode="time"
      value={parseTimeToDate(timeValue, ampmValue)}
      onChange={handleTimeChange}
      placeholder={placeholder}
      disabled={disabled}
      use12Hour
      size={size}
    />
  );
}
