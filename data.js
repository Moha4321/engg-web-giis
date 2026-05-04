// --- START OF FILE data.js ---

export const clubData = {
    // ==========================================
    // 1. HOME PAGE CONTENT
    // ==========================================
    home: {
        hero: {
            overline: "Engineering Through Failure // Club Proposal",
            headline: "Building <span class='text-orange'>Thinkers,</span><br>Not Just Students.",
            subheadline: "This isn't your average school science club. <strong>We want our students to fail. Yes, we said it right: F A I L.</strong> Failure is the single most important concept in all of engineering. If you don't fail, you don't learn. And that's where most generic science, robotics, or physics clubs go wrong: <span class='text-red'>Too much theory, too little thinking.</span>",
            stats:[
                { value: "100%", label: "Failure Rate Required", color: "text-green" },
                { value: "3.0", label: "Core Loop Phases", color: "text-orange" }
            ]
        },
        constraints:[
            { id: "Var_01", title: "Time Crunch", color: "orange", desc: "Critical thinking happens when the clock starts running out of time. Deadlines are absolute." },
            { id: "Var_02", title: "Limited Materials", color: "blue", desc: "Less is often more, and that’s true with engineering; the real thinking happens when there’s less to work with." },
            { id: "Var_03", title: "Outrageously Small Budget", color: "green", desc: "When the budget is tight, outrageous ideas take over. Creativity replaces convenience." }
        ],
        philosophy:[
            { title: "Why Failure Matters", color: "orange", desc: "Failure is the foundation of real engineering learning. Students only truly grasp concepts when their ideas break — and they're forced to ask why." },
            { title: "Our Approach", color: "green", desc: "Time pressure forces fast decisions. Limited materials simulate real constraints. Low budgets demand creativity over convenience." },
            { title: "The Problem With Traditional Clubs", color: "red", desc: "Too much theory, too little doing. Passive learning produces passive thinkers — no real-world stakes, no genuine problem-solving." },
            { title: "The Core Loop", color: "blue", desc: "Idea → Build → Fail → Analyze → Improve → Compete. True learning doesn't happen during instruction — it happens during iteration." }
        ],
        telemetry:[
            { key: "PRB_SLV", val: "Break down complex, open-ended challenges." },
            { key: "TEAM_WK", val: "Collaborate under real time pressure." },
            { key: "DSN_THK", val: "Iterate from idea to prototype repeatedly." },
            { key: "CRT_THK", val: "Evaluate trade-offs, challenge assumptions." },
            { key: "LDR_SHP", val: "Step up, delegate, and take ownership." },
            { key: "TEC_LIT", val: "Develop fluency with materials & constraints." }
        ]
    },

    // ==========================================
    // 2. PERSONNEL CONTENT
    // ==========================================
    operators:[
        { name: "Vivaan Keluskar", role: "Physics Guide & Challenge Designer" },
        { name: "Laeem Khan", role: "Guide & Session Planner" },
        { name: "Buvan Senthil Vinayakam", role: "Guide & Challenge Designer" },
        { name: "Mohana Rangan Desigan", role: "Math Guide & Session Planner" },
        { name: "Ziwen An", role: "Guide & Analyst" },
        { name: "Dharanevasan S.", role: "Materials, Logistics & Web Manager" },
        { name: "Adhvaith V. Saravanan", role: "Guide & Materials and Logistics" },
        { name: "Shora Uchida", role: "Guide & Website Manager" },
        { name: "Shaurya Shukla", role: "Guide & Social Media" }
    ],

    crew:[
        "Aaradhya Akabari", "Aarsh Jayswal", "Adam Widad", "Adhyayan Akabari", 
        "Ahaan Rudra", "Areeba Khan", "Arkin Bhadauria", "Bhrainaa Pillai", 
        "Chirayu Gupta", "Dahye Choi", "Daichi David Ingram", "Mahir Tazwar", 
        "Pragatheesh Rangan Desigan", "Rayden Dsilva", "Reva Pushpahas", 
        "Rimi Kawamoto", "Samika Karthik", "Sosuke Iyoda", "Tanisha Velu"
    ],

    // ==========================================
    // 3. MISSION LOGS (SESSIONS)
    // ==========================================
    sessions:[
        {
            id: "01",
            title: "Session 1 (Egg Drop) Challenge",
            date: "2026, April 21st | Tuesday | 15:30-16:30",
            status: "COMPLETED",
            agenda: "Drop the egg from the third floor, and make it land safely, using only normal stationery items.",
            presentationUrl: null, // No presentation for Session 1
            logs:[
                {
                    team: "Team 1",
                    description: "Focused on maximum protection through layering. The egg was placed in a plastic bag, heavily wrapped in newspaper and tape, with a water balloon at the base to absorb impact. No parachute was used, relying entirely on cushioning.",
                    assets:[
                        { type: "image", url: "assets/placeholder1.jpg" }, // Add your real image paths here
                        { type: "gdrive-video", url: "https://drive.google.com/file/d/1s-triVlH-90hukmeoRzxOiYIFG1EIjvc/preview" },
                        { type: "gdrive-video", url: "https://drive.google.com/file/d/1Psg4ECnFS2A94ExjmNTcw3r3zDEGDzg9/preview" }
                        
                    ]
                },
                {
                    team: "Team 2",
                    description: "Designed for controlled descent and lift. A cardboard basket with newspaper cushioning was paired with two plastic bag parachutes to increase drag, along with two balloons to provide additional buoyancy.",
                    assets:[
                        { type: "image", url: "assets/placeholder2.jpg" }
                    ]
                },
                {
                    team: "Team 3",
                    description: "Designed for controlled descent and lift. A cardboard basket with newspaper cushioning was paired with two plastic bag parachutes to increase drag, along with two balloons to provide additional buoyancy.",
                    assets:[
                        { type: "image", url: "assets/placeholder2.jpg" }
                    ]
                }
            ]
        },
        {
            id: "02",
            title: "Session 2 (Egg Drop) Post-Mortem",
            date: "2026, April 28th",
            status: "ACTIVE",
            agenda: "Understand the physics and math behind what factors affect the egg's survivability, analyse each team's solution in depth, and come up with the best possible solution.",
            // Embed URL for Google Slides (Go to File > Share > Publish to web > Embed)
            presentationUrl: "https://docs.google.com/presentation/d/e/2PACX-1vQWsq5_O7bdNDR4Fq0dCXGVwWOiZBu3qfak-187boMbYRWOxiqu12DZD4CdLY_Ds7wY1HxlTf98KVNx/embed?start=false&loop=false&delayms=3000",            
            logs:[] // Empty because this session is presentation-focused
        }
    ]
};