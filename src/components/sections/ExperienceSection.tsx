import { TerminalPrompt } from '../TerminalPrompt';

export function ExperienceSection() {
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
  ├── Printer network installation and troubleshooting
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

  return (
    <div className="space-y-4">
      <TerminalPrompt
        command="tail -f experience.log"
        output={experienceOutput}
        showCursor={false}
      />
    </div>
  );
}