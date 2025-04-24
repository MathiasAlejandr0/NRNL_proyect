
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface FormattedEventTimeProps {
    dateTime: Date | string; // Accept Date object or ISO string (though mock provides Date)
    formatString?: string; // Optional custom format
}

export function FormattedEventTime({ dateTime, formatString = "eee, MMM d 'at' h:mm a" }: FormattedEventTimeProps) {
    const [formattedDateTime, setFormattedDateTime] = useState<string | null>(null);

    useEffect(() => {
        try {
            let date: Date;
            if (dateTime instanceof Date) {
                 date = dateTime; // Already a Date object (from mock data)
            } else if (typeof dateTime === 'string') {
                date = new Date(dateTime); // Handle ISO string input just in case
            } else {
                 throw new Error("Invalid date provided");
            }

            // Check if date is valid before formatting
            if (!isNaN(date.getTime())) {
                 setFormattedDateTime(format(date, formatString));
            } else {
                console.warn("Invalid date resulted from input:", dateTime);
                setFormattedDateTime("Invalid date");
            }
        } catch (error: any) {
             console.error("Error formatting date:", error);
             setFormattedDateTime(`Error: ${error.message}`);
        }

    }, [dateTime, formatString]);

    // Render a placeholder during SSR/initial render, then the formatted time
    return <>{formattedDateTime ?? <span className="opacity-70">Loading date...</span>}</>;
}
