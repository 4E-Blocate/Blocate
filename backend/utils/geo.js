/**
 * Calculate distance between two GPS coordinates in kilometers using Haversine formula
 * @param {string} coord1 - "lat,long"
 * @param {string} coord2 - "lat,long"
 * @returns {number} Distance in km
 */
export function calculateDistance(coord1, coord2) {
    if (!coord1 || !coord2) return 0;

    const [lat1, lon1] = coord1.split(',').map(Number);
    const [lat2, lon2] = coord2.split(',').map(Number);

    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) return 0;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
