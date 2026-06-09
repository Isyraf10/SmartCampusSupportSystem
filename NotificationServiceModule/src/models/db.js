// In-memory store (acts as the Notification DB for prototype)
const db = {
  events: [
    {
      id: 'evt-001',
      title: 'Orientation Week 2026',
      description: 'Welcome orientation for new students.',
      location: 'DKP Main Hall',
      date: '2026-06-20',
      time: '09:00',
      organizer: 'Student Affairs Division',
      capacity: 500,
      registrations: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'evt-002',
      title: 'AI & Data Science Workshop',
      description: 'Hands-on workshop on AI tools and data science basics.',
      location: 'Lab Komputer 3, FSK',
      date: '2026-06-25',
      time: '14:00',
      organizer: 'Faculty of Computer Science',
      capacity: 40,
      registrations: [],
      status: 'upcoming',
      createdAt: new Date().toISOString(),
    },
  ],
  notifications: [],
};

module.exports = db;
