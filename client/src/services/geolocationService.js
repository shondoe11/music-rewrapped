//& get user current position using browser geolocation API
const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation is not supported by your browser'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            position => resolve(position),
            error => reject(error),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
    });
};

//& convert latitude & longitude to country code using reverse geocoding API
const getCountryFromCoordinates = async (latitude, longitude) => {
    try {
        //~ free reverse geocoding API (OpenStreetMap's Nominatim)
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=3&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'en-US,en;q=0.9',
                    'User-Agent': 'Music-ReWrapped/1.0'  //~ myApp identification
                }
            }
        );

        if (!response.ok) {
            throw new Error('Failed to get location data');
        }

        const data = await response.json();

        //~ extract country code frm response
        const countryCode = data.address.country_code;

        if (countryCode) {
            return countryCode.toUpperCase();
        } else {
            throw new Error('Country code not found in response');
        }
    } catch (error) {
        console.error('Error getting country from coordinates:', error);
        throw error;
    }
};

//& detect user country code based their geographical location
const detectUserCountry = async () => {
    try {
        //~ 1st try: get user position via browser geolocation
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;

        return await getCountryFromCoordinates(latitude, longitude);
    } catch (geolocationError) {
        console.error('Geolocation error:', geolocationError);

        //~ fallback: try get country frm IP address
        try {
            const response = await fetch('https://ipapi.co/json/');
            const data = await response.json();

            if (data.country_code) {
                return data.country_code.toUpperCase();
            }
        } catch (ipError) {
            console.error('IP geolocation error:', ipError);
        }

        //~return default country code if all attempts fail
        return 'SG';
    }
};

export default {
    detectUserCountry,
    getCurrentPosition,
    getCountryFromCoordinates
};