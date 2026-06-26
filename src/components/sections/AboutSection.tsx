import { TerminalPrompt } from '../TerminalPrompt';
import { useSiteContentMap } from '@/hooks/useSiteContent';

export function AboutSection() {
  const { contentMap: profile } = useSiteContentMap('profile');
  const { contentMap: about } = useSiteContentMap('about');

  const name = profile['profile_name'] || 'Jerin M R';
  const role = profile['profile_role'] || 'L1 IT Professional';
  const focus = profile['profile_focus'] || 'Networking, Server Administration, Cloud Infrastructure & Cybersecurity';
  const philosophy = about['profile_philosophy'] || '';
  const hobbies = about['profile_hobbies'] || '';
  const interests = about['profile_interests'] || '';

  const hobbiesList = hobbies.split(',').map(h => `• ${h.trim()}`).join('\n');
  const interestsList = interests.split(',').map(i => `• ${i.trim()}`).join('\n');

  const aboutOutput = `
╭─ Personal Information ─────────────────────────────────────────────╮
│                                                                    │
│  Name: ${name.padEnd(51)}│
│  Role: ${role.padEnd(51)}│
│  Focus: ${focus.padEnd(50)}│
│                                                                    │
│                                                                    │
╰────────────────────────────────────────────────────────────────────╯

Education:
├── Advanced Diploma in Networking (Sep 2024 - May 2025)
│   ├── Institution: Synenfo Solutions, Ernakulam
│   ├── Coursework: CompTIA A+, CCNA, RHCE, AWS
│   └── Focus: Enterprise networking and cloud technologies
│
├── Diploma in Computer Engineering (Sep 2021 - Jun 2024)
│   ├── Institution: Govt Polytechnic College, Kunnamkulam
│   ├── GPA: 8.45/10.0
│   └── Specialization: Computer systems and networking fundamentals
│
└── Vocational Higher Secondary (Jun 2019 - Jun 2021)
    ├── Institution: Govt VHS School, Thrissur
    ├── NSQF: Field Technician
    └── Focus: Hardware & Network Essentials

Personal Philosophy:
"${philosophy}"

Hobbies:
${hobbiesList}

Interests:
${interestsList}
`;

  return (
    <div className="space-y-4">
      <TerminalPrompt
        command="cat about.txt"
        output={aboutOutput}
        showCursor={false}
      />
    </div>
  );
}
