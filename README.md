# Realtime Patients Monitoring System - Server [![Build Status](https://travis-ci.org/alentar/rpms-server.svg?branch=master)](https://travis-ci.org/alentar/rpms-server)

# Installation

- Install NodeJS, MongoDB
- Install `npm` or `yarn`
- Rename `.env.example` to `.env`
- Start MongoDB
- Run `yarn run dev` or `npm run dev`
- Check `http://localhost:3000/api/status` to see it works
- To build docs run `npm run apidoc`
- To test app run `npm run test`

# With gulp (recommended)
**gulp** is a task runner, so we have automated everything with it

- Install gulp globally with `npm install -g gulp-cli`
- Run `npm install` or `yarn` on project root
- Run `gulp` to start server on your port
- Run `gulp watch` to automatically lint your code and build APIDocs on demand
- Make sure you run these tasks in separate terminals
- To test your code run `gulp test`
- To lint your code run `gulp lint`
- To build docs run `gulp apidoc`

# Access API docs
- Visit HOST:PORT/docs
