import { format, addDays } from 'date-fns';

const generateMockMatches = (date) => {
  // This is a very basic mock. You'll replace this with real data from MongoDB later.
  return [
    {
      id: "1",
      competition: { id: 253, name: "Major League Soccer", emblem: "https://example.com/mls.png" },
      homeTeam: { name: "FC Dallas", crest: "https://example.com/dallas.png" },
      awayTeam: { name: "Orlando City SC", crest: "https://example.com/orlando.png" },
      status: "SCHEDULED",
      utcDate: addDays(new Date(date), 1).toISOString(),
      score: { fullTime: { home: null, away: null } }
    },
    // Add more mock matches as needed
  ];
};

export const fetchMatches = async (date) => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateMockMatches(date);
};