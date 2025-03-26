export const formatRecommendedEventDateTime = (event) => {
    //~ event.event_date if avail, else fallback event.date
    const dateStr = event.event_date || event.date;
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    //~ mins formatting
    const trimmedTime = minutes === 0 ? `${hours} ${ampm}` : `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    return `${day} ${monthNames[monthIndex]} ${year}, ${trimmedTime}`;
};

//& format dates fr external events
export const formatExternalEventDateTime = (event) => {
    let dateStr = null;
    if (event.dates && event.dates.start) {
        dateStr = event.dates.start.dateTime || event.dates.start.localDate;
    } else if (event.startDate) {
        dateStr = event.startDate;
    } else if (event.date) {
        dateStr = event.date;
    }
    if (!dateStr) return '';
    const dateObj = new Date(dateStr);
    const day = dateObj.getDate();
    const monthIndex = dateObj.getMonth();
    const year = dateObj.getFullYear();
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    let hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    const trimmedTime = minutes === 0 ? `${hours} ${ampm}` : `${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
    return `${day} ${monthNames[monthIndex]} ${year}, ${trimmedTime}`;
};

//& image URL frm event
export const getEventImage = (event) => {
    if (event.images && event.images.length > 0) {
        return event.images[0].url;
    } else if (event.image) {
        return event.image;
    }
    return null;
};

//& createEventPayload helper: standardize event data fr saveEvent API
export const createEventPayload = (eventData, userId) => {
    return {
        user_id: userId,
        title: eventData.title || eventData.name, //~ use title; fallback name
        location: eventData._embedded && eventData._embedded.venues
            ? eventData._embedded.venues[0].name
            : (typeof eventData.location === 'object' && eventData.location !== null
                ? eventData.location.name
                : eventData.location || 'N/A'),
        //~ pref eventData.event_date fr promoter events; else use external date info
        date: eventData.event_date ||
            (eventData.dates && eventData.dates.start
                ? (eventData.dates.start.dateTime || eventData.dates.start.localDate)
                : (eventData.startDate || eventData.date || null)),
        url: eventData.url || '',
        image: getEventImage(eventData) || '',
        details: eventData.details || ''
    };
};