import { useState } from 'react';
import { TerminalPrompt } from '../TerminalPrompt';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Send, Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useSiteContentMap } from '@/hooks/useSiteContent';
export function ProfileInfoSection() {
  const [message, setMessage] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitted) return;
    setSubmitted(true);
    try {
      const { error } = await supabase.functions.invoke('send-contact-message', {
        body: { name: contactName.trim(), email: contactEmail.trim(), message: message.trim() },
      });
      if (error) throw error;
      toast.success("Message sent successfully! You'll hear back within 24 hours.");
      setMessage('');
      setContactName('');
      setContactEmail('');
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Failed to send message. Please try emailing directly.');
    } finally {
      setSubmitted(false);
    }
  };

  const whoisOutput = `
┌─ WHOIS LOOKUP RESULT ─────────────────────────────────────────────┐
│                                                                   │
│  Query: jerinmr                                                   │
│  Registrant: Jerin M R                                            │
│  Status: Active Professional Profile                              │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

Registry Information:
├── Contact Details
│   ├── Email     : jerinmr@hotmail.com
│   ├── Phone     : +91 8848158987
│   ├── Location  : Thrissur, Kerala, India
│   └── Timezone  : IST (UTC+5:30)
│
├── Professional Networks
│   └── LinkedIn  : linkedin.com/in/jerinmr51
│
├── Availability
│   ├── Email     : 24/7 (Response within 24 hours)
│   ├── Phone     : Mon-Fri 9AM-6PM IST
│   └── LinkedIn  : 24/7 (Response within 12 hours)
│
└── Service Status
    ├── Connection : Active
    ├── Response   : Optimal
    └── Uptime     : 99.9%

Preferred Contact Methods:
1. Email (Professional inquiries & opportunities)
2. LinkedIn (Professional networking)
3. Phone (Urgent matters - business hours only)
`;

  const { contentMap: profile } = useSiteContentMap('profile');
  const { contentMap: about } = useSiteContentMap('about');

  const name = profile['profile_name'] || 'Jerin M R';
  const role = profile['profile_role'] || 'Entry-Level IT Professional';
  const focus = profile['profile_focus'] || 'Networking, Server Administration, Cloud Infrastructure & Cybersecurity';
  const philosophy = about['profile_philosophy'] || '';
  const hobbies = about['profile_hobbies'] || '';
  const interests = about['profile_interests'] || '';

  const hobbiesList = hobbies.split(',').map(h => `• ${h.trim()}`).join('\n');
  const interestsList = interests.split(',').map(i => `• ${i.trim()}`).join('\n');

  const skillsData = [
    {
      category: "Systems Administration",
      subcategories: [
        {
          name: "Operating Systems",
          skills: [
            { name: "Linux (Ubuntu, CentOS, RHEL-based, OpenSUSE)", level: 85 },
            { name: "Windows Server 2022 and Windows Client OS", level: 80 }
          ]
        },
        {
          name: "Scripting & Automation", 
          skills: [
            { name: "Bash Scripting", level: 75 },
            { name: "PowerShell", level: 65 },
            { name: "Python (Basic)", level: 50 }
          ]
        },
        {
          name: "System Management",
          skills: [
            { name: "User Account & Group Management", level: 85 },
            { name: "Partition & File System Management", level: 80 },
            { name: "Service Management", level: 85 },
            { name: "Network Profile Management", level: 70 },
            { name: "Security (SELinux, Antivirus, System FW)", level: 75 }
          ]
        }
      ]
    },
    {
      category: "Networking",
      subcategories: [
        {
          name: "Cisco Technologies",
          skills: [
            { name: "Cisco IOS", level: 90 },
            { name: "VLANs, STP", level: 85 },
            { name: "EtherChannel", level: 80 },
            { name: "Switch Configuration", level: 88 }
          ]
        },
        {
          name: "Routing Protocols",
          skills: [
            { name: "OSPF", level: 85 },
            { name: "EIGRP", level: 70 },
            { name: "Static Routing", level: 90 }
          ]
        },
        {
          name: "Protocols & Standards",
          skills: [
            { name: "IPv4/IPv6 Subnetting", level: 90 },
            { name: "TCP/IP Stack", level: 85 },
            { name: "DNS, DHCP Configuration", level: 80 },
            { name: "HSRP (Hot Standby)", level: 70 },
            { name: "GLBP (Gateway Load)", level: 55 },
            { name: "VRRP (Virtual Router)", level: 60 }
          ]
        }
      ]
    },
    {
      category: "Computer Hardware",
      subcategories: [
        {
          name: "",
          skills: [
            { name: "PC Assembly and Disassembly", level: 85 },
            { name: "BIOS/UEFI Configuration", level: 80 },
            { name: "Hardware Troubleshooting and Diagnostics", level: 75 }
          ]
        }
      ]
    },
    {
      category: "Cloud Technologies",
      subcategories: [
        {
          name: "Amazon Web Services (AWS)",
          skills: [
            { name: "EC2 (Compute)", level: 80 },
            { name: "S3 (Storage)", level: 75 },
            { name: "IAM (Identity)", level: 80 },
            { name: "VPC (Networking)", level: 70 }
          ]
        },
        {
          name: "Virtualization",
          skills: [
            { name: "VMware Workstation", level: 85 },
            { name: "VirtualBox", level: 90 }
          ]
        }
      ]
    },
    {
      category: "Troubleshooting & Monitoring",
      subcategories: [
        {
          name: "System Analysis",
          skills: [
            { name: "Log Analysis", level: 85 },
            { name: "Performance Monitoring", level: 70 },
            { name: "Network Diagnostics", level: 80 }
          ]
        },
        {
          name: "Documentation",
          skills: [
            { name: "Technical Writing", level: 85 },
            { name: "Network Diagrams", level: 70 },
            { name: "Issue Tracking", level: 80 }
          ]
        }
      ]
    }
  ];

  const renderSkillBar = (level: number) => {
    return (
      <div className="flex items-center gap-2 w-full">
        <div className="flex-1 bg-muted rounded-sm h-2 overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${level}%` }}
          />
        </div>
        <span className="text-muted-foreground text-xs min-w-[3ch] text-right">{level}%</span>
      </div>
    );
  };

  const aboutOutput = `
╭─ Personal Information ─────────────────────────────────────────────╮
│                                                                    │
│  Name: ${name.padEnd(51)}│
│  Role: ${role.padEnd(51)}│
│  Focus: ${focus.padEnd(50)}│
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

  const experienceOutput = `
