/* IELTS Prep Tracker: built-in content.
   Practice prompts, cue cards and Task 1 data are original and made up for practice. */
window.IELTS_DATA = (function () {
  "use strict";

  var TOPICS = {
    academic: "Academic words",
    environment: "Environment",
    technology: "Technology",
    education: "Education",
    health: "Health",
    society: "Society & government",
    work: "Work & economy",
    linking: "Linking words",
    task1: "Task 1 (charts)",
    speaking: "Speaking phrases",
    mine: "My words"
  };

  // [id, word, part of speech, definition, example, Bangla, topic]
  var CARDS = [
    ["p1", "significant", "adj", "large or important enough to be noticed", "There has been a significant rise in online learning since 2020.", "উল্লেখযোগ্য", "academic"],
    ["p2", "substantial", "adj", "large in amount or value", "The government made a substantial investment in public hospitals.", "যথেষ্ট; বিপুল", "academic"],
    ["p3", "considerable", "adj", "fairly large in size or amount", "The new policy has caused considerable debate.", "বেশ বড়; উল্লেখযোগ্য", "academic"],
    ["p4", "approach", "noun", "a way of dealing with something", "A balanced approach to screen time is better than a total ban.", "পদ্ধতি; দৃষ্টিভঙ্গি", "academic"],
    ["p5", "assess", "verb", "to judge the quality, value or importance of something", "It is difficult to assess the long-term impact of social media.", "মূল্যায়ন করা", "academic"],
    ["p6", "crucial", "adj", "extremely important", "Parents play a crucial role in a child's early education.", "অত্যন্ত গুরুত্বপূর্ণ", "academic"],
    ["p7", "derive", "verb", "to get something from a source", "Many people derive great satisfaction from volunteering.", "প্রাপ্ত হওয়া; উদ্ভূত হওয়া", "academic"],
    ["p8", "evident", "adj", "clear and easy to see or understand", "It is evident that cities need better public transport.", "স্পষ্ট", "academic"],
    ["p9", "factor", "noun", "something that influences a result", "Cost is a key factor when students choose a university.", "কারণ; উপাদান", "academic"],
    ["p10", "fundamental", "adj", "basic and most important", "Access to clean water is a fundamental human right.", "মৌলিক", "academic"],
    ["p11", "implement", "verb", "to put a plan or decision into action", "Governments should implement stricter rules on plastic packaging.", "বাস্তবায়ন করা", "academic"],
    ["p12", "indicate", "verb", "to show or suggest that something is true", "The figures indicate a steady decline in coal use.", "নির্দেশ করা", "academic"],
    ["p13", "inevitable", "adj", "certain to happen and impossible to avoid", "Some job losses are inevitable as automation spreads.", "অনিবার্য", "academic"],
    ["p14", "justify", "verb", "to show that something is reasonable", "It is hard to justify spending so much on space travel.", "ন্যায্যতা প্রমাণ করা", "academic"],
    ["p15", "mitigate", "verb", "to make something bad less severe", "Planting trees can help mitigate the effects of heatwaves.", "প্রশমিত করা", "academic"],
    ["p16", "notion", "noun", "an idea or belief", "Many people reject the notion that money guarantees happiness.", "ধারণা", "academic"],
    ["p17", "phenomenon", "noun", "something that happens or exists, often unusual", "Urbanisation is a global phenomenon.", "ঘটনা; প্রপঞ্চ", "academic"],
    ["p18", "predominantly", "adv", "mainly; mostly", "Online courses are used predominantly by young adults.", "প্রধানত", "academic"],
    ["p19", "reluctant", "adj", "not willing to do something", "Older employees are often reluctant to change their routines.", "অনিচ্ছুক", "academic"],
    ["p20", "subsequently", "adv", "after something else happened", "Prices rose sharply and subsequently fell.", "পরবর্তীতে", "academic"],
    ["p21", "sustain", "verb", "to keep something going over time", "It is difficult to sustain economic growth without skilled workers.", "টিকিয়ে রাখা", "academic"],
    ["p22", "undermine", "verb", "to gradually make something weaker", "False news can undermine public trust in science.", "দুর্বল করা", "academic"],
    ["p23", "vulnerable", "adj", "easily harmed or hurt", "The elderly are especially vulnerable during heatwaves.", "ঝুঁকিপূর্ণ; অরক্ষিত", "academic"],
    ["p24", "widespread", "adj", "existing or happening in many places", "Smartphone use is now widespread among children.", "ব্যাপক", "academic"],
    ["p25", "detrimental", "adj", "causing harm or damage", "Lack of sleep is detrimental to students' performance.", "ক্ষতিকর", "academic"],
    ["p26", "beneficial", "adj", "having a good effect; helpful", "Regular exercise is beneficial for both body and mind.", "উপকারী", "academic"],
    ["p27", "alleviate", "verb", "to make a problem or pain less serious", "Free school meals can alleviate child poverty.", "লাঘব করা", "academic"],
    ["p28", "exacerbate", "verb", "to make a bad situation worse", "Building more roads may exacerbate traffic congestion.", "আরও খারাপ করা", "academic"],
    ["p29", "comprehensive", "adj", "complete and including everything", "The city needs a comprehensive plan to manage waste.", "ব্যাপক; সামগ্রিক", "academic"],
    ["p30", "controversial", "adj", "causing a lot of disagreement", "Testing on animals remains a controversial issue.", "বিতর্কিত", "academic"],
    ["p31", "consequence", "noun", "a result of an action, often a bad one", "Deforestation has serious consequences for the climate.", "পরিণাম", "academic"],
    ["p32", "contribute to", "verb", "to help cause something", "Private cars contribute to air pollution in big cities.", "অবদান রাখা; ভূমিকা রাখা", "academic"],
    ["p33", "diminish", "verb", "to become or make smaller or less", "The importance of handwriting has diminished over time.", "হ্রাস পাওয়া", "academic"],
    ["p34", "enhance", "verb", "to improve the quality or value of something", "Learning a second language can enhance career prospects.", "উন্নত করা; বাড়ানো", "academic"],
    ["p35", "facilitate", "verb", "to make something easier", "Technology facilitates communication across borders.", "সহজতর করা", "academic"],
    ["p36", "hinder", "verb", "to make progress difficult or slow", "Poor internet access can hinder online learning.", "বাধা দেওয়া", "academic"],
    ["p37", "prevalent", "adj", "common in a particular place or time", "Obesity is increasingly prevalent among teenagers.", "প্রচলিত; ব্যাপক", "academic"],
    ["p38", "priority", "noun", "something more important than other things", "Road safety should be a top priority for local councils.", "অগ্রাধিকার", "academic"],
    ["p39", "profound", "adj", "very great or deep", "The internet has had a profound effect on how we shop.", "গভীর", "academic"],
    ["p40", "tackle", "verb", "to deal with a difficult problem", "Governments must act quickly to tackle youth unemployment.", "মোকাবিলা করা", "academic"],
    ["p41", "trend", "noun", "a general direction of change", "There is an upward trend in the number of remote workers.", "প্রবণতা", "academic"],

    ["p42", "emission", "noun", "gas or other substance sent into the air", "Carbon emissions from aviation are rising every year.", "নির্গমন", "environment"],
    ["p43", "renewable", "adj", "naturally replaced and not used up", "Bangladesh is investing in renewable energy such as solar power.", "নবায়নযোগ্য", "environment"],
    ["p44", "deforestation", "noun", "the cutting down of large areas of forest", "Deforestation threatens many endangered species.", "বন উজাড়", "environment"],
    ["p45", "biodiversity", "noun", "the variety of plants and animals in an area", "The loss of biodiversity affects food production.", "জীববৈচিত্র্য", "environment"],
    ["p46", "sustainable", "adj", "able to continue without damaging the environment", "Sustainable farming protects the soil for future generations.", "টেকসই", "environment"],
    ["p47", "conservation", "noun", "the protection of nature and wildlife", "Wildlife conservation needs long-term funding.", "সংরক্ষণ", "environment"],
    ["p48", "fossil fuels", "noun", "fuels such as coal, oil and gas", "Our reliance on fossil fuels must be reduced.", "জীবাশ্ম জ্বালানি", "environment"],
    ["p49", "landfill", "noun", "a place where waste is buried in the ground", "Most plastic waste still ends up in landfill.", "আবর্জনা ভরাটের স্থান", "environment"],
    ["p50", "carbon footprint", "noun", "the amount of carbon dioxide a person or activity produces", "Eating less meat can reduce your carbon footprint.", "কার্বন পদচিহ্ন", "environment"],
    ["p51", "degradation", "noun", "the process of becoming worse in quality", "Industrial waste leads to environmental degradation.", "অবক্ষয়", "environment"],

    ["p52", "innovation", "noun", "a new idea, method or product", "Technological innovation has transformed healthcare.", "উদ্ভাবন", "technology"],
    ["p53", "automation", "noun", "the use of machines to do work done by people", "Automation may replace many routine factory jobs.", "স্বয়ংক্রিয়করণ", "technology"],
    ["p54", "obsolete", "adj", "no longer used because something newer exists", "Many skills become obsolete within a decade.", "অপ্রচলিত", "technology"],
    ["p55", "privacy", "noun", "the right to keep personal information to yourself", "Social media raises serious concerns about privacy.", "গোপনীয়তা", "technology"],
    ["p56", "breakthrough", "noun", "an important new discovery or development", "Scientists made a breakthrough in cancer treatment.", "যুগান্তকারী সাফল্য", "technology"],
    ["p57", "addictive", "adj", "making people want to keep doing or using it", "Many mobile games are designed to be addictive.", "আসক্তিকর", "technology"],
    ["p58", "digital literacy", "noun", "the ability to use digital technology well", "Schools should teach digital literacy from an early age.", "ডিজিটাল সাক্ষরতা", "technology"],
    ["p59", "surveillance", "noun", "careful watching of people, often by authorities", "Some citizens worry about mass surveillance through cameras.", "নজরদারি", "technology"],

    ["p60", "curriculum", "noun", "the subjects studied in a school or course", "Financial skills should be part of the school curriculum.", "পাঠ্যক্রম", "education"],
    ["p61", "tuition fees", "noun", "money paid to a school or university for teaching", "High tuition fees stop many talented students from applying.", "শিক্ষা ফি", "education"],
    ["p62", "vocational", "adj", "related to skills needed for a particular job", "Vocational training can reduce youth unemployment.", "বৃত্তিমূলক", "education"],
    ["p63", "literacy", "noun", "the ability to read and write", "Adult literacy rates have improved in many countries.", "সাক্ষরতা", "education"],
    ["p64", "rote learning", "noun", "learning by repeating something until it is memorised", "Exams that reward rote learning discourage creativity.", "মুখস্থবিদ্যা", "education"],
    ["p65", "critical thinking", "noun", "the ability to analyse information and judge it objectively", "University courses should develop critical thinking.", "বিশ্লেষণী চিন্তা", "education"],
    ["p66", "academic performance", "noun", "how well a student does in their studies", "Sleep has a direct effect on academic performance.", "শিক্ষাগত ফলাফল", "education"],
    ["p67", "compulsory", "adj", "required by a law or rule", "Physical education should remain compulsory in secondary schools.", "বাধ্যতামূলক", "education"],

    ["p68", "sedentary", "adj", "involving a lot of sitting and little exercise", "Office workers often lead a sedentary lifestyle.", "বসে থাকা; শ্রমহীন", "health"],
    ["p69", "obesity", "noun", "the condition of being very overweight", "Childhood obesity is linked to fast food advertising.", "স্থূলতা", "health"],
    ["p70", "epidemic", "noun", "a disease or problem that spreads quickly to many people", "Some experts describe loneliness as a modern epidemic.", "মহামারী", "health"],
    ["p71", "life expectancy", "noun", "the average number of years a person is expected to live", "Life expectancy has risen thanks to better healthcare.", "গড় আয়ু", "health"],
    ["p72", "preventive", "adj", "intended to stop something bad from happening", "Preventive healthcare is cheaper than treatment.", "প্রতিরোধমূলক", "health"],
    ["p73", "well-being", "noun", "the state of being healthy and happy", "Long working hours harm employees' mental well-being.", "সুস্থতা; কল্যাণ", "health"],

    ["p74", "legislation", "noun", "a law or set of laws", "New legislation bans smoking in public places.", "আইন", "society"],
    ["p75", "enforce", "verb", "to make people obey a law or rule", "Speed limits are useless if the police do not enforce them.", "প্রয়োগ করা; কার্যকর করা", "society"],
    ["p76", "inequality", "noun", "an unfair difference between groups of people", "Income inequality has widened in many cities.", "বৈষম্য", "society"],
    ["p77", "urbanisation", "noun", "the growth of towns and cities", "Rapid urbanisation puts pressure on housing.", "নগরায়ণ", "society"],
    ["p78", "infrastructure", "noun", "basic systems such as roads, power and water", "Dhaka needs major investment in infrastructure.", "অবকাঠামো", "society"],
    ["p79", "welfare", "noun", "help given to people who need it", "Some argue that welfare payments discourage work.", "সমাজকল্যাণ", "society"],
    ["p80", "deterrent", "noun", "something that makes people less likely to do something", "Heavy fines act as a deterrent to littering.", "প্রতিরোধক", "society"],
    ["p81", "ageing population", "noun", "a population with a growing share of older people", "An ageing population increases the cost of healthcare.", "বয়স্ক জনগোষ্ঠী বৃদ্ধি", "society"],
    ["p82", "migration", "noun", "moving from one place to live in another", "Rural-to-urban migration is common in developing countries.", "অভিবাসন; স্থানান্তর", "society"],
    ["p83", "globalisation", "noun", "the process of the world's economies and cultures becoming connected", "Globalisation has made foreign products cheaper.", "বিশ্বায়ন", "society"],

    ["p84", "unemployment", "noun", "the state of not having a job", "Youth unemployment remains high in many regions.", "বেকারত্ব", "work"],
    ["p85", "workforce", "noun", "all the people who work in a company or country", "A skilled workforce attracts foreign investment.", "কর্মীবাহিনী", "work"],
    ["p86", "productivity", "noun", "the rate at which work is produced", "Flexible hours can boost productivity.", "উৎপাদনশীলতা", "work"],
    ["p87", "incentive", "noun", "something that encourages you to do something", "Tax incentives encourage companies to go green.", "প্রণোদনা", "work"],
    ["p88", "revenue", "noun", "income, especially of a government or company", "Tourism generates significant revenue for the country.", "রাজস্ব", "work"],
    ["p89", "consumerism", "noun", "a focus on buying more and more goods", "The rise of consumerism has increased waste.", "ভোগবাদ", "work"],
    ["p90", "remote work", "noun", "working from home or away from an office", "Remote work saves commuting time for employees.", "দূর থেকে কাজ", "work"],

    ["p91", "furthermore", "adv", "used to add another point", "Furthermore, public transport reduces traffic.", "তাছাড়া", "linking"],
    ["p92", "nevertheless", "adv", "despite what has just been said", "The plan is expensive. Nevertheless, it is worth it.", "তা সত্ত্বেও", "linking"],
    ["p93", "whereas", "conj", "used to show a contrast between two facts", "Cities are crowded, whereas villages are quiet.", "অথচ; যেখানে", "linking"],
    ["p94", "consequently", "adv", "as a result", "Fuel prices rose; consequently, more people cycled.", "ফলস্বরূপ", "linking"],
    ["p95", "in contrast", "phrase", "used to show that something is very different", "In contrast, rural areas have fewer hospitals.", "বিপরীতে", "linking"],
    ["p96", "to illustrate", "phrase", "used before giving an example", "To illustrate, Finland offers free university education.", "উদাহরণস্বরূপ", "linking"],
    ["p97", "provided that", "conj", "only if", "Remote work is effective provided that staff are trusted.", "এই শর্তে যে", "linking"],
    ["p98", "albeit", "conj", "although", "The economy recovered, albeit slowly.", "যদিও", "linking"],
    ["p99", "on the whole", "phrase", "generally; considering everything", "On the whole, the benefits outweigh the drawbacks.", "সামগ্রিকভাবে", "linking"],

    ["p100", "plummet", "verb", "to fall suddenly and by a large amount", "Sales of DVDs plummeted after 2010.", "হঠাৎ ব্যাপক পতন হওয়া", "task1"],
    ["p101", "surge", "noun", "a sudden large increase", "There was a surge in online shopping in 2020.", "হঠাৎ বৃদ্ধি", "task1"],
    ["p102", "fluctuate", "verb", "to rise and fall irregularly", "The price of rice fluctuated throughout the year.", "ওঠানামা করা", "task1"],
    ["p103", "plateau", "verb", "to stay at the same level after a period of growth", "Car ownership plateaued at around 60%.", "স্থিতিশীল থাকা", "task1"],
    ["p104", "peak", "noun", "the highest point", "Visitor numbers reached a peak of 2 million in July.", "সর্বোচ্চ বিন্দু", "task1"],
    ["p105", "marginally", "adv", "by a very small amount", "Spending on food was marginally higher in 2020.", "সামান্য", "task1"],
    ["p106", "proportion", "noun", "a part of a total, compared with the whole", "A higher proportion of women studied science in 2020.", "অনুপাত; অংশ", "task1"],
    ["p107", "respectively", "adv", "in the same order as the things just mentioned", "Coal and gas produced 30% and 45% respectively.", "যথাক্রমে", "task1"],
    ["p108", "account for", "verb", "to form a particular part of a total", "Cars accounted for 60% of all journeys.", "মোটের অংশ হওয়া", "task1"],
    ["p109", "overtake", "verb", "to become greater than something else", "Solar power overtook coal as the main source in 2019.", "ছাড়িয়ে যাওয়া", "task1"],

    ["p110", "broaden my horizons", "phrase", "to increase my experience and knowledge", "Studying abroad would really broaden my horizons.", "জ্ঞান ও অভিজ্ঞতা বাড়ানো", "speaking"],
    ["p111", "keep in touch", "phrase", "to stay in contact with someone", "I keep in touch with my university friends online.", "যোগাযোগ রাখা", "speaking"],
    ["p112", "once in a blue moon", "phrase", "very rarely", "I go to the cinema once in a blue moon.", "কালেভদ্রে", "speaking"],
    ["p113", "a steep learning curve", "phrase", "a situation where you must learn a lot quickly", "My first job was a steep learning curve.", "অল্প সময়ে অনেক শেখার চাপ", "speaking"],
    ["p114", "strike a balance", "phrase", "to find a sensible middle point between two things", "I try to strike a balance between work and rest.", "ভারসাম্য বজায় রাখা", "speaking"],
    ["p115", "make ends meet", "phrase", "to have just enough money for basic needs", "Many families struggle to make ends meet.", "কোনোরকমে খরচ চালানো", "speaking"],
    ["p116", "hectic", "adj", "very busy and full of activity", "My schedule gets hectic before deadlines.", "অত্যন্ত ব্যস্ত", "speaking"],
    ["p117", "off the top of my head", "phrase", "without checking or thinking carefully", "Off the top of my head, I'd say about twenty people came.", "তাৎক্ষণিকভাবে বললে", "speaking"],
    ["p118", "to be honest", "phrase", "used to give a sincere opinion", "To be honest, I prefer studying in the morning.", "সত্যি বলতে", "speaking"],
    ["p119", "it depends", "phrase", "used when the answer changes with the situation", "It depends on the weather, but usually I walk.", "পরিস্থিতির উপর নির্ভর করে", "speaking"],
    ["p120", "I'd say", "phrase", "used to give an opinion politely", "I'd say technology has made life easier overall.", "আমি বলব", "speaking"]
  ];

  // Writing Task 2 prompts (original). type: opinion | discussion | advdis | problem | twopart
  var TASK2 = [
    { type: "opinion", q: "Some people believe that university education should be free for all students. To what extent do you agree or disagree?" },
    { type: "discussion", q: "Some people think children should start learning a foreign language at primary school, while others believe they should begin in secondary school. Discuss both views and give your own opinion." },
    { type: "advdis", q: "More and more people are working from home instead of in an office. Do the advantages of this development outweigh the disadvantages?" },
    { type: "problem", q: "Traffic congestion is becoming a serious problem in many large cities. What are the causes of this problem, and what measures could be taken to solve it?" },
    { type: "opinion", q: "Governments should spend more money on public transport than on building new roads. To what extent do you agree or disagree?" },
    { type: "twopart", q: "Many young people now spend several hours a day on social media. Why is this the case? Is this a positive or negative development?" },
    { type: "discussion", q: "Some people believe that the best way to reduce crime is to give longer prison sentences. Others think there are better alternatives. Discuss both views and give your own opinion." },
    { type: "opinion", q: "Developed countries have a responsibility to help developing countries deal with climate change. To what extent do you agree or disagree?" },
    { type: "advdis", q: "In many countries, the proportion of older people is increasing. Do the advantages of this trend outweigh the disadvantages?" },
    { type: "problem", q: "In many cities there is not enough affordable housing for young people. What problems does this cause, and what can be done about it?" },
    { type: "opinion", q: "Artificial intelligence will soon replace teachers in the classroom. To what extent do you agree or disagree?" },
    { type: "discussion", q: "Some people think that sports stars and entertainers are paid too much compared with doctors and teachers. Others believe their high salaries are fair. Discuss both views and give your own opinion." },
    { type: "twopart", q: "Many people now buy products from abroad online instead of from local shops. What are the reasons for this? What effects does it have on local businesses?" },
    { type: "opinion", q: "It is more important to protect wild animals and their habitats than to develop land for housing and industry. To what extent do you agree or disagree?" },
    { type: "advdis", q: "Some students take a year off between finishing school and starting university to work or travel. Do the advantages of this outweigh the disadvantages?" },
    { type: "problem", q: "Plastic waste is polluting oceans around the world. What are the main causes of this problem, and what solutions can you suggest?" }
  ];

  // Writing Task 1 prompts with made-up data.
  var TASK1 = [
    {
      q: "The table below shows the percentage of households with internet access in three countries in 2005, 2010, 2015 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      unit: "% of households",
      cols: ["Country", "2005", "2010", "2015", "2020"],
      rows: [["Country A", "30", "55", "78", "92"], ["Country B", "12", "28", "51", "74"], ["Country C", "45", "62", "70", "81"]]
    },
    {
      q: "The chart data below shows how commuters in one city travelled to work in 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      unit: "% of commuters",
      cols: ["Transport", "2000", "2020"],
      rows: [["Car", "48", "35"], ["Bus", "22", "20"], ["Train", "10", "18"], ["Bicycle", "5", "15"], ["Walking", "15", "12"]]
    },
    {
      q: "The table below shows the amount of electricity produced from four sources in one country in 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      unit: "terawatt hours (TWh)",
      cols: ["Source", "2010", "2020"],
      rows: [["Coal", "120", "80"], ["Gas", "60", "75"], ["Solar", "5", "40"], ["Wind", "10", "55"]]
    },
    {
      q: "The table below shows how an average household in one country divided its monthly spending in 1990 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      unit: "% of monthly spending",
      cols: ["Category", "1990", "2020"],
      rows: [["Food", "40", "25"], ["Housing", "25", "33"], ["Transport", "12", "15"], ["Entertainment", "8", "12"], ["Education", "15", "15"]]
    }
  ];

  var PLANS = {
    opinion: ["Introduction: paraphrase the question and state your position clearly.", "Body 1: your main reason, explained, with a specific example.", "Body 2: a second reason, or a concession followed by your rebuttal.", "Conclusion: restate your position in new words."],
    discussion: ["Introduction: paraphrase both views and give your opinion.", "Body 1: the first view, with reasons and an example.", "Body 2: the second view, with reasons, and say which side you support.", "Conclusion: summarise both sides and repeat your opinion."],
    advdis: ["Introduction: paraphrase and say whether advantages outweigh disadvantages.", "Body 1: the main advantages, explained.", "Body 2: the main disadvantages, explained.", "Conclusion: weigh them and give a clear answer."],
    problem: ["Introduction: paraphrase and outline what you will discuss.", "Body 1: two causes or problems, each explained.", "Body 2: a matching solution for each, with how it would work.", "Conclusion: summarise causes and solutions."],
    twopart: ["Introduction: paraphrase and briefly answer both questions.", "Body 1: answer the first question fully.", "Body 2: answer the second question fully.", "Conclusion: summarise both answers."],
    task1: ["Introduction: paraphrase what the table or chart shows.", "Overview: the two or three biggest trends, with no numbers.", "Body 1: key figures for one group, with comparisons.", "Body 2: key figures for the other group. No opinions and no conclusion."]
  };

  var TYPE_NAMES = { opinion: "Opinion (agree or disagree)", discussion: "Discuss both views", advdis: "Advantages vs disadvantages", problem: "Problem and solution", twopart: "Two-part question", task1: "Academic Task 1" };

  var PART1 = [
    { topic: "Hometown", qs: ["Where is your hometown?", "What do you like most about it?", "Has your hometown changed much in recent years?", "Would you like to live there in the future?"] },
    { topic: "Work or studies", qs: ["Do you work or are you a student?", "Why did you choose that job or subject?", "What do you find most challenging about it?", "What would you like to do in the future?"] },
    { topic: "Daily routine", qs: ["What is your daily routine like?", "Which part of the day do you like most?", "Do you prefer mornings or evenings?", "Would you like to change your routine?"] },
    { topic: "Technology", qs: ["How often do you use your phone?", "Which app do you use most?", "Do you think people spend too much time online?", "Did you use computers when you were a child?"] },
    { topic: "Food", qs: ["What kind of food do you like?", "Do you prefer eating at home or eating out?", "Can you cook?", "Has your diet changed since you were young?"] },
    { topic: "Weather", qs: ["What is the weather usually like where you live?", "What is your favourite season?", "Does the weather affect your mood?", "Do you check the weather forecast?"] },
    { topic: "Reading", qs: ["Do you enjoy reading?", "What kind of books do you read?", "Do you prefer paper books or e-books?", "Did you read a lot as a child?"] },
    { topic: "Travel", qs: ["Do you like travelling?", "Where did you go on your last trip?", "Do you prefer travelling alone or with others?", "Where would you like to travel in the future?"] },
    { topic: "Music", qs: ["What kind of music do you like?", "When do you usually listen to music?", "Can you play a musical instrument?", "Has your taste in music changed?"] },
    { topic: "Friends", qs: ["Do you have many close friends?", "How do you usually spend time with friends?", "Is it easy to make new friends as an adult?", "How do you keep in touch with old friends?"] }
  ];

  var PART2 = [
    { cue: "Describe a skill that took you a long time to learn.", say: ["what the skill is", "when you started learning it", "how you learned it"], explain: "why it took a long time to learn", p3: ["Which skills are most important for young people today?", "Is it better to learn skills from a teacher or by yourself?", "Will people need different skills in the future?"] },
    { cue: "Describe a person who has inspired you.", say: ["who the person is", "how you know them", "what they did"], explain: "why they inspired you", p3: ["What kind of people do young people look up to today?", "Do famous people have a responsibility to be good role models?", "How can parents inspire their children?"] },
    { cue: "Describe a place in your country you would like to visit.", say: ["where it is", "what you know about it", "who you would go with"], explain: "why you would like to visit it", p3: ["Why do people enjoy visiting new places?", "How does tourism affect local communities?", "Will virtual travel ever replace real travel?"] },
    { cue: "Describe a time you helped someone.", say: ["who you helped", "what the situation was", "how you helped"], explain: "how you felt about helping", p3: ["Are people less helpful to strangers than in the past?", "Should schools teach children to volunteer?", "Who should help people in need: families or the government?"] },
    { cue: "Describe a piece of technology you use every day.", say: ["what it is", "when you started using it", "what you use it for"], explain: "how your life would be different without it", p3: ["How has technology changed the way people work?", "Do older people find it hard to adapt to new technology?", "What are the dangers of depending on technology?"] },
    { cue: "Describe a book or film that made you think.", say: ["what it was", "when you read or watched it", "what it was about"], explain: "why it made you think", p3: ["Do people read less than they did in the past?", "Can films teach people as much as books?", "Should governments support the arts with public money?"] },
    { cue: "Describe a goal you hope to achieve in the future.", say: ["what the goal is", "when you set it", "what you are doing to achieve it"], explain: "why this goal is important to you", p3: ["Is it important for young people to set long-term goals?", "Why do some people give up on their goals?", "Is success mainly about hard work or luck?"] },
    { cue: "Describe a memorable journey you have taken.", say: ["where you went", "how you travelled", "who you were with"], explain: "why the journey was memorable", p3: ["How has transport changed in your country?", "Is air travel too cheap today?", "What can be done to make public transport more popular?"] },
    { cue: "Describe a time you had to make a difficult decision.", say: ["what the decision was", "when you made it", "what options you had"], explain: "how you felt after making it", p3: ["Do young people today have more choices than their parents did?", "Should parents make important decisions for their children?", "Is it better to decide quickly or take your time?"] },
    { cue: "Describe a festival that is important in your country.", say: ["what the festival is", "when it is celebrated", "what people do during it"], explain: "why it is important", p3: ["Are traditional festivals losing their meaning?", "How do festivals benefit a country's economy?", "Should children learn about festivals from other cultures?"] },
    { cue: "Describe a teacher who influenced you.", say: ["who the teacher was", "what subject they taught", "what they were like"], explain: "how they influenced you", p3: ["What makes a good teacher?", "Should teachers be paid more?", "Will online learning change the role of teachers?"] },
    { cue: "Describe a project you worked on as part of a team.", say: ["what the project was", "who was in the team", "what your role was"], explain: "how you felt about working in that team", p3: ["What are the benefits of teamwork at work?", "What problems can happen in a team?", "Are leaders born or made?"] }
  ];

  var LINKERS = ["however", "moreover", "furthermore", "in addition", "therefore", "consequently", "as a result", "nevertheless", "nonetheless", "on the other hand", "in contrast", "whereas", "while", "although", "even though", "despite", "in spite of", "for example", "for instance", "to illustrate", "such as", "in conclusion", "to sum up", "overall", "firstly", "secondly", "finally", "in my opinion", "i believe", "this means that", "as a consequence", "hence", "thus", "similarly", "likewise", "on the whole", "provided that", "unless", "in particular", "notably"];

  var STOP = ["that", "this", "with", "have", "they", "their", "there", "from", "which", "would", "will", "been", "were", "what", "when", "than", "them", "these", "those", "more", "some", "such", "also", "into", "because", "about", "other", "many", "much", "very", "should", "could", "people", "does", "being", "while", "where", "your", "only", "most", "make", "just", "like", "over", "even", "each", "both", "think", "really"];

  // Approximate raw score to band conversions (widely used practice tables; official tables vary slightly by test).
  var LISTENING_BANDS = [[39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5], [11, 4], [8, 3.5], [6, 3], [4, 2.5]];
  var READING_BANDS = [[39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [4, 2.5]];

  return { TOPICS: TOPICS, CARDS: CARDS, TASK2: TASK2, TASK1: TASK1, PLANS: PLANS, TYPE_NAMES: TYPE_NAMES, PART1: PART1, PART2: PART2, LINKERS: LINKERS, STOP: STOP, LISTENING_BANDS: LISTENING_BANDS, READING_BANDS: READING_BANDS };
})();
