from flask import Flask, request, jsonify
import aiohttp
import asyncio
from datetime import datetime
import populartimes
import pytz
from aiocache import Cache
from aiocache.decorators import cached

app = Flask(__name__)

# Initialize an in-memory cache. For production, Redis is recommended for scaling.
cache = Cache(Cache.MEMORY)

# Replace this with your Google Places API key (Ensure this is secured and not exposed publicly).
API_KEY = 'Your_Google_API_Key'

# Fetch detailed place information asynchronously from Google Places API
async def fetch_place_details(session, place_id):
    url = f"https://maps.googleapis.com/maps/api/place/details/json?place_id={place_id}&fields=name,popular_times&key={API_KEY}"
    async with session.get(url) as response:
        return await response.json()

# Asynchronous function to get Popular Times data and estimate wait time
# Cache the response for 10 days to optimize repeated API calls.
@cached(ttl=864000)  # Cache for 864000 seconds = 10 days
async def get_estimated_wait_time(place_id):
    async with aiohttp.ClientSession() as session:
        # Fetch place details from the Google Places API
        data = await fetch_place_details(session, place_id)

        # Fetch populartimes data (this is a blocking call; you may optimize this)
        data = populartimes.get_id(API_KEY, place_id)

        # Get current day and time based on IST timezone (India)
        ist_timezone = pytz.timezone('Asia/Kolkata')
        now = datetime.now(ist_timezone)
        current_day = now.strftime('%A')  # Get the day of the week, e.g., 'Monday'
        current_hour = now.hour  # Get current hour in 24-hour format

        # Extract Popular Times data for the current day
        popular_times_data = None
        for day_data in data['populartimes']:
            if day_data['name'] == current_day:
                popular_times_data = day_data['data']
                break

        # If we have popular times data, estimate wait time
        if popular_times_data:
            def map_busy_percentage(busy_percentage):
                """Map the busy percentage to an estimated wait time in minutes."""
                if 0 <= busy_percentage < 20:
                    return 0  # 0-5 minutes
                elif 20 <= busy_percentage < 30:
                    return 1  # 5-10 minutes
                elif 30 <= busy_percentage < 50:
                    return 2  # 10-20 minutes
                elif 50 <= busy_percentage < 70:
                    return 3  # 20-40 minutes
                elif 70 <= busy_percentage < 90:
                    return 4  # 40-60 minutes
                else:
                    return 5  # 60-90 minutes

            # Convert the popular times data into wait time estimates
            converted_data = {}
            for day_data in data['populartimes']:
                day_name = day_data['name'][:3].lower()  # Use short lowercase day names (e.g., 'mon')
                converted_data[day_name] = [map_busy_percentage(x) for x in day_data['data']]

            # Estimate wait time for the current hour
            busy_percentage = popular_times_data[current_hour]
            wait_time = map_busy_percentage(busy_percentage)

            return wait_time, converted_data
        else:
            return "No data available", {}

# API route to get the estimated wait time based on place_id
@app.route('/projects/api2/', methods=['POST'])
async def get_wait_time():
    data = request.get_json()
    place_id = data.get('place_id')

    # Validate the presence of 'place_id'
    if not place_id:
        return jsonify({"error": "Missing place_id"}), 400

    try:
        # Fetch estimated wait time asynchronously
        wait_time, converted_data = await get_estimated_wait_time(place_id)
        return jsonify({"wait_time": wait_time, "converted_data": converted_data})
    except Exception as e:
        # Return error message in case of an exception
        return jsonify({"error": str(e)}), 500

# Entry point for running the Flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002, debug=False)