┌─ EMPLOYMENT HISTORY ──────────────────────────────────────────────┐
│                                                                   │
│  Displaying work timeline from experience.log                    │
│  Format: [TIMESTAMP] [COMPANY] [ROLE] [LOCATION]                 │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

[2024-10-01 TO 2025-04-30] PERFECT GROUP - Service Trainee
Location: Ernakulam, Kerala


╭─ Role Overview ───────────────────────────────────────────────────╮
│ Comprehensive hands-on training in enterprise IT infrastructure  │
│ Focus on networking, hardware management, and system support     │
╰───────────────────────────────────────────────────────────────────╯

Key Responsibilities:
▸ Layer 1/2 Network Management
  ├── Configured and maintained enterprise switches
  ├── Implemented VLAN segmentation for department isolation  
  ├── Troubleshot connectivity issues across multiple floors
  └── Documented network topology and cable management

▸ Hardware & Peripherals Support
  ├── Desktop/laptop setup and configuration
  ├── POS system deployment and maintenance
  ├── Printer network integration and troubleshooting
  └── Hardware inventory management and asset tracking

Learning Outcomes:
• Gained practical experience with enterprise-grade equipment
• Developed troubleshooting methodology for complex issues
• Enhanced communication skills working with end users
• Learned importance of documentation in IT operations

┌─ EDUCATION & TRAINING ────────────────────────────────────────────┐
│                                                                   │
│  Concurrent advanced networking training program                  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘

[2024-09-01 TO 2025-05-31] SYNENFO SOLUTIONS - Advanced Diploma
Program: Networking & Infrastructure Specialization
Location: Ernakulam, Kerala

