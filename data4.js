// IELTS Prep: question types for every module, built-in offline drills, more Writing tasks, Speaking frameworks.
// Practice texts below are original and fictional: places, people and figures are invented.
window.IELTS_DATA4 = {
  // ---------- Reading: the official question types ----------
  RQ: [
    { id: "tfng", name: "True / False / Not Given", tip: "Facts, not opinions. FALSE means the passage says the opposite; NOT GIVEN means it says nothing either way. Never use your own knowledge.",
      spec: 'Group type "tfng". 4–5 statements of fact. Every question has options exactly ["TRUE", "FALSE", "NOT GIVEN"]. Include each answer at least once. Answers follow passage order.' },
    { id: "ynng", name: "Yes / No / Not Given (writer’s views)", tip: "This tests the writer’s opinion, not facts. Look for opinion words: I believe, it is wrong to, arguably. NO means the writer clearly disagrees.",
      spec: 'Group type "ynng". The passage MUST be argumentative with the writer’s own opinions. 4–5 statements about the writer’s views or claims. Options exactly ["YES", "NO", "NOT GIVEN"]. Include each answer at least once.' },
    { id: "mcq", name: "Multiple choice (one answer)", tip: "Underline the key idea in the question, find that place, then rule out options one by one. Wrong options often use words from the text with a different meaning.",
      spec: 'Group type "mcq". 3 questions. Each has 4 options written "A ...", "B ...", "C ...", "D ...". "answer" is the letter only, e.g. "B".' },
    { id: "mcq2", name: "Multiple choice (choose TWO)", tip: "Each correct letter usually scores one mark. Check every option against the text; two are fully supported, the rest are partly wrong or not mentioned.",
      spec: 'Group type "mcq2". 2 questions. Each has 5 options "A ..." to "E ...", and "answer" is an array of exactly two letters, e.g. ["A", "D"].' },
    { id: "minfo", name: "Matching information (which paragraph?)", tip: "You match a detail (an example, a reason, a description) to a paragraph. Answers are not in order, and a paragraph can be used more than once.",
      spec: 'Group type "minfo". 4 questions, each beginning with a kind of information, e.g. "an example of ...", "a reason why ...". Shared "options" are the paragraph letters ["A","B","C","D","E"]. "answer" is a letter. Not in passage order.' },
    { id: "mhead", name: "Matching headings", tip: "A heading sums up the whole paragraph, not one detail. Read the first and last sentences, decide the main idea in your own words, then choose.",
      spec: 'Group type "mhead". One question per paragraph: "Paragraph A", "Paragraph B", ... Shared "options" is a list of headings written "i ...", "ii ...", with TWO more headings than paragraphs. "answer" is the numeral only, e.g. "iv".' },
    { id: "mfeat", name: "Matching features (people, dates, places)", tip: "Find each name in the text first and note what they said. Then match the statements, which are paraphrased. Some options may be used more than once.",
      spec: 'Group type "mfeat". The passage must mention 3 named researchers or groups (invented names). Shared "options" are those features written "A name", "B name", "C name". 4 statements; "answer" is a letter.' },
    { id: "mend", name: "Matching sentence endings", tip: "The ending must fit the meaning AND the grammar of the sentence start. There are extra endings you will not use.",
      spec: 'Group type "mend". 3 sentence beginnings as questions. Shared "options" are 5 endings written "A ...", "B ...". "answer" is a letter. Questions follow passage order.' },
    { id: "sent", name: "Sentence completion", tip: "Check the word limit. Copy words exactly from the passage; spelling counts. Predict the kind of word (noun, number, verb) before you look.",
      spec: 'Group type "sent". Instructions: "Choose NO MORE THAN TWO WORDS from the passage for each answer." 4 sentences with ____ for the gap. No options. Answers are copied exactly from the passage. Put acceptable variants in "alt".' },
    { id: "summ", name: "Summary, note or table completion", tip: "The summary usually covers one part of the text. Find that part, then fill each gap; grammar around the gap tells you the word type.",
      spec: 'Group type "summ". Include an "outline" with style "summary" and "rows": [["one paragraph of summary text with gaps written [1], [2], [3], [4]"]]. Also include a "options" word box of 7 words written "A word", "B word" ... The 4 questions are short labels "Gap 1" ...; "answer" is the letter of the right word.' },
    { id: "diag", name: "Diagram or flow-chart label completion", tip: "Diagrams describe a process or object. Follow the arrows or parts in order and find the matching description in the text; answers use words from the passage.",
      spec: 'Group type "diag". The passage must describe a process or an object. Include an "outline" with style "flowchart" and "rows": 4 to 5 single-cell rows, each a stage, where 3 or 4 of them contain a gap [1], [2], [3], [4]. Instructions: "Choose ONE WORD ONLY from the passage." Questions are labels "Gap 1" ...; "answer" is the word.' },
    { id: "short", name: "Short-answer questions", tip: "Answer with words from the text within the word limit. Questions are in passage order. Numbers can be written as figures.",
      spec: 'Group type "short". Instructions: "Answer with NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage." 4 wh- questions. No options. Put variants in "alt".' }
  ],
  // ---------- Listening: the official question types ----------
  LQ: [
    { id: "lmcq", name: "Multiple choice (one answer)", tip: "Read the options before the audio. The speaker often mentions all three options; listen for which one is confirmed, not just mentioned.",
      spec: 'Group type "lmcq". 3 questions, each with 3 options "A ...", "B ...", "C ...". "answer" is the letter. Make the script mention wrong options as distractors.' },
    { id: "lmcq2", name: "Multiple choice (choose TWO)", tip: "Listen for each option being accepted or rejected. Tick as you go; two will be confirmed.",
      spec: 'Group type "lmcq2". 1 or 2 questions, each with 5 options "A ..." to "E ..." and "answer" an array of two letters.' },
    { id: "lmatch", name: "Matching", tip: "You match items heard in order to a list of options (days, opinions, places). Options may be used more than once.",
      spec: 'Group type "lmatch". Shared "options" are 3–4 categories written "A ...", "B ...". 4 items as questions in the order heard; "answer" is a letter. Include at least one change of mind.' },
    { id: "lmap", name: "Plan, map or diagram labelling", tip: "Find where you start on the map. Listen for direction words: opposite, next to, on your left, at the far end, beside.",
      spec: 'Group type "lmap". Include a "map": {"cols": 3, "rows": 3, "cells": [{"r": 0, "c": 0, "t": "label or a single letter"}]} with every cell filled: 1–2 fixed landmarks (e.g. "Entrance", "Lake") and the rest single letters A–G. Shared "options" are the letters used. 4 questions name places; "answer" is the letter. The script must describe locations with clear direction words relative to the landmarks; the speaker starts at the entrance at the bottom of the map.' },
    { id: "lform", name: "Form completion", tip: "Typical answers: names spelled aloud, phone numbers, dates, prices. Spelling and the word limit count. Write numbers as figures.",
      spec: 'Group type "lform". Include an "outline" with style "form" and "rows" of two cells like ["Name:", "[1]"], ["Phone:", "[2]"], with 5 gaps. Instructions "Write ONE WORD AND/OR A NUMBER for each answer." Include one name spelled letter by letter and one number corrected by a speaker.' },
    { id: "lnote", name: "Note completion", tip: "Notes keep only key words. Use the headings to follow the talk and predict each missing word type.",
      spec: 'Group type "lnote". Include an "outline" with style "notes" and "rows": single-cell lines such as ["Heading"], ["• fact with a gap [1]"], with 5 gaps. Instructions "Write NO MORE THAN TWO WORDS for each answer."' },
    { id: "ltable", name: "Table completion", tip: "Read across rows and down columns before you listen, so you know which category each gap belongs to.",
      spec: 'Group type "ltable". Include an "outline" with style "table" and "rows": the first row is the header, then 3 rows of 3 cells with 5 gaps in total. Instructions "Write ONE WORD AND/OR A NUMBER for each answer."' },
    { id: "lflow", name: "Flow-chart completion", tip: "Each box is one stage. Listen for sequence words: first, after that, once, finally.",
      spec: 'Group type "lflow". Include an "outline" with style "flowchart" and 5 single-cell rows, 4 of which contain a gap. Instructions "Write ONE WORD ONLY for each answer."' },
    { id: "lsumm", name: "Summary completion", tip: "The summary paraphrases the audio. Keep reading ahead so you know which gap comes next.",
      spec: 'Group type "lsumm". Include an "outline" with style "summary" and one paragraph row with 4 gaps [1] to [4]. Instructions "Write ONE WORD ONLY for each answer."' },
    { id: "lsent", name: "Sentence completion", tip: "The sentence is a paraphrase; the answer is the exact word you hear. Check grammar: does it need a plural?",
      spec: 'Group type "lsent". 4 sentences with ____ gaps. Instructions "Write NO MORE THAN TWO WORDS for each answer."' },
    { id: "lshort", name: "Short-answer questions", tip: "Question words tell you what to listen for: when = time, how much = price, who = a person or group.",
      spec: 'Group type "lshort". 4 wh- questions. Instructions "Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer."' }
  ],
  // ---------- Built-in drills: work fully offline ----------
  SAMPLES: [
    { id: "sr1", kind: "reading", type: "Built-in set 1", title: "Farming upwards",
      paragraphs: [
        { label: "A", text: "For most of history, farms have spread outwards across the land. A newer idea is to stack them upwards. In a vertical farm, crops grow on shelves inside a closed building, often a converted warehouse, under lights that can be tuned to the exact colours plants use. Supporters argue that such farms could bring fresh food closer to the people who eat it, cutting the distance a lettuce travels from field to plate from hundreds of kilometres to a few streets." },
        { label: "B", text: "The method relies on hydroponics, in which roots sit in water enriched with nutrients rather than in soil. Because the water is collected and pumped back round, a vertical farm can use a small fraction of the water needed in an open field. Sealed rooms also keep insects out, so growers rarely need pesticides, and the harvest is not affected by drought, frost or flooding." },
        { label: "C", text: "The main obstacle is energy. Sunlight is free; electric light is not. Lighting and air conditioning together can make up more than half of a vertical farm’s running costs, and several well-funded companies have closed after their electricity bills rose faster than their sales. Critics also point out that if the power comes from burning coal or gas, the environmental gains from saving water and transport may disappear." },
        { label: "D", text: "For now, only certain crops make financial sense. Leafy greens and herbs grow quickly, stay small and sell at high prices, so they repay the cost of the space they occupy. Staple crops such as wheat and rice, by contrast, need large areas, take months to ripen and are cheap to buy, which makes them unsuitable for indoor shelves." },
        { label: "E", text: "Engineers are trying to narrow the gap. Lights have become far more efficient in the past decade, and some farms now sit beside solar or wind installations, or reuse waste heat from nearby factories. Others use software to adjust light and temperature hour by hour. Few experts expect vertical farms to replace traditional agriculture, but many believe they will become a regular part of how cities feed themselves." }
      ],
      groups: [
        { type: "mhead", instructions: "Choose the correct heading for each paragraph. There are more headings than paragraphs.",
          options: ["i The limits of what can be grown profitably", "ii How plants are grown without soil", "iii A rising cost that has closed businesses", "iv Moving food production nearer to consumers", "v Government support for city farms", "vi Efforts to make indoor farming cheaper", "vii The history of greenhouses"],
          questions: [
            { q: "Paragraph A", answer: "iv", explanation: "A: farms could bring fresh food closer to the people who eat it." },
            { q: "Paragraph B", answer: "ii", explanation: "B: hydroponics, roots in water rather than soil." },
            { q: "Paragraph C", answer: "iii", explanation: "C: energy costs; companies closed when bills rose." },
            { q: "Paragraph D", answer: "i", explanation: "D: only certain crops make financial sense." },
            { q: "Paragraph E", answer: "vi", explanation: "E: efficient lights, solar power and software to narrow the cost gap. Heading v is never mentioned." }
          ] },
        { type: "tfng", instructions: "Do the statements agree with the information in the passage? Choose TRUE, FALSE or NOT GIVEN.",
          questions: [
            { q: "The lights in vertical farms can be adjusted to suit the plants.", options: ["TRUE", "FALSE", "NOT GIVEN"], answer: "TRUE", explanation: "A: lights that can be tuned to the exact colours plants use." },
            { q: "Vertical farms need more water than open fields.", options: ["TRUE", "FALSE", "NOT GIVEN"], answer: "FALSE", explanation: "B: they use a small fraction of the water needed in an open field." },
            { q: "Most vertical farms are built in Asia.", options: ["TRUE", "FALSE", "NOT GIVEN"], answer: "NOT GIVEN", explanation: "The passage never says where farms are located." },
            { q: "Some vertical farming companies have stopped trading because of energy costs.", options: ["TRUE", "FALSE", "NOT GIVEN"], answer: "TRUE", explanation: "C: several companies have closed after their electricity bills rose." }
          ] },
        { type: "summ", instructions: "Complete the summary using the list of words A–F.",
          outline: { style: "summary", rows: [["Leafy greens suit vertical farms because they grow [1] and can be sold at [2] prices. Staple crops, however, are [3] to buy and need large areas of land."]] },
          options: ["A quickly", "B slowly", "C high", "D low", "E cheap", "F expensive"],
          questions: [
            { q: "Gap 1", answer: "A", explanation: "D: leafy greens and herbs grow quickly." },
            { q: "Gap 2", answer: "C", explanation: "D: they sell at high prices." },
            { q: "Gap 3", answer: "E", explanation: "D: staple crops are cheap to buy." }
          ] },
        { type: "diag", instructions: "Complete the flow-chart. Choose NO MORE THAN TWO WORDS from the passage.",
          outline: { style: "flowchart", rows: [["Roots sit in water with added [1]"], ["Plants take up what they need"], ["Remaining water is collected and [2]"], ["The same water is used again"]] },
          questions: [
            { q: "Gap 1", answer: "nutrients", explanation: "B: water enriched with nutrients." },
            { q: "Gap 2", answer: "pumped back", alt: ["pumped"], explanation: "B: the water is collected and pumped back round." }
          ] }
      ] },
    { id: "sr2", kind: "reading", type: "Built-in set 2", title: "In defence of boredom",
      paragraphs: [
        { label: "A", text: "We have never had so many ways to avoid boredom. A phone in the pocket means that a queue, a bus journey or a quiet evening can be filled in seconds. Most people regard this as progress. I am not convinced. Boredom, unpleasant as it is, may do us more good than we realise." },
        { label: "B", text: "In one study, psychologist Lena Hart asked two groups of adults to list as many uses as possible for a paper cup. Before starting, one group spent fifteen minutes copying numbers from a phone directory, a deliberately dull job. That group produced noticeably more ideas. Hart concluded that boredom pushes the mind to search for stimulation, and that this search can lead to original thinking." },
        { label: "C", text: "Not everyone agrees. Professor Omar Reyes argues that the effect in such studies is small and short-lived, and that chronic boredom is linked to poor concentration and risky behaviour, especially among teenagers. His point is fair, but it concerns boredom that lasts for months, not the brief, everyday kind that a phone now removes." },
        { label: "D", text: "A third researcher, Mei Tanaka, has studied what happens in the brain when we are left without a task. She found that a set of regions linked to memory and planning becomes more active. In her view, idle moments give the brain time to sort recent experiences and imagine the future." },
        { label: "E", text: "None of this means we should seek out tedium. But I believe schools and parents are wrong to treat every empty moment as a problem to be solved. Children who are always entertained may never learn to entertain themselves. The next time you reach for your phone in a queue, it might be worth leaving it where it is." }
      ],
      groups: [
        { type: "ynng", instructions: "Do the statements agree with the views of the writer? Choose YES, NO or NOT GIVEN.",
          questions: [
            { q: "Being able to avoid boredom is clearly a positive change.", options: ["YES", "NO", "NOT GIVEN"], answer: "NO", explanation: "A: most people think so, but the writer says “I am not convinced.”" },
            { q: "Short periods of boredom can be beneficial.", options: ["YES", "NO", "NOT GIVEN"], answer: "YES", explanation: "A and C: boredom may do us good; the writer defends the brief, everyday kind." },
            { q: "Phones should be banned in schools.", options: ["YES", "NO", "NOT GIVEN"], answer: "NOT GIVEN", explanation: "The writer criticises how schools treat empty moments, but says nothing about banning phones." },
            { q: "Children who are constantly entertained may miss out on an important skill.", options: ["YES", "NO", "NOT GIVEN"], answer: "YES", explanation: "E: they may never learn to entertain themselves." }
          ] },
        { type: "mcq", instructions: "Choose the correct letter, A, B, C or D.",
          questions: [
            { q: "In Hart’s study, the group that first copied numbers", options: ["A produced fewer ideas.", "B produced more ideas.", "C finished the task faster.", "D lost interest in the task."], answer: "B", explanation: "B: that group produced noticeably more ideas." },
            { q: "Why does the writer mention a queue in paragraph E?", options: ["A to describe a common cause of stress", "B to suggest a good moment to accept boredom", "C to criticise people who use phones in public", "D to give an example of chronic boredom"], answer: "B", explanation: "E: it might be worth leaving the phone where it is." }
          ] },
        { type: "mcq2", instructions: "Choose TWO letters, A–E.",
          questions: [
            { q: "Which TWO points does Reyes make?", options: ["A The effect found in studies is minor.", "B Boredom improves memory.", "C Long-term boredom is linked to risky behaviour.", "D Phones make people more creative.", "E Teenagers are rarely bored."], answer: ["A", "C"], explanation: "C: the effect is small and short-lived; chronic boredom is linked to risky behaviour." }
          ] },
        { type: "mfeat", instructions: "Match each statement with the correct researcher, A, B or C.",
          options: ["A Lena Hart", "B Omar Reyes", "C Mei Tanaka"],
          questions: [
            { q: "Boredom may lead people to look for new ideas.", answer: "A", explanation: "B: boredom pushes the mind to search for stimulation." },
            { q: "Certain parts of the brain work harder when we have nothing to do.", answer: "C", explanation: "D: regions linked to memory and planning become more active." },
            { q: "Boredom that lasts a long time can damage concentration.", answer: "B", explanation: "C: chronic boredom is linked to poor concentration." }
          ] },
        { type: "mend", instructions: "Complete each sentence with the correct ending, A–E.",
          options: ["A it was intentionally boring.", "B it improved the participants’ memory.", "C points out that it concerns a different kind of boredom.", "D rejects the way the research was done.", "E to organise experiences and plan ahead."],
          questions: [
            { q: "Copying numbers from a directory was chosen because", answer: "A", explanation: "B: a deliberately dull job." },
            { q: "The writer accepts Reyes’s argument but", answer: "C", explanation: "C: it concerns boredom that lasts for months." },
            { q: "According to Tanaka, idle time allows the brain", answer: "E", explanation: "D: sort recent experiences and imagine the future." }
          ] }
      ] },
    { id: "sr3", kind: "reading", type: "Built-in set 3", title: "The marsh that protects a coast",
      paragraphs: [
        { label: "A", text: "On the northern edge of Wenmouth Bay lies one of the largest salt marshes on the coast, a flat expanse of grasses and muddy channels that floods twice a day with the tide. For centuries local people saw the marsh as wasteland and drained parts of it to create grazing land for sheep." },
        { label: "B", text: "Attitudes changed in the 1990s, when a series of storms broke through the old sea walls and flooded nearby farms. Engineers noticed that the places where marsh remained had suffered far less damage, because the dense vegetation slowed the waves before they reached the land." },
        { label: "C", text: "Today the marsh is managed by the Wenmouth Coastal Trust, which has restored around 300 hectares by deliberately opening gaps in the old sea walls. When the sea flows back in, it carries fine mud that settles among the plant roots. Over about ten years, the surface rises and new grasses take hold." },
        { label: "D", text: "The restored marsh is also a store of carbon. Plant material that falls into the waterlogged mud decays very slowly, so the carbon it contains can remain buried for hundreds of years. Researchers at the trust measure this by taking cores of mud, each one metre long, at sites across the marsh every spring." },
        { label: "E", text: "Visitors can follow a raised wooden path, the Heron Walk, which starts at the visitor centre and ends at a bird hide overlooking the main channel. The trust limits numbers in winter, when thousands of geese arrive to feed." }
      ],
      groups: [
        { type: "minfo", instructions: "Which paragraph contains the following information? Choose A–E.",
          options: ["A", "B", "C", "D", "E"],
          questions: [
            { q: "a description of how scientists collect samples", answer: "D", explanation: "D: taking cores of mud at sites across the marsh." },
            { q: "an example of how the marsh was used in the past", answer: "A", explanation: "A: drained to create grazing land for sheep." },
            { q: "an explanation of how the marsh reduces storm damage", answer: "B", explanation: "B: vegetation slowed the waves." }
          ] },
        { type: "sent", instructions: "Complete the sentences. Choose NO MORE THAN TWO WORDS from the passage.",
          questions: [
            { q: "The trust restores marsh by opening gaps in the old ____.", answer: "sea walls", alt: ["walls"], explanation: "C: opening gaps in the old sea walls." },
            { q: "The sea brings in fine ____ that settles around plant roots.", answer: "mud", explanation: "C: it carries fine mud." },
            { q: "Carbon stays buried because plant material ____ very slowly.", answer: "decays", explanation: "D: decays very slowly." }
          ] },
        { type: "short", instructions: "Answer with NO MORE THAN THREE WORDS AND/OR A NUMBER from the passage.",
          questions: [
            { q: "How long is each core of mud?", answer: "one metre", alt: ["1 metre", "1 m", "1m", "one meter", "1 meter"], explanation: "D: each one metre long." },
            { q: "In which season are the cores taken?", answer: "spring", alt: ["every spring", "in spring"], explanation: "D: every spring." },
            { q: "Which birds arrive in large numbers in winter?", answer: "geese", explanation: "E: thousands of geese arrive to feed." }
          ] },
        { type: "diag", instructions: "Label the diagram of the Heron Walk. Choose ONE WORD ONLY from the passage.",
          outline: { style: "flowchart", rows: [["Visitor centre (start)"], ["Heron Walk: a raised [1] path"], ["Bird [2] at the end"], ["View over the main [3]"]] },
          questions: [
            { q: "Gap 1", answer: "wooden", explanation: "E: a raised wooden path." },
            { q: "Gap 2", answer: "hide", explanation: "E: ends at a bird hide." },
            { q: "Gap 3", answer: "channel", explanation: "E: overlooking the main channel." }
          ] },
        { type: "summ", instructions: "Complete the table. Choose ONE WORD AND/OR A NUMBER from the passage.",
          outline: { style: "table", rows: [["Period", "How the marsh was seen", "What was done"], ["Past centuries", "as [1]", "drained for [2] land"], ["After the 1990s storms", "as protection", "about [3] hectares restored"]] },
          questions: [
            { q: "Gap 1", answer: "wasteland", explanation: "A: saw the marsh as wasteland." },
            { q: "Gap 2", answer: "grazing", alt: ["sheep"], explanation: "A: grazing land for sheep." },
            { q: "Gap 3", answer: "300", alt: ["three hundred"], explanation: "C: around 300 hectares." }
          ] }
      ] },
    { id: "sl1", kind: "listening", type: "Built-in Section 1", title: "Booking a swimming course",
      context: "A man phones a leisure centre to book a course.",
      lines: [
        { speaker: "Receptionist", text: "Good morning, Riverside Leisure Centre. How can I help?" },
        { speaker: "Daniel", text: "Hi. I’d like to book a place on one of your swimming courses for adults." },
        { speaker: "Receptionist", text: "Of course. Can I take your name?" },
        { speaker: "Daniel", text: "Daniel Kowalski. That’s K, O, W, A, L, S, K, I." },
        { speaker: "Receptionist", text: "Thank you. And a contact number?" },
        { speaker: "Daniel", text: "It’s 0 7 9 1 4, 5 5 2, 8 6 0. Sorry, no, the end is 8 6 1." },
        { speaker: "Receptionist", text: "So 07914 552 861. Which course were you interested in? We have improvers and beginners." },
        { speaker: "Daniel", text: "Beginners, please. I can’t really swim at all." },
        { speaker: "Receptionist", text: "No problem. The beginners’ group meets on Tuesday evenings. Oh, sorry, that changed last month. It’s Thursday evenings now, at seven." },
        { speaker: "Daniel", text: "Thursday is fine." },
        { speaker: "Receptionist", text: "The next course starts on the fourteenth of March and runs for eight weeks." },
        { speaker: "Daniel", text: "Great. How much is it?" },
        { speaker: "Receptionist", text: "The full price is sixty pounds, but as you live locally you get the residents’ rate, which is forty-five." },
        { speaker: "Daniel", text: "Even better. My wife thinks I’m doing this for our holiday, but really it’s because my children are learning at school, and I want to swim with them." },
        { speaker: "Receptionist", text: "That’s a lovely reason. For the first lesson, please bring a photo for your membership card. Swimming caps aren’t compulsory, and we only need a medical form if you have a health condition." },
        { speaker: "Daniel", text: "Okay, just a photo. Thanks very much." }
      ],
      groups: [
        { type: "lform", instructions: "Complete the form. Write ONE WORD AND/OR A NUMBER for each answer.",
          outline: { style: "form", rows: [["Surname:", "[1]"], ["Phone:", "[2]"], ["Course level:", "[3]"], ["Day:", "[4] at 7 pm"], ["Start date:", "[5] March"], ["Fee:", "£[6]"]] },
          questions: [
            { q: "Gap 1", answer: "Kowalski", explanation: "Spelled K-O-W-A-L-S-K-I." },
            { q: "Gap 2", answer: "07914 552 861", alt: ["07914552861"], explanation: "He corrects the last digit from 0 to 1." },
            { q: "Gap 3", answer: "beginners", alt: ["beginner"], explanation: "He chooses beginners, not improvers." },
            { q: "Gap 4", answer: "Thursday", alt: ["Thursdays"], explanation: "Tuesday was the old day; it is Thursday now." },
            { q: "Gap 5", answer: "14", alt: ["14th", "fourteenth"], explanation: "Starts on the fourteenth of March." },
            { q: "Gap 6", answer: "45", alt: ["45.00", "forty-five"], explanation: "Sixty is the full price; he pays the residents’ rate." }
          ] },
        { type: "lmcq", instructions: "Choose the correct letter, A, B or C.",
          questions: [
            { q: "Why does Daniel want to learn to swim?", options: ["A for a holiday", "B because a doctor advised it", "C to swim with his children"], answer: "C", explanation: "His wife thinks it is for a holiday, but really it is for his children." },
            { q: "What must he bring to the first lesson?", options: ["A a medical form", "B a swimming cap", "C a photo"], answer: "C", explanation: "Caps are optional; the medical form is only for health conditions." }
          ] }
      ] },
    { id: "sl2", kind: "listening", type: "Built-in Section 2", title: "A guide to Marlow Park",
      context: "A park ranger talks to new volunteers at the main gate.",
      lines: [
        { speaker: "Ranger", text: "Welcome, everyone. We’re standing at the main gate, at the bottom of your map, so let me show you where things are." },
        { speaker: "Ranger", text: "The café is the first thing you’ll notice: it’s immediately on your right as you come in. The toilets are on the other side of the gate, so on your left." },
        { speaker: "Ranger", text: "The lake is right in the middle of the park. If you follow the path round the left side of the lake to the far corner, you’ll reach the playground. The old toilets used to be next to the playground, but they were removed last year." },
        { speaker: "Ranger", text: "And the rose garden sits beside the lake, on its right-hand side, between the lake and the east fence." },
        { speaker: "Ranger", text: "Now, activities. The guided nature walk runs on Saturdays. Outdoor yoga used to be on Saturdays too, but it moved to Mondays this spring. And children’s story time is on Wednesdays, by the café." },
        { speaker: "Ranger", text: "A few rules. Picnics are welcome anywhere, and bicycles are fine on the main paths. Dogs can be off the lead except near the lake. But please don’t feed the ducks, as bread makes them ill, and barbecues are not permitted anywhere in the park." }
      ],
      groups: [
        { type: "lmap", instructions: "Label the map. Choose the correct letter, A–G. You are at the main gate.",
          map: { cols: 3, rows: 3, cells: [{ r: 0, c: 0, t: "A" }, { r: 0, c: 1, t: "B" }, { r: 0, c: 2, t: "C" }, { r: 1, c: 0, t: "D" }, { r: 1, c: 1, t: "Lake" }, { r: 1, c: 2, t: "E" }, { r: 2, c: 0, t: "F" }, { r: 2, c: 1, t: "Main gate" }, { r: 2, c: 2, t: "G" }] },
          options: ["A", "B", "C", "D", "E", "F", "G"],
          questions: [
            { q: "Café", answer: "G", explanation: "Immediately on your right as you come in." },
            { q: "Toilets", answer: "F", explanation: "The other side of the gate, on your left." },
            { q: "Playground", answer: "A", explanation: "Round the left side of the lake to the far corner." },
            { q: "Rose garden", answer: "E", explanation: "Beside the lake on its right-hand side." }
          ] },
        { type: "lmatch", instructions: "When is each activity held? Choose A, B or C.",
          options: ["A Monday", "B Wednesday", "C Saturday"],
          questions: [
            { q: "Guided nature walk", answer: "C", explanation: "Runs on Saturdays." },
            { q: "Outdoor yoga", answer: "A", explanation: "Moved from Saturdays to Mondays." },
            { q: "Children’s story time", answer: "B", explanation: "On Wednesdays." }
          ] },
        { type: "lmcq2", instructions: "Choose TWO letters, A–E.",
          questions: [
            { q: "Which TWO things are not allowed in the park?", options: ["A cycling on the main paths", "B feeding the ducks", "C barbecues", "D dogs off the lead", "E picnics"], answer: ["B", "C"], explanation: "Dogs can be off the lead except near the lake; picnics and cycling are allowed." }
          ] }
      ] },
    { id: "sl3", kind: "listening", type: "Built-in Section 3", title: "Planning a group survey",
      context: "Two students, Aisha and Tom, plan a survey for their sociology assignment.",
      lines: [
        { speaker: "Tom", text: "So, Aisha, we need to decide how we’re going to run the survey on students’ sleep habits." },
        { speaker: "Aisha", text: "Right. I thought we could start with an online questionnaire. It’s quick, and we could get about two hundred responses." },
        { speaker: "Tom", text: "Two hundred sounds ambitious. Our tutor said a hundred and fifty would be enough, so let’s aim for that." },
        { speaker: "Aisha", text: "Fine, a hundred and fifty. The weakness is that people don’t always answer honestly online." },
        { speaker: "Tom", text: "True. That’s why I’d add interviews. They take more time, but we get much more detail. Maybe ten interviews?" },
        { speaker: "Aisha", text: "Let’s say twelve, two from each faculty. The problem is the time it takes to type them up." },
        { speaker: "Tom", text: "And what about a sleep diary? Students record their sleep for a week." },
        { speaker: "Aisha", text: "I like it, but we’d only manage about twenty participants, and some will forget to fill it in." },
        { speaker: "Tom", text: "Okay. For the deadline, the tutor moved it. It was the end of April, but now it’s the ninth of May." },
        { speaker: "Aisha", text: "Good, that gives us time. I’ll design the questionnaire, and you can contact the faculty offices to find volunteers." },
        { speaker: "Tom", text: "Deal. And we should present the results as charts rather than long tables, since the tutor said that’s clearer." }
      ],
      groups: [
        { type: "ltable", instructions: "Complete the table. Write ONE WORD AND/OR A NUMBER for each answer.",
          outline: { style: "table", rows: [["Method", "Number of people", "Main problem"], ["Online questionnaire", "[1]", "answers may not be [2]"], ["Interviews", "[3]", "slow to type up"], ["Sleep [4]", "about 20", "people may [5] to complete it"]] },
          questions: [
            { q: "Gap 1", answer: "150", alt: ["one hundred and fifty", "a hundred and fifty"], explanation: "Aisha suggests 200, but they agree on 150." },
            { q: "Gap 2", answer: "honest", alt: ["honestly"], explanation: "People don’t always answer honestly online." },
            { q: "Gap 3", answer: "12", alt: ["twelve"], explanation: "Tom says ten; Aisha changes it to twelve." },
            { q: "Gap 4", answer: "diary", explanation: "A sleep diary for a week." },
            { q: "Gap 5", answer: "forget", explanation: "Some will forget to fill it in." }
          ] },
        { type: "lsent", instructions: "Complete the sentences. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.",
          questions: [
            { q: "The new deadline is ____.", answer: "9 May", alt: ["9th May", "ninth of May", "the ninth of may", "may 9", "9th of May"], explanation: "Moved from the end of April to the ninth of May." },
            { q: "Tom will contact the ____ to find volunteers.", answer: "faculty offices", alt: ["faculties"], explanation: "You can contact the faculty offices." },
            { q: "The results will be shown as ____.", answer: "charts", explanation: "Charts rather than long tables." }
          ] }
      ] },
    { id: "sl4", kind: "listening", type: "Built-in Section 4", title: "Keeping cities cool",
      context: "Part of a lecture on urban heat.",
      lines: [
        { speaker: "Lecturer", text: "Today I want to look at why cities are often several degrees warmer than the countryside around them, and what we can do about it." },
        { speaker: "Lecturer", text: "The first cause is the surfaces we build with. Dark materials, asphalt in particular, absorb heat during the day and release it at night. The second is the lack of trees, which means there is very little shade." },
        { speaker: "Lecturer", text: "One simple response is the cool roof. Sunlight hits the roof, and a white coating reflects most of it back into the sky. As a result, less heat enters the building, so there is less need for air conditioning." },
        { speaker: "Lecturer", text: "Green roofs work differently. They are covered with plants, which cool the air as water evaporates from their leaves. They also hold rainwater, which reduces the risk of flooding in heavy storms." },
        { speaker: "Lecturer", text: "Here in our city, the council plans to plant twenty thousand trees by 2030. That matters because heat is not only uncomfortable. The group most at risk is elderly people, especially those who live alone." }
      ],
      groups: [
        { type: "lnote", instructions: "Complete the notes. Write ONE WORD ONLY for each answer.",
          outline: { style: "notes", rows: [["Causes of urban heat"], ["• dark surfaces, e.g. [1], store heat"], ["• few [2], so little shade"]] },
          questions: [
            { q: "Gap 1", answer: "asphalt", explanation: "Dark materials, asphalt in particular." },
            { q: "Gap 2", answer: "trees", explanation: "The lack of trees means little shade." }
          ] },
        { type: "lflow", instructions: "Complete the flow-chart. Write NO MORE THAN TWO WORDS for each answer.",
          outline: { style: "flowchart", rows: [["Sunlight hits the roof"], ["A white coating [1] most of it"], ["Less heat enters the building"], ["Less need for [2]"]] },
          questions: [
            { q: "Gap 1", answer: "reflects", explanation: "A white coating reflects most of it." },
            { q: "Gap 2", answer: "air conditioning", alt: ["air-conditioning"], explanation: "Less need for air conditioning." }
          ] },
        { type: "lsumm", instructions: "Complete the summary. Write ONE WORD ONLY for each answer.",
          outline: { style: "summary", rows: [["Green roofs are covered with [1], which cool the air through evaporation. They also store [2], which lowers the risk of flooding."]] },
          questions: [
            { q: "Gap 1", answer: "plants", explanation: "Covered with plants." },
            { q: "Gap 2", answer: "rainwater", alt: ["water"], explanation: "They hold rainwater." }
          ] },
        { type: "lshort", instructions: "Write NO MORE THAN THREE WORDS AND/OR A NUMBER for each answer.",
          questions: [
            { q: "How many trees does the council plan to plant by 2030?", answer: "20000", alt: ["20,000", "twenty thousand"], explanation: "Twenty thousand trees by 2030." },
            { q: "Which group is most at risk from heat?", answer: "elderly people", alt: ["the elderly", "elderly", "older people"], explanation: "Elderly people, especially those living alone." }
          ] }
      ] }
  ],
  // ---------- Writing Task 1: every chart type ----------
  T1KINDS: [["all", "Any type"], ["table", "Table"], ["line", "Line graph"], ["bar", "Bar chart"], ["pie", "Pie charts"], ["process", "Process diagram"], ["map", "Maps"], ["mixed", "Mixed charts"]],
  TASK1X: [
    { kind: "line", q: "The graph below shows the number of visitors to three museums in one city between 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      charts: [{ kind: "line", unit: "visitors (millions)", cols: ["Museum", "2000", "2005", "2010", "2015", "2020"], rows: [["Science Museum", "2.1", "2.4", "3.0", "3.6", "3.2"], ["Art Gallery", "3.5", "3.3", "3.1", "3.4", "3.9"], ["History Museum", "1.2", "1.5", "1.4", "1.9", "2.6"]] }] },
    { kind: "bar", q: "The chart below shows the percentage of students at one university who chose each type of accommodation in 2010 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      charts: [{ kind: "bar", unit: "% of students", cols: ["Accommodation", "2010", "2020"], rows: [["Campus halls", "45", "38"], ["Shared flat", "30", "41"], ["Family home", "20", "15"], ["Other", "5", "6"]] }] },
    { kind: "pie", q: "The pie charts below show the main sources of electricity in one country in 2000 and 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      charts: [{ kind: "pie", unit: "% of electricity", cols: ["Source", "2000", "2020"], rows: [["Coal", "52", "24"], ["Gas", "28", "35"], ["Nuclear", "12", "10"], ["Renewables", "8", "31"]] }] },
    { kind: "process", q: "The diagram below shows how rainwater is collected and used in a house. Summarise the information by selecting and reporting the main features.",
      charts: [{ kind: "process", steps: ["Rain falls on the roof", "Gutters carry the water to a downpipe", "A filter removes leaves and dirt", "Water is stored in an underground tank", "A pump sends water to the toilets and garden", "Extra water overflows into a drain"] }] },
    { kind: "process", q: "The diagram below shows the stages in making clay bricks. Summarise the information by selecting and reporting the main features.",
      charts: [{ kind: "process", steps: ["Clay is dug from the ground", "Clay is mixed with sand and water", "Mixture is shaped in moulds or cut with wire", "Bricks are dried for two days", "Bricks are fired in a kiln", "Bricks are cooled", "Bricks are packed and delivered"] }] },
    { kind: "map", q: "The maps below show the village of Elton in 2000 and today. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      charts: [{ kind: "map", maps: [{ title: "2000", grid: [["Farmland", "Farmland", "Forest"], ["Shops", "Main road", "Farmland"], ["Houses", "Main road", "School"]] }, { title: "Today", grid: [["Housing estate", "Car park", "Forest"], ["Shopping centre", "Main road", "Sports centre"], ["Houses", "Main road", "School"]] }] }] },
    { kind: "mixed", q: "The chart below shows the number of passengers using one train company, and the table shows passenger satisfaction, from 2016 to 2020. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.",
      charts: [{ kind: "bar", unit: "passengers (millions)", cols: ["Year", "Passengers"], rows: [["2016", "12"], ["2017", "14"], ["2018", "15"], ["2019", "17"], ["2020", "9"]] },
        { kind: "table", unit: "% satisfied", cols: ["Aspect", "2016", "2020"], rows: [["Punctuality", "71", "84"], ["Cleanliness", "65", "80"], ["Ticket price", "48", "42"]] }] }
  ],
  // ---------- Writing Task 2: more questions, including positive/negative ----------
  TASK2X: [
    { type: "posneg", q: "In many countries, more people now work from home rather than in an office. Is this a positive or negative development?" },
    { type: "posneg", q: "Online shopping is replacing traditional shops in many towns. Is this a positive or negative development?" },
    { type: "opinion", q: "Governments should spend more money on public transport than on building new roads. To what extent do you agree or disagree?" },
    { type: "discussion", q: "Some people think tourism brings many benefits to local communities, while others believe it causes more problems. Discuss both views and give your own opinion." },
    { type: "advdis", q: "Many young people now get their news from social media rather than from newspapers or television. Do the advantages of this outweigh the disadvantages?" },
    { type: "problem", q: "In many cities, young people find it increasingly difficult to afford housing. What are the causes of this problem, and what solutions can you suggest?" },
    { type: "twopart", q: "Many people now live far away from their parents and relatives. Why is this happening? What effects does it have on family relationships?" }
  ],
  TYPE_NAMES: { posneg: "Positive or negative development", task1_line: "Task 1: line graph", task1_bar: "Task 1: bar chart", task1_pie: "Task 1: pie charts", task1_table: "Task 1: table", task1_process: "Task 1: process", task1_map: "Task 1: maps", task1_mixed: "Task 1: mixed charts" },
  PLANS: {
    posneg: ["Introduction: paraphrase the statement and say clearly whether it is mainly positive or mainly negative.", "Body 1: the strongest reason for your view, explained, with a specific example.", "Body 2: admit one point on the other side, then explain why it matters less.", "Conclusion: restate your view in new words."],
    task1_trend: ["Introduction: paraphrase what the chart shows (what, where, when).", "Overview: 2 main features, e.g. the biggest change and the highest or lowest item. No numbers needed here.", "Body 1: details of the first group, with figures and comparisons.", "Body 2: details of the rest, with figures. No opinions and no conclusion."],
    task1_process: ["Introduction: paraphrase what the diagram shows.", "Overview: how many stages, where it starts and where it ends.", "Body 1: the first half of the stages, in order, using the passive (is collected) and sequencers (first, next).", "Body 2: the remaining stages to the end."],
    task1_map: ["Introduction: paraphrase what the maps show and the years.", "Overview: the 2 biggest changes, e.g. more housing and fewer farms.", "Body 1: changes in one area, using was replaced by, was converted into, was built.", "Body 2: changes in the other areas, and what stayed the same."]
  },
  // ---------- Speaking: answer frameworks by question type ----------
  SPEAK_TYPES: {
    1: [
      { t: "Likes and preferences", how: "Direct answer → reason → small example.", ex: "Yes, I really enjoy cooking, mainly because it helps me relax after work. Last weekend, for instance, I made biryani for my family." },
      { t: "Habits and frequency", how: "How often → when or where → why.", ex: "I read most days, usually on the bus, because it’s the only quiet time I get." },
      { t: "Past and present", how: "Then → now → reason for the change.", ex: "As a child I hardly used computers, but now I spend most of my day on one because of my job." }
    ],
    2: [
      { t: "Cue card (2 minutes)", how: "Opening line → each bullet in order → spend longest on the “explain” point → finish with a feeling or reflection. Use past tenses for past events.", ex: "I’d like to talk about learning to drive, which took me almost two years…" }
    ],
    3: [
      { t: "Opinion", how: "Clear view → reason → example → qualifier (although…).", ex: "I’d say online learning is useful, mainly because it is flexible, although it can feel isolating." },
      { t: "Compare (past/now, two groups)", how: "State the main difference → explain why → give an example.", ex: "Young people today are far more comfortable with technology than their grandparents, largely because they grew up with it." },
      { t: "Predict the future", how: "Likely change → reason → condition.", ex: "I think more people will probably work remotely, as long as internet access keeps improving." },
      { t: "Causes and effects", how: "Main cause → second cause → result.", ex: "One reason is the cost of housing; another is longer working hours. As a result, people marry later." },
      { t: "Solutions and evaluation", how: "Solution → how it works → limitation.", ex: "Cheaper public transport would help, because it gives people an alternative, though it would need government funding." },
      { t: "Hypothetical", how: "If + past, would + verb → reason → example.", ex: "If I could change one thing about schools, I would reduce homework, because children need time to play." }
    ]
  }
};
