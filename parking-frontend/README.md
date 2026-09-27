Modern Parking Management System

Description

The Modern parking management system is a web-based parking application designed to control parking slots, vehicles and parking sessions.

The system enables parking personnel to view available and occupied parking slots, register vehicles, assign available slots, record entry and exit times, calculate parking duration and calculate the amount payable.

Main Modules

Parking Slot Management

Vehicle Registration

Parking Session Management

Payment Calculation

Session Completion

Technologies Used

Python

Flask

SQLite

React

JavaScript

HTML

CSS

Vite

Parking Fee Structure

Up to 30 minutes: KSh 0

Up to 2 hours: KSh 50

Up to 4 hours: KSh 100

Up to 6 hours: KSh 300

Over 6 hours: KSh 500

Main Database Tables

slots

vehicle

sessions

rates

How the System Works

Parking slots are created in the system.

The available and occupied slots are displayed.

A vehicle is registered when it arrives.

The system finds an available parking slot.

The selected slot is marked as occupied.

A parking session is created with the vehicle's entry time.

When the vehicle leaves, the system calculates the parking duration.

The system calculates the amount payable.

Payment is confirmed.

The session receives an exit time.

The parking slot is changed back to available.

Running the Backend

Open a terminal in the backend/project folder and run:

python app.py

The Flask API runs on:

http://127.0.0.1:5000

Running the Frontend

Open another terminal in the React frontend folder and run:

npm run dev

Vite normally provides a local address such as:

http://localhost:5173/

Project Purpose

The system demonstrates the application of data structures, algorithms and database concepts to a real-world parking management problem.
