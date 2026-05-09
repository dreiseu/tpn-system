const manilaDateTimeFormatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
});

const manilaDateFormatter = new Intl.DateTimeFormat('en-PH', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
});

export function formatManilaDateTime(value: string | null | undefined): string {
    if (!value) {
        return 'N/A';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return manilaDateTimeFormatter.format(date);
}

export function formatManilaDate(value: string | null | undefined): string {
    if (!value) {
        return 'N/A';
    }

    const date = new Date(`${value}T00:00:00+08:00`);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return manilaDateFormatter.format(date);
}
