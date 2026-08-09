import { Router } from "express";

const chatRouter = Router();

function generateReply(userMessage: string): string {
  const msg = userMessage.toLowerCase().trim();

  if (msg.match(/\b(hi|hello|hey|howdy|sup|yo)\b/)) {
    return "Hey there! 👋 I'm Udayraj's AI assistant. Ask me anything about him — his projects, interests, background, or this portfolio!";
  }

  if (msg.match(/who (is|are) udayraj|tell me about (him|udayraj)|about (him|udayraj)|introduce/)) {
    return "Udayraj is a curious student, explorer, and builder who loves understanding how things work and turning ideas into real projects. His ideas are currently bigger than his skillset — and that's exactly why he's constantly learning. 🚀";
  }

  if (msg.match(/birthday|born|birth date|age/)) {
    return "Udayraj's birthday is November 9! 🎂";
  }

  if (msg.match(/mission|goal|future|dream|aspir|universe|astronomy|space|physics/)) {
    return "Udayraj wants to explore the universe. Astronomy and physics aren't just interests — they're what he hopes to spend a significant part of his life understanding. He wants to build technology that helps people learn and experience the universe in new ways. 🌌";
  }

  if (msg.match(/skill|tech|stack|language|framework|tool|know|use|built with/)) {
    return "Udayraj's skills include: JavaScript, Python, C++, HTML, CSS, React, Vite, Tailwind, Framer Motion, Node.js, REST APIs, Express, AI/ML, and UI/UX Design. He loves combining technical skills with great design! 💻";
  }

  if (msg.match(/project|work|built|made|creat|portfolio/)) {
    return "Udayraj's projects: 🌌 Cosmos (AI platform on Google Cloud Run), 🔢 ChromaCalc (AI calculator), 🔥 Flames (interactive game), 🛸 UFO Files (immersive web experience), 🛍️ PinDeals (deals platform), and 🍎 this macOS Portfolio. Open the Projects app to explore them all!";
  }

  if (msg.match(/cosmos/)) {
    return "Cosmos is Udayraj's full-stack AI platform — live on Google Cloud Run. It handles model inference and provides real-time AI responses through a polished React frontend. Visit: cosmos-115619459091.asia-southeast1.run.app 🌌";
  }

  if (msg.match(/chromacalc|calculator/)) {
    return "ChromaCalc is an AI-powered calculator built on Google AI Studio. It supports natural language math and features a chromatic, colorful UI. Visit: chromacalc.ai.studio 🔢";
  }

  if (msg.match(/pindeals|deals/)) {
    return "PinDeals is a deals discovery platform with a Pinterest-style grid UI that curates better offers than Amazon. Visit: udayk7r3992.github.io/pinterest/ 🛍️";
  }

  if (msg.match(/contact|email|reach|hire|freelan|job|opportunit/)) {
    return "You can reach Udayraj at udayrajk007@gmail.com, on GitHub at github.com/udayk7r3992, LinkedIn at linkedin.com/in/udayraj-singh-9b604b3b5, or on X (Twitter) at @udayraj67. He's open to exciting opportunities! 📬";
  }

  if (msg.match(/gmail/)) {
    return "Udayraj's Gmail is udayrajk007@gmail.com — feel free to reach out! 📧";
  }

  if (msg.match(/github/)) {
    return "Udayraj's GitHub is github.com/udayk7r3992 — check out his repos! 🐙";
  }

  if (msg.match(/linkedin/)) {
    return "Udayraj is on LinkedIn at linkedin.com/in/udayraj-singh-9b604b3b5. Connect and say hi! 💼";
  }

  if (msg.match(/twitter|x\.com|\@udayraj/)) {
    return "Udayraj is on X (Twitter) at @udayraj67 — follow him at x.com/udayraj67 🐦";
  }

  if (msg.match(/discord/)) {
    return "Udayraj's Discord username is udayraj0575. You can copy it from the Contact app! 💬";
  }

  if (msg.match(/reddit/)) {
    return "Udayraj's Reddit is u/Cube_solver23. He's a cuber! 🤖";
  }

  if (msg.match(/interest|hobby|like|love|passion|fun|outside/)) {
    return "Udayraj's interests include AI, AI Agents, Machine Learning, Astronomy, Physics, Quantum Mechanics, Robotics, Space Exploration, Mechanical Engineering, 3D Design, Cars & Engines, and Product Building. For hobbies: Rubik's Cubes (50s solve!), Chess, Reading, Travel, Formula 1, and Cricket! 🎯";
  }

  if (msg.match(/rubik|cube|cubing|puzzle/)) {
    return "Udayraj can solve a standard 3×3 Rubik's Cube in around 50 seconds! He's also explored 2×2, Pyraminx, Megaminx, and other twisty puzzles. His obsession eventually inspired the Rubik's Cube AI Coach project. 🎲";
  }

  if (msg.match(/chess/)) {
    return "Chess is one of Udayraj's favourite games! He enjoys it as both a hobby and a mental challenge. You can open the Chess app on this desktop to play on Chess.com! ♟️";
  }

  if (msg.match(/formula.?1|f1|racing|car/)) {
    return "Udayraj loves Formula 1! It combines his interests in engineering, technology, and high-performance mechanics. 🏎️";
  }

  if (msg.match(/personality|trait|character|describe/)) {
    return "Udayraj is an Explorer, Builder, Curious mind, Continuous Learner, Problem Solver, Pattern Seeker, Overthinker, and Experimenter. One sentence that captures him: 'My ideas are currently bigger than my skillset. I'm working on fixing that.' 🧠";
  }

  if (msg.match(/achievement|award|certificate|olymp|gold/)) {
    return "Udayraj won 🥇 Gold at the U-19 AI Olympics by Tensor School of CS & AI — ranked in the TOP 25. He also completed the be10x AI Tools & ChatGPT Workshop certificate in August 2026. Check the Photos → Certs tab to see them!";
  }

  if (msg.match(/education|degree|college|university|school|study/)) {
    return "Udayraj is a student with a strong focus on CS, AI, and self-driven learning. He's always exploring new technologies and doing more things at the same time than is probably reasonable! 📚";
  }

  if (msg.match(/engineer|mechanical|robotics|hardware|tinkering|3d pen/)) {
    return "Udayraj has always been curious about how physical things work. He once opened an old phone just to see what was inside! He enjoys mechanical systems, robotics, engineering, engines, hardware, and building physical things with his 3D pen. ⚙️";
  }

  if (msg.match(/this (site|website|portfolio)|how (was|is) this (made|built)|macos|desktop/)) {
    return "This portfolio is built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion — running as a full macOS desktop simulation with boot screen, lock screen, draggable windows, Spaces, Spotlight, Dock, and an AI chatbot (that's me!). 🍎";
  }

  if (msg.match(/app|finder|safari|terminal|photos|truck|game|launchpad|download|chess|duolingo|notes/)) {
    return "The desktop has many apps: 🗂️ Finder, 🌐 Safari, 💻 Terminal, 🎵 Music, 🌸 Photos, 🚛 Truck Game, 📥 Downloads, 🚀 Launchpad, ♟️ Chess, 🦉 Duolingo, 📝 Notes, 🎲 Rubik's AI Coach, and more! Click any dock icon or use Spotlight (Cmd+Space) to open them.";
  }

  if (msg.match(/wallpaper|background|desktop/)) {
    return "You can change the wallpaper from the Control Center (top-right) — choose from 6 built-in themes (Sunset, Aurora, Deep Space, Ocean, Forest, Rose Gold) or upload your own photo! 🎨";
  }

  if (msg.match(/spaces|desktop.*switch|virtual desk/)) {
    return "This portfolio supports multiple virtual desktops (Spaces)! Use Ctrl+← → to switch, or open Mission Control from the top-right menu. You can even create new desktops with the + button! 🖥️";
  }

  if (msg.match(/thank|thanks|great|awesome|nice|cool|wow|amazing/)) {
    return "Happy to help! 😊 Feel free to explore the desktop apps or ask me anything else about Udayraj.";
  }

  if (msg.match(/bye|goodbye|see you|cya|later/)) {
    return "Goodbye! Thanks for visiting Udayraj's portfolio. Feel free to reach out at udayrajk007@gmail.com! 👋";
  }

  if (msg.match(/help|what can you|what do you know|what (can|should) i ask/)) {
    return "Ask me about: Udayraj's biography, interests, hobbies, skills, projects (Cosmos, ChromaCalc, Flames, UFO Files, PinDeals, macOS Portfolio), achievements (AI Olympics Gold!), contact info, or anything about this portfolio! 🤔";
  }

  if (msg.match(/motivat|drive|why|what (makes|keeps)/)) {
    return "Udayraj is motivated by Curiosity, Learning, Building, and Exploring. He's the kind of person who asks 'How does it work?' the moment something catches his attention — and then immediately asks 'Can I build something around this?' 🔍";
  }

  if (msg.match(/overthin|think too much/)) {
    return "Absolutely — Udayraj admits to being an overthinker! Fortunately, most of that overthinking eventually becomes projects. 🧠✨";
  }

  return "Great question! I know all about Udayraj — his skills, projects, interests, achievements, and this portfolio. Try asking about his AI Olympics gold, favourite hobbies, projects like Cosmos or ChromaCalc, or how to contact him! 😊";
}