Core Modules:
• CompTIA A+ (Hardware & Software Fundamentals)
• CCNA (Cisco Certified Network Associate)
• RHCE (Red Hat Certified Engineer)
• AWS Cloud Practitioner & Associate
Practical Labs:
• 200+ hours of hands-on lab work
• Real-world scenario simulations
• Industry-standard equipment training
`;

  const skillsOutput = (
    <div className="space-y-4 text-sm">
      {skillsData.map((category, catIndex) => (
        <div key={catIndex} className="space-y-2">
          <div className="text-primary font-semibold">├── {category.category}</div>
          {category.subcategories.map((subcategory, subIndex) => (
            <div key={subIndex} className="ml-4 space-y-1">
              {subcategory.name && (
                <div className="text-muted-foreground">│   ├── {subcategory.name}</div>
              )}
              {subcategory.skills.map((skill, skillIndex) => (
                <div key={skillIndex} className="ml-2 sm:ml-8 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <span className="text-muted-foreground min-w-0 text-xs sm:text-sm truncate">
                    {skillIndex === subcategory.skills.length - 1 ? '└──' : '├──'} {skill.name}
                  </span>
                  <div className="flex-1 max-w-[200px] min-w-[100px] ml-4 sm:ml-0">
                    {renderSkillBar(skill.level)}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
      
      <div className="mt-6 space-y-2">
        <div className="text-primary font-semibold">Professional Development:</div>
        <div className="ml-4 space-y-1 text-muted-foreground">
          <div>• Hands-on lab environments for practical learning</div>
          <div>• Contributing to open-source networking projects</div>
          <div>• Active member of local IT communities</div>
          <div>• Continuous learning through online platforms and documentation</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* About Section */}
      <div className="space-y-4">
        <TerminalPrompt
          command="cat about.txt"
          output={aboutOutput}
          showCursor={false}
        />
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="text-primary font-mono text-sm">user@portfolio:~$ ls -la skills/</div>
          <div className="bg-terminal-bg p-2 sm:p-4 rounded-lg font-mono text-xs sm:text-sm overflow-x-auto">
            {skillsOutput}
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="space-y-4">
        <TerminalPrompt
          command="cat experience.log"
          output={experienceOutput}
          showCursor={false}
        />
      </div>

      {/* Whois / Contact Section */}
      <div className="space-y-6">
        <TerminalPrompt
          command="whois jerinmr"
          output={whoisOutput}
          showCursor={false}
        />

        <div className="border border-terminal-green p-3 sm:p-4 bg-card/50">
          <div className="font-mono text-terminal-green mb-4 text-xs sm:text-sm break-all">
            guest@jerinmr.myabouts:~/contact$ nano message.txt
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-mono text-terminal-cyan mb-2">Name:</label>
                <Input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="font-mono bg-background border-terminal-gray"
                  placeholder="Enter your name"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label className="block text-sm font-mono text-terminal-cyan mb-2">Email:</label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="font-mono bg-background border-terminal-gray"
                  placeholder="your.email@domain.com"
                  required
                  maxLength={255}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-mono text-terminal-cyan mb-2">Message:</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="font-mono bg-background border-terminal-gray min-h-[120px]"
                placeholder="Type your message here..."
                required
                maxLength={2000}
              />
            </div>

            <div className="flex items-center gap-4">
              <Button
                type="submit"
                disabled={submitted}
                className="font-mono bg-terminal-green text-background hover:bg-terminal-green-bright"
              >
                <Send className="w-4 h-4 mr-2" />
                {submitted ? 'Sending...' : 'send message.txt'}
              </Button>
              <div className="text-sm text-terminal-gray font-mono">
                {submitted ? 'Transmitting...' : `${message.length}/2000`}
              </div>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <a href="mailto:jerinmr@hotmail.com" className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 border border-terminal-cyan rounded bg-card/30 hover:bg-terminal-cyan hover:text-background transition-colors">
            <Mail className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="font-mono text-xs sm:text-sm">Email</span>
          </a>
          <a href="tel:+918848158987" className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 border border-terminal-blue rounded bg-card/30 hover:bg-terminal-blue hover:text-background transition-colors">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="font-mono text-xs sm:text-sm">Call</span>
          </a>
          <a href="https://linkedin.com/in/jerinmr51" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 border border-terminal-magenta rounded bg-card/30 hover:bg-terminal-magenta hover:text-background transition-colors">
            <Linkedin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="font-mono text-xs sm:text-sm">LinkedIn</span>
          </a>
          <div className="flex items-center justify-center gap-1 sm:gap-2 p-2 sm:p-3 border border-terminal-gray rounded bg-card/30 text-terminal-gray">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="font-mono text-xs sm:text-sm">Thrissur, KL</span>
          </div>
        </div>
      </div>
    </div>
  );
}
