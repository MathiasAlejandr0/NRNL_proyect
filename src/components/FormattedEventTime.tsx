
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface FormattedEventTimeProps {
    dateTime: string;
    formatString?: string; // Optional custom format
}

export function FormattedEventTime({ dateTime, formatString = "eee, MMM d 'at' h:mm a" }: FormattedEventTimeProps) {
    const [formattedDateTime, setFormattedDateTime] = useState<string | null>(null);

    useEffect(() => {
        // Ensure this runs only on the client after mounting
        try {
            const date = new Date(dateTime);
            // Check if date is valid before formatting
            if (!isNaN(date.getTime())) {
                 setFormattedDateTime(format(date, formatString));
            } else {
                console.warn("Invalid date provided to FormattedEventTime:", dateTime);
                setFormattedDateTime("Invalid date"); // Or handle appropriately
            }
        } catch (error) {
             console.error("Error formatting date:", error);
             setFormattedDateTime("Error formatting date");
        }

    }, [dateTime, formatString]);

    // Render null during SSR and initial client render before useEffect runs to avoid mismatch
    // Render the formatted time once available client-side
    // Added a fallback text for better UX while loading client-side
    return <>{formattedDateTime ?? <span className="opacity-70">Loading date...</span>}</>;
}
