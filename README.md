[200~# Habit Tracker
This is the link of my demo video of my app as we narrow down to its steps https://youtu.be/sm2TdEpL7ho
A modern habit tracking application with daily motivational quotes and smart  notifications.

## Features

- Create and track daily habits
- Streak counting for motivation
- Smart notifications at custom times
- Daily inspirational quotes
- Data persistence via local storage
- Responsive design for all devices

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Browser Notifications API
- [Quotable API](https://github.com/lukePeavey/quotable) for daily quotes

## Quick Start

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

## Deployment Guide

### Web Servers Setup (Web01 & Web02)

1. Install dependencies and build:
```bash
npm install
npm run build
```

2. Configure nginx to serve from `dist` directory

### Load Balancer (Lb01)

```nginx
upstream habit_tracker {
    server web01_ip:80;
    server web02_ip:80;
}

server {
    listen 80;
    server_name your_domain.com;
    location / {
        proxy_pass http://habit_tracker;
    }
}
```

## Security

- Local data storage
- Input validation
- HTTPS delivery
- Error handling

## Future Plans

- Cloud sync
- Categories and tags
- Progress analytics
- Offline support

## Credits

- Quotable API for motivational quotes
- React, TypeScript, Tailwind CSS, Lucide React

## License

MIT
