// Verified content from https://www.calvarygroupofschools.com/ (retrieved Nov 2026).
// Anything not on the official site is marked with `toConfirm` and shown as a placeholder.

export const SCHOOL = {
  name: "Calvary Group of Schools",
  short: "Calvary Schools",
  motto: "Trust in God",
  founded: "Tuesday, 4th January 2005",
  founder: "Pa Oyesile Elijah",
  website: "https://www.calvarygroupofschools.com/",
};

export const DEFAULT_CONTACT = {
  mainAddress: "1–5 Calvary Avenue, Pipeline, Arepo, Obafemi Owode LGA, Ogun State, Nigeria",
  annexAddress: "2B Adigboluja Street, Off Ojodu Abiodun Road, Ogun State",
  phones: ["+234 703 892 9888", "+234 806 982 5550", "+234 703 988 4475"],
  emails: ["info@calvarygroupofschools.com", "enquiries@calvarygroupofschools.com"],
  offices: [
    { label: "Principal Office", phone: "0703 892 9888" },
    { label: "School HM Office", phone: "0805 331 7830" },
    { label: "Bursary Office", phone: "0703 988 4475" },
  ],
  facebook: "https://www.facebook.com/calvarysch",
  x: "https://x.com/calvarysch",
};
export type ContactInfo = typeof DEFAULT_CONTACT;

export const MISSION =
  "To be widely acclaimed locally and internationally as a school that trains and turns out students who have been adequately prepared for tertiary education, and to produce a total child through a holistic education programme that benchmarks best practices while being socially responsible.";

export const PLEDGE = [
  "I pledge as a student of Calvary Model College",
  "To be disciplined and morally sound",
  "To walk in faith and integrity",
  "To learn with diligence",
  "To excel in my academics and imbibe the fear of God",
  "And to make choices that reflect God’s wisdom.",
];

export const AFFIRMATIONS = [
  "With God’s grace, I will strive to grow in knowledge",
  "To respect my teachers, peers and those I meet",
  "I will develop my talents for the good of others",
  "I will be a light in the world and live a life of kindness and humility",
  "I affirm that with faith and hard work my future is bright",
  "And I will step forward with confidence knowing that God has a purpose for my life.",
];

// Values drawn directly from the wording of the pledge and affirmations.
export const VALUES = [
  { title: "Discipline", text: "To be disciplined and morally sound." },
  { title: "Faith & Integrity", text: "To walk in faith and integrity." },
  { title: "Diligence", text: "To learn with diligence and excel in academics." },
  { title: "Respect", text: "To respect teachers, peers and those we meet." },
  { title: "Service", text: "To develop our talents for the good of others." },
  { title: "Kindness & Humility", text: "To be a light in the world." },
];

export const LEVELS = [
  {
    id: "preschool",
    name: "Pre-school",
    tag: "Playgroup · Nursery",
    image: "/images/culture2.jpg",
    text: "Our pre-school classes are tailored to prepare children for their first year in primary school. At this stage, their foundations are structured for brighter future academic experiences. Our teaching staff are caring and experienced in early childhood education, and we assure parents of the safety of their wards.",
  },
  {
    id: "primary",
    name: "Primary School",
    tag: "Basic",
    image: "/images/football.jpg",
    text: "Our curriculum is delivered in an integrated manner, through cross-curricular themes. Our mode of training aims to promote moral, cultural, cognitive, physical and spiritual development, with clear learning goals specified for each subject.",
  },
  {
    id: "junior",
    name: "Junior Secondary School",
    tag: "Calvary Model College · JSS",
    image: "/images/excur1.jpg",
    text: "Junior secondary is part of Calvary Model College, whose curriculum follows the requirements of both the State and Federal Ministry of Education. Students sit the BECE in their third year to move into senior secondary.",
  },
  {
    id: "senior",
    name: "Senior Secondary School",
    tag: "Calvary Model College · SSS",
    image: "/images/seminar.jpg",
    text: "At Calvary Model College, our strength is in God Almighty. Our activities are designed to produce a well-reputed personality, and students are prepared for WAEC and NECO, which qualify them for tertiary education.",
  },
];

export const EXAMS = [
  { name: "WAEC", text: "Taken in the last stage of secondary school; conducted by the West African Examinations Council and qualifies students for tertiary education." },
  { name: "NECO", text: "An indigenous examination taken at the end of secondary school that qualifies students for tertiary education." },
  { name: "BECE", text: "Taken in the third year of Junior Secondary School to transition from basic education to senior secondary." },
];

export const FACILITIES = [
  { name: "Science Laboratories", image: "/images/science.jpg", text: "Laboratories where students carry out science practicals.", verified: true },
  { name: "School Compound & Sports Ground", image: "/images/sport.jpg", text: "Open grounds for sports, games and inter-house competitions.", verified: true },
  { name: "School Hall", image: "/images/sch-hall.jpg", text: "Our hall hosts assemblies, cultural days, seminars and celebrations.", verified: true },
  { name: "School Buses", image: "/images/sch-bus.jpg", text: "School buses are available to move pupils and students.", verified: true },
  { name: "Classrooms", image: "/images/building.jpg", text: "Standard classrooms for all levels across the campus.", verified: true },
];

export const UNCONFIRMED_FACILITIES = ["Library", "ICT / Computer laboratory", "Sick bay", "Music & arts studio"];

export const ACTIVITIES = [
  { title: "Inter-house Sports", image: "/images/football.jpg", text: "Inter-house football and annual sports competitions." },
  { title: "Cultural Day", image: "/images/culture2.jpg", text: "Celebrating the beauty of Nigerian and African culture." },
  { title: "Excursions", image: "/images/excur1.jpg", text: "Educational trips, such as the visit to MM2 Airport, Lagos." },
  { title: "Character Building", image: "/images/seminar.jpg", text: "Seminars with the Next Circle Foundation's character-building campaign." },
];

export const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/academics", label: "Academics" },
  { to: "/admissions", label: "Admissions" },
  { to: "/facilities", label: "Facilities" },
  { to: "/news", label: "News & Events" },
  { to: "/student-life", label: "Student Life" },
  { to: "/contact", label: "Contact" },
] as const;

export const SUGGESTED_QUESTIONS = [
  "What is the history of Calvary Group of Schools?",
  "What are the school's rules?",
  "What educational levels does the school offer?",
  "How do I apply for admission?",
  "What facilities does the school have?",
  "What is the school's pledge?",
  "How can I contact the school?",
];
