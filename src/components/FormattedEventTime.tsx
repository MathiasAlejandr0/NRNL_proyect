
'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Timestamp } from 'firebase/firestore'; // Keep for potential mixed usage if needed, though Prisma uses Date

interface FormattedEventTimeProps {
    dateTime: Timestamp | Date | string; // Accept Timestamp, Date object, or ISO string
    formatString?: string; // Optional custom format
}

export function FormattedEventTime({ dateTime, formatString = "eee, MMM d 'at' h:mm a" }: FormattedEventTimeProps) {
    const [formattedDateTime, setFormattedDateTime] = useState<string | null>(null);

    useEffect(() => {
        try {
            let date: Date;
            if (dateTime instanceof Date) {
                 date = dateTime; // Already a Date object (from Prisma)
            } else if (typeof dateTime === 'string') {
                date = new Date(dateTime); // Handle ISO string input
            } else if (dateTime && typeof (dateTime as Timestamp).toDate === 'function') {
                 // Handle potential Firestore Timestamp object
                date = (dateTime as Timestamp).toDate();
            } else {
                 throw new Error("Invalid date/timestamp provided");
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
