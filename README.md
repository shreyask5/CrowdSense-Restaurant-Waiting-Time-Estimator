# CrowdSense: Restaurant Waiting Time Estimator

## **Try CrowdSense Live**: (https://shreyask.in/projects/crowd-sense)

This project, **CrowdSense**, is a web application designed to help users predict wait times at various locations based on their popular times data. It integrates the Google Places API to retrieve detailed information about places, such as their name, address, and ratings, while also utilizing the populartimes API to analyze how busy a location is during different hours of the day.

The core functionality lies in providing users with estimated wait times by mapping the busy percentage (derived from popular times data) to a specific wait time range. The app displays this data visually through interactive charts, making it easy for users to assess how crowded a place might be at different times. The system uses asynchronous programming to fetch data efficiently and caches results for up to ten days to minimize redundant API calls.

The app is particularly useful for users who want to avoid long waits at popular locations, helping them plan their visits during less busy times. With its integration of Google Maps and the ability to search for any place, the application combines convenience with practical time-saving insights.

## Table of Contents

- [Introduction](#introduction)
- [Project Overview](#project-overview)
- [Features and Functionalities](#features-and-functionalities)
- [Technology Stack](#technology-stack)
- [Conclusion](#conclusion)
- [References](#references)

## Introduction

This project aims to assist users in predicting wait times at popular locations by integrating data from Google Places and using advanced asynchronous programming to provide real-time predictions. The project demonstrates the capabilities of web-based applications to streamline decision-making for individuals by presenting up-to-date wait-time data.

## Project Overview

CrowdSense is designed to help users predict wait times at various locations using popular times data. With a user-friendly interface and integration with Google Places and populartimes API, it provides users with actionable insights into when a place might be crowded, helping them avoid long waits.

## Features and Functionalities

- **Real-time Wait Time Estimation**: Fetches current wait times using the popular times data of a location and converts the busy percentage into a practical wait time range.
- **Google Places Integration**: Users can search for places via the integrated Google Maps interface, which provides place details such as name, rating, and photos.
- **Asynchronous Data Fetching**: Uses asynchronous requests for fetching data from the Google Places API to provide fast and non-blocking user experiences.
- **Busy Chart Visualization**: Displays busy hours data in an interactive chart, allowing users to visualize how crowded a place may be at different times of the day.
- **Automatic Caching**: Results are cached for ten days to optimize API usage and reduce redundant requests.

## Technology Stack

- **Frontend**: HTML, CSS, JavaScript (integrated with Google Maps and Google Places API for search and location details).
- **Backend**: Flask (Python) and asynchronous programming with `aiohttp` for non-blocking requests.
- **Database**: In-memory cache (expandable to Redis in production) via `aiocache`.
- **Version Control**: Git for source code management.
- **APIs**: Google Places API, populartimes API for fetching and processing popular times data.

## Conclusion

This project successfully integrates Google’s data with popular times analysis to provide users with actionable information about wait times, allowing them to plan visits more efficiently. By using asynchronous programming, the system is highly responsive and efficient, delivering quick, real-time results to improve user experience.

## References

- **[Google Maps JavaScript API Documentation](https://developers.google.com/maps/documentation/javascript/)**
- **[Flask Documentation](https://flask.palletsprojects.com/)**
- **[Populartimes API GitHub](https://github.com/m-wrzr/populartimes)**
- **[Digital Ocean Flask Tutorial](https://www.digitalocean.com/community/tutorials/how-to-create-your-first-web-application-using-flask-and-python-3)**
- **[YouTube Video on Google Maps API Integration](https://youtu.be/uPhWSyRqQDA)**




## Change Log

This changelog outlines key updates and improvements made between **Version 1** and **Version 2** of the CrowdSense Flask backend API.

---

## [Version 1.1] - *Improved Wait Time Categorization & Readability*
**Date:** April 2025  
**Status:** Current Version

### Enhancements
- **Wait Time Output:**  
  Changed from numeric levels (`0`, `1`, `2`...) to **human-readable strings** like `"0-5 minutes"`, `"5-10 minutes"`, etc., enhancing user understanding.
  
- **Code Readability Improvements:**
  - Improved spacing and comments for clarity.
  - Reorganized mapping logic inside `if popular_times_data` block.
  - Used shorter day-name keys (`mon`, `tue`, ...) in `converted_data`.

- **Debug Mode:**
  - Set `debug=True` in `app.run()` for development convenience.

### Technical Changes
- **Global API Key Access:**
  - Explicit use of `global API_KEY` inside `fetch_place_details()` for clarity (though not functionally necessary here).

- **Refactored Comments:**
  - Clarified usage of async functions and blocking populartimes call.
  - Specified cache duration in seconds (`864000` = 10 days).

---

## [Version 1] - *Initial Release*
**Date:** Oct 2024  
**Status:** Legacy Version

### Key Features
- Initial implementation of:
  - Flask async route for `/projects/api2/`
  - Integration with Google Places API and `populartimes`
  - In-memory caching using `aiocache`
  - Timezone awareness using `pytz` (Asia/Kolkata)
  
- Busy percentage mapping to numeric levels (0–5) for estimating wait times.

---

## Next Steps
- [ ] Optimize the blocking `populartimes.get_id` call (move to thread or worker).
- [ ] Add Redis support for caching in production.
- [ ] Implement API authentication or key obfuscation.
- [ ] Add frontend toggle to show raw vs. estimated data.