chatRouter.post("/chat", async (req, res) => {
  const { messages } = req.body as { messages: { role: string; content: string }[] };

  if (!Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: "messages array required" });
    return;
  }

  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  if (!lastUserMessage) {
    res.status(400).json({ error: "No user message found" });
    return;
  }

  const apiKey = process.env["GEMINI_API_KEY"];

  if (apiKey && apiKey.length > 10) {
    const systemPrompt = `You are a helpful AI assistant built into Udayraj's macOS-style interactive portfolio website. Answer questions about Udayraj warmly, concisely, and enthusiastically.

Here's everything you know about Udayraj and this portfolio:

PERSONAL PROFILE:
- Name: Udayraj Singh (goes by Udayraj)
- Birthday: November 9
- Role: Student · Explorer · Builder
- Short Bio: A curious student who loves exploring ideas, understanding how things work, and turning those ideas into real projects. Most of his ideas are currently bigger than his skillset — and that's exactly why he's constantly learning.
- One-liner: "My ideas are currently bigger than my skillset. I'm working on fixing that."
- Long-term mission: Wants to explore the universe. Astronomy and physics aren't just interests — they're what he hopes to spend a significant part of his life understanding. He wants to build technology that helps people learn, explore, and experience the universe in new ways.

PERSONALITY:
Explorer, Builder, Curious, Continuous Learner, Problem Solver, Pattern Seeker, Overthinker, Experimenter.
When something catches his attention, his first instinct is "How does it work?" — then immediately "Can I build something around this?"

INTERESTS:
Artificial Intelligence, AI Agents, Machine Learning, Coding, Technology, Robotics, Astronomy, Physics, Quantum Mechanics, Mechanical Engineering, Space Exploration, Cars & Engines, 3D Design, Consumer Technology, Product Building, Books, Travel, Food, Pattern Recognition, Content Creation, Learning New Skills.

HOBBIES:
Building side projects, Rubik's Cubes (solves 3×3 in ~50 seconds! Also: 2×2, Pyraminx, Megaminx), Chess, Reading books, Traveling, Trying new food, Mechanical tinkering, Learning new technologies, Meeting new people, Formula 1, Cricket, Basketball.

SKILLS:
JavaScript, Python, C++, HTML, CSS, React, Vite, Tailwind CSS, Framer Motion, Node.js, REST APIs, Express, AI/ML, UI/UX Design, 3D Design, Robotics.

PROJECTS:
1. Cosmos — Full-stack AI platform on Google Cloud Run. https://cosmos-115619459091.asia-southeast1.run.app
2. ChromaCalc — AI calculator on Google AI Studio. https://chromacalc.ai.studio
3. Flames — Interactive game on AI Studio. https://flames-interactive-game.ai.studio
4. UFO Files — Immersive web experience. https://prj-4tjxabu6-frontend.flames.app
5. PinDeals — Deals discovery platform (HTML/CSS). https://udayk7r3992.github.io/pinterest/
6. macOS Portfolio — This site! React + Vite + Tailwind + Framer Motion. https://document-parser--udaykhurana20.replit.app/

ACHIEVEMENTS / CERTIFICATES:
- 🥇 U-19 AI Olympics Gold — Tensor School of CS & AI · June 21, 2026 · Ranked TOP 25 · Verify: https://ai-camp26.flames.app/verify/i5P2Bg5gXf
- 🎓 be10x AI Tools Workshop Certificate — August 2, 2026 · Verify: https://certx.in/certificate/0270772f-3809-4400-b29b-1e1c61cd09971624118

SOCIAL LINKS:
- GitHub: github.com/udayk7r3992
- LinkedIn: linkedin.com/in/udayraj-singh-9b604b3b5
- Gmail: udayrajk007@gmail.com
- X (Twitter): @udayraj67 — x.com/udayraj67?s=11
- Reddit: u/Cube_solver23
- Discord: udayraj0575

PORTFOLIO APPS:
About Me, Projects, Contact, Terminal (try 'neofetch'!), Finder, Safari, Photos (with Certs tab), Music (28 songs!), Resume, Calendar, Clock, Truck Game, Downloads, Launchpad, Chess, Duolingo, Notes, Rubik's Cube AI Coach.

PORTFOLIO FEATURES:
- Boot screen → Lock screen → Full macOS Desktop
- Draggable windows, virtual desktops (Spaces), Spotlight (Cmd+Space), Mission Control
- Dark/Light mode, 6 wallpapers + custom upload, battery indicator, Do Not Disturb
- Konami code easter egg (↑↑↓↓←→←→BA), AI chatbot (me!), live GitHub stats in Finder

Keep answers to 2-4 sentences. Be friendly, enthusiastic, and never fabricate information!`;

    const contents = messages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemPrompt }] },
            contents,
            generationConfig: { maxOutputTokens: 300, temperature: 0.8 },
          }),
        }
      );

      if (response.ok) {
        const data = (await response.json()) as {
          candidates: { content: { parts: { text: string }[] } }[];
        };
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          res.json({ reply });
          return;
        }
      }
    } catch {
      // fall through to rule-based
    }
  }

  // Rule-based fallback
  await new Promise((r) => setTimeout(r, 400));
  const reply = generateReply(lastUserMessage.content);
  res.json({ reply });
});

export default chatRouter;
